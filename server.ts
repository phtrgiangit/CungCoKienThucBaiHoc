import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Check API status or test an API key
app.post("/api/verify-key", async (req, res) => {
  try {
    const { apiKey, model = "gemini-3.1-flash-lite" } = req.body;
    const effectiveKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        error: "Chưa có API key. Vui lòng nhập API key của bạn hoặc cấu hình GEMINI_API_KEY trong hệ thống.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const candidateModels = [
      model || "gemini-3.1-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let verifyResponse: any = null;
    let verifyError: any = null;

    for (const cand of candidateModels) {
      try {
        console.log(`[verify-key] Testing model: ${cand}`);
        verifyResponse = await ai.models.generateContent({
          model: cand,
          contents: "Chào bạn! Hãy trả lời ngắn: 'API Key hợp lệ.'",
        });
        console.log(`[verify-key] Result for ${cand}:`, verifyResponse?.text);
        if (verifyResponse?.text) {
          verifyError = null;
          break;
        }
      } catch (err: any) {
        verifyError = err;
        console.error(`[verify-key] Error for ${cand}:`, err?.message || err);
      }
    }

    if (!verifyResponse?.text) {
      let errText = verifyError?.message || "Không thể kết nối đến mô hình Gemini.";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) errText = parsed.error.message;
      } catch {}
      return res.status(400).json({
        success: false,
        error: errText,
      });
    }

    return res.json({
      success: true,
      message: verifyResponse.text?.trim() || "API Key hợp lệ.",
      usingDefault: !apiKey || !apiKey.trim(),
    });
  } catch (error: any) {
    console.error("API Key verification failed:", error);
    let errMsg = error?.message || "Không thể xác thực API Key với mô hình đã chọn.";
    try {
      const parsed = JSON.parse(errMsg);
      if (parsed?.error?.message) errMsg = parsed.error.message;
    } catch {}
    return res.status(400).json({
      success: false,
      error: errMsg,
    });
  }
});

// Generate quiz strictly from document
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const {
      apiKey,
      model = "gemini-3.8-flash",
      documentText,
      documentFile, // { name, mimeType, base64 }
      numQuestions = 10,
      difficulty = "normal", // 'easy' | 'normal' | 'hard'
      timeMinutes = 15,
      topicName = "",
    } = req.body;

    const effectiveKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      return res.status(400).json({
        error: "Vui lòng nhập API Key của Gemini hoặc cung cấp biến môi trường GEMINI_API_KEY.",
      });
    }

    if (!documentText && !documentFile?.base64) {
      return res.status(400).json({
        error: "Vui lòng cung cấp nội dung kiến thức hoặc tải lên tài liệu học tập.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const count = Math.min(Math.max(Number(numQuestions) || 5, 1), 20);

    const difficultyTextMap: Record<string, string> = {
      easy: "DỄ (Mức độ Nhận biết: Kiểm tra nhớ và định vị chính xác định nghĩa, số liệu, sự kiện có sẵn trong tài liệu)",
      normal: "BÌNH THƯỜNG (Mức độ Thông hiểu: Yêu cầu hiểu bản chất, so sánh, phân biệt các dữ kiện trong tài liệu)",
      hard: "KHÓ (Mức độ Vận dụng và Phân tích logic: Đòi hỏi suy luận mối quan hệ nhân quả, bài toán hoặc phân tích sâu dựa trên nền tảng kiến thức của tài liệu)",
    };

    const targetDifficulty = difficultyTextMap[difficulty] || difficultyTextMap.normal;

    const systemInstruction = `Bạn là chuyên gia khảo thí và biên soạn đề kiểm tra trắc nghiệm chuẩn THPT Quốc gia Việt Nam.
NGUYÊN TẮC BẮT BUỘC TUYỆT ĐỐI:
1. TOÀN BỘ ${count} CÂU HỎI VÀ ĐÁP ÁN CHỈ ĐƯỢC RÚT RA VÀ DỰA TRÊN NỘI DUNG TÀI LIỆU DO NGƯỜI DÙNG CUNG CẤP.
2. TUYỆT ĐỐI KHÔNG TỰ THÊM VÀO DỮ KIỆN HAY KIẾN THỨC NGOÀI PHẠM VI TÀI LIỆU. Nếu tài liệu không nhắc tới điều gì, không được hỏi điều đó.
3. Mỗi câu hỏi phải có đúng 4 phương án lựa chọn: [A, B, C, D].
4. Chỉ có DUY NHẤT 1 phương án đúng, được chỉ định qua index 'correctAnswer' (0 cho A, 1 cho B, 2 cho C, 3 cho D).
5. Các phương án sai (nhiễu) phải có tính sư phạm, trông thuyết phục nhưng sai lệch rõ ràng so với tài liệu.
6. Mỗi câu hỏi BẮT BUỘC phải có:
   - 'explanation': Lời giải thích logic chi tiết, phân tích rõ tại sao phương án đúng là chính xác và các phương án kia sai.
   - 'quoteReference': Câu trích dẫn hoặc đoạn văn ngắn từ tài liệu chứng minh cho đáp án này.
7. Mức độ câu hỏi: ${targetDifficulty}.
8. Ngôn ngữ: Tiếng Việt chuẩn mực, cú pháp rõ ràng, phù hợp học sinh THPT.`;

    const parts: any[] = [];

    if (documentFile?.base64 && documentFile?.mimeType) {
      parts.push({
        inlineData: {
          mimeType: documentFile.mimeType,
          data: documentFile.base64,
        },
      });
    }

    let promptText = `Hãy đọc kỹ toàn bộ tài liệu đính kèm và tạo chính xác ${count} câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D).\n`;
    if (topicName) {
      promptText += `Chủ đề bài học: "${topicName}".\n`;
    }
    if (documentText) {
      promptText += `\n--- NỘI DUNG TÀI LIỆU KIẾN THỨC BẮT BUỘC DỰA VÀO ---\n${documentText}\n--- HẾT TÀI LIỆU ---\n`;
    }
    promptText += `\nYêu cầu:
- Số lượng: đúng ${count} câu hỏi.
- Độ khó: ${targetDifficulty}.
- Đảm bảo tính khoa học, chuẩn xác theo tài liệu.
- Định dạng JSON trả về theo Schema được yêu cầu.`;

    parts.push({ text: promptText });

    const selectedModel = model || "gemini-3.1-flash-lite";

    // Build candidate fallback models list in case primary model suffers high demand (HTTP 503)
    const candidateModels = [
      selectedModel,
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    const schemaConfig = {
      type: Type.OBJECT,
      properties: {
        quizTitle: {
          type: Type.STRING,
          description: "Tiêu đề bài kiểm tra trắc nghiệm dựa trên tài liệu",
        },
        summary: {
          type: Type.STRING,
          description: "Tóm tắt ngắn gọn trọng tâm kiến thức của tài liệu (1-2 câu)",
        },
        questions: {
          type: Type.ARRAY,
          description: "Danh sách các câu hỏi trắc nghiệm",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: {
                type: Type.STRING,
                description: "Nội dung câu hỏi trắc nghiệm",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Mảng chứa đúng 4 lựa chọn A, B, C, D",
              },
              correctAnswer: {
                type: Type.INTEGER,
                description: "Chỉ số đáp án đúng (0 cho A, 1 cho B, 2 cho C, 3 cho D)",
              },
              explanation: {
                type: Type.STRING,
                description: "Lời giải thích logic chi tiết tại sao đáp án này đúng",
              },
              quoteReference: {
                type: Type.STRING,
                description: "Trích dẫn bằng chứng cụ thể từ nội dung tài liệu",
              },
              difficultyLabel: {
                type: Type.STRING,
                description: "Nhãn độ khó: Dễ, Bình thường hoặc Khó",
              },
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "quoteReference"],
          },
        },
      },
      required: ["quizTitle", "questions"],
    };

    let response: any = null;
    let lastError: any = null;
    let successfulModel = selectedModel;

    for (const candModel of candidateModels) {
      try {
        successfulModel = candModel;
        response = await ai.models.generateContent({
          model: candModel,
          contents: { parts },
          config: {
            systemInstruction,
            temperature: 0.3, // Lower temperature for high factuality from document
            responseMimeType: "application/json",
            responseSchema: schemaConfig,
          },
        });

        if (response && response.text) {
          break; // Generation succeeded!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${candModel} failed, trying next candidate fallback...`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      let errMsg = lastError?.message || "Mô hình AI không trả về nội dung kết quả.";
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) {
          errMsg = parsed.error.message;
        }
      } catch {}
      throw new Error(`Không thể tạo câu hỏi (${successfulModel}): ${errMsg}`);
    }

    let rawText = response.text.trim();
    // Clean potential markdown code blocks
    rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

    // Isolate outer JSON block if there's any surrounding text
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }

    const quizData = JSON.parse(rawText);

    // Validate and sanitize questions
    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Không thể tạo câu hỏi từ tài liệu. Vui lòng kiểm tra lại độ dài hoặc nội dung tài liệu.");
    }

    quizData.questions = quizData.questions.map((q: any, idx: number) => ({
      id: idx + 1,
      question: q.question || `Câu hỏi ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ["A", "B", "C", "D"],
      correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0,
      explanation: q.explanation || "Giải thích đang được cập nhật.",
      quoteReference: q.quoteReference || "Trích từ tài liệu bài học.",
      difficultyLabel: q.difficultyLabel || difficulty,
    }));

    return res.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`,
        title: quizData.quizTitle || (topicName ? `Trắc nghiệm: ${topicName}` : "Đề trắc nghiệm củng cố kiến thức"),
        summary: quizData.summary || "",
        numQuestions: quizData.questions.length,
        timeMinutes: Number(timeMinutes) || 15,
        difficulty,
        createdAt: new Date().toISOString(),
        questions: quizData.questions,
      },
    });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({
      error: error?.message || "Đã xảy ra lỗi khi tạo đề trắc nghiệm bằng AI. Vui lòng thử lại.",
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction =
    process.env.NODE_ENV === "production" ||
    fs.existsSync(path.join(distPath, "index.html"));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Mode: ${isProduction ? "production" : "development"})`);
  });
}

export default app;

// Only start standalone HTTP server if not in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  startServer();
}
