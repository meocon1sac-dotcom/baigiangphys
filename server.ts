import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey =
    (customApiKey && typeof customApiKey === "string" && customApiKey.trim().length > 0)
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API Route: Validate Gemini API Key
  app.post("/api/gemini/validate", async (req, res) => {
    try {
      const customApiKey =
        (req.headers["x-gemini-api-key"] as string) || req.body.apiKey;

      const ai = getGeminiClient(customApiKey);
      if (!ai) {
        return res.status(400).json({
          valid: false,
          error: "Vui lòng nhập Gemini API Key để kiểm tra.",
        });
      }

      const testRes = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: "Xin chào, hãy trả lời 'OK' bằng 1 từ duy nhất.",
      });

      return res.json({
        valid: true,
        model: "gemini-3.7-flash",
        sampleResponse: testRes.text?.trim() || "OK",
      });
    } catch (err: any) {
      console.error("API Key Validation error:", err);
      return res.status(400).json({
        valid: false,
        error:
          err?.message ||
          "API Key không hợp lệ hoặc đã hết hạn mức. Vui lòng kiểm tra lại.",
      });
    }
  });

  // API Route: Generate complete Physics lesson
  app.post("/api/physics/generate-lesson", async (req, res) => {
    try {
      const {
        topic,
        subTopic,
        gradeLevel = "lop10",
        duration = "45min",
        method = "5e_model",
        branch = "mechanics",
        customNotes = "",
        apiKey,
      } = req.body;

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Chủ đề bài giảng là bắt buộc." });
      }

      const customApiKey = (req.headers["x-gemini-api-key"] as string) || apiKey;
      const ai = getGeminiClient(customApiKey);

      const gradeMap: Record<string, string> = {
        lop6_9: "THCS (Lớp 6-9)",
        lop10: "THPT - Lớp 10 (Chương trình mới GDPT 2018)",
        lop11: "THPT - Lớp 11 (Chương trình mới GDPT 2018)",
        lop12: "THPT - Lớp 12 (Chương trình mới GDPT 2018)",
        daihoc: "Đại học / Chuyên ngành Vật lý",
        daichung: "Phổ thông đại chúng / Khám phá khoa học",
      };

      const durationMap: Record<string, string> = {
        "15min": "15 phút (Bài giảng nhanh / Vi mô)",
        "45min": "45 phút (1 tiết chuẩn trên lớp)",
        "90min": "90 phút (Chuyên đề / 2 tiết tích hợp)",
        project: "Dự án học tập STEM nhiều buổi",
      };

      const methodMap: Record<string, string> = {
        "5e_model": "Mô hình 5E (Engage - Explore - Explain - Elaborate - Evaluate)",
        stem_hands_on: "Phương pháp giáo dục STEM thực hành & chế tạo",
        standard_theory: "Lý thuyết kết hợp bài tập chuẩn Bộ GD&ĐT",
        interactive_discovery: "Dạy học khám phá & mô phỏng tương tác",
      };

      const prompt = `Bạn là một Chuyên gia Sư phạm Vật lý hàng đầu và Nhà thiết kế Giáo án AI. 
Hãy soạn một BÀI GIẢNG VẬT LÝ TOÀN DIỆN, CHUYÊN SÂU VÀ ĐẸP MẮT bằng tiếng Việt theo các tiêu chí sau:

- Chủ đề chính: "${topic}"
${subTopic ? `- Chủ đề nhánh/trọng tâm: "${subTopic}"` : ""}
- Cấp độ/Lớp học: ${gradeMap[gradeLevel] || gradeLevel}
- Thời lượng tiết học: ${durationMap[duration] || duration}
- Phương pháp giảng dạy chủ đạo: ${methodMap[method] || method}
- Nhánh Vật lý: ${branch}
${customNotes ? `- Yêu cầu bổ sung của giáo viên: "${customNotes}"` : ""}

YÊU CẦU ĐẦU RA JSON CHUẨN XÁC:
1. "overview":
   - "title": Tên bài giảng hấp dẫn, chuẩn sư phạm.
   - "abstract": Tóm tắt nội dung cốt lõi và ý nghĩa thực tiễn (3-4 câu).
   - "knowledgeObjectives": Danh sách 3-5 mục tiêu về KIẾN THỨC.
   - "skillObjectives": Danh sách 3-4 mục tiêu về KĨ NĂNG (tính toán, thí nghiệm, mô hình hóa).
   - "attitudeObjectives": Danh sách 2-3 mục tiêu về PHẨM CHẤT & THÁI ĐỘ (tò mò, yêu khoa học, an toàn).
   - "prerequisites": 2-3 kiến thức tiên quyết cần ôn lại.
   - "keyFormulas": Danh sách các công thức trọng tâm kèm tên, công thức LaTeX chuẩn (ví dụ $F = m.a$), và giải thích các đại lượng.
2. "activities": Danh sách các hoạt động học tập tương ứng với các pha sư phạm (Khởi động, Khám phá, Hình thành kiến thức, Luyện tập, Vận dụng). Mỗi hoạt động gồm phaseName, durationMinutes, teacherAction, studentAction, keyContent, pedagogicalTip.
3. "slides": Tạo từ 5 đến 7 slide bài giảng chất lượng cao. Mỗi slide có:
   - slideNumber: số thứ tự (1, 2, 3...)
   - title: Tiêu đề slide
   - subtitle: Phụ đề ngắn
   - bulletPoints: 3-4 ý chính súc tích, dễ hiểu
   - formulaLatex: Công thức nổi bật (nếu có)
   - keyConcept: Khái niệm chốt
   - realWorldApplication: Ứng dụng thực tế đời sống
   - presenterNotes: Lời giảng chi tiết gợi ý cho giáo viên đứng lớp
   - visualType: 'diagram' | 'formula' | 'experiment' | 'summary'
4. "simulation": Chọn loại mô phỏng thích hợp nhất trong các loại: "projectile" (ném xiên/ngang), "pendulum" (con lắc đơn/lò xo), "circuits" (mạch điện Ôm), "optics_snell" (khúc xạ ánh sáng), "free_fall" (rơi tự do/trọng lực), "wave_interference" (sóng và giao thoa).
   - title: Tên mô phỏng
   - description: Hướng dẫn học sinh thao tác tương tác
   - initialParams: Đối tượng các tham số số học ban đầu (vd: angle: 45, velocity: 20, gravity: 9.8...)
   - paramLabels: Mô tả chi tiết từng tham số gồm { label, min, max, step, unit }
5. "quizzes": 4-5 câu hỏi trắc nghiệm kiểm tra hiểu biết, gồm options (4 lựa chọn A, B, C, D), correctIndex (0-3), explanation (giải thích chi tiết từng bước), hint (gợi ý), difficulty ('easy' | 'medium' | 'hard').
6. "problems": 2 bài toán Vật lý điển hình có lời giải mẫu: problemStatement, givenData (danh sách {symbol, value, unit, description}), requiredToFind, formulaList, steps ({stepNumber, title, calculation, explanation}), finalAnswer.
7. "mindMap": Cây bản đồ tư duy { id, label, description, formula, children: [...] } có ít nhất 3 nhánh con chính.
8. "experimentalGuide": Hướng dẫn thí nghiệm thực hành { title, toolsNeeded: [...], safetyPrecautions: [...], steps: [...], expectedPhenomenon, errorAnalysis }.
9. "summaryTakeaways": 4-5 điểm ghi nhớ cốt lõi kết bài.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    abstract: { type: Type.STRING },
                    knowledgeObjectives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    skillObjectives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    attitudeObjectives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    prerequisites: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    keyFormulas: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          latex: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      phaseName: { type: Type.STRING },
                      durationMinutes: { type: Type.NUMBER },
                      teacherAction: { type: Type.STRING },
                      studentAction: { type: Type.STRING },
                      keyContent: { type: Type.STRING },
                      pedagogicalTip: { type: Type.STRING },
                    },
                  },
                },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      slideNumber: { type: Type.NUMBER },
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      bulletPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      formulaLatex: { type: Type.STRING },
                      keyConcept: { type: Type.STRING },
                      realWorldApplication: { type: Type.STRING },
                      presenterNotes: { type: Type.STRING },
                      diagramDescription: { type: Type.STRING },
                      visualType: { type: Type.STRING },
                    },
                  },
                },
                simulation: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    initialParams: {
                      type: Type.OBJECT,
                      properties: {
                        v0: { type: Type.NUMBER },
                        angle: { type: Type.NUMBER },
                        gravity: { type: Type.NUMBER },
                        length: { type: Type.NUMBER },
                        mass: { type: Type.NUMBER },
                        resistance: { type: Type.NUMBER },
                        voltage: { type: Type.NUMBER },
                        refractionN1: { type: Type.NUMBER },
                        refractionN2: { type: Type.NUMBER },
                      },
                    },
                    paramLabels: {
                      type: Type.OBJECT,
                      properties: {
                        v0: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            min: { type: Type.NUMBER },
                            max: { type: Type.NUMBER },
                            step: { type: Type.NUMBER },
                            unit: { type: Type.STRING },
                          },
                        },
                        angle: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            min: { type: Type.NUMBER },
                            max: { type: Type.NUMBER },
                            step: { type: Type.NUMBER },
                            unit: { type: Type.STRING },
                          },
                        },
                        gravity: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            min: { type: Type.NUMBER },
                            max: { type: Type.NUMBER },
                            step: { type: Type.NUMBER },
                            unit: { type: Type.STRING },
                          },
                        },
                      },
                    },
                  },
                },
                quizzes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctIndex: { type: Type.NUMBER },
                      explanation: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                    },
                  },
                },
                problems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      problemStatement: { type: Type.STRING },
                      givenData: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            symbol: { type: Type.STRING },
                            value: { type: Type.STRING },
                            unit: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                        },
                      },
                      requiredToFind: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      formulaList: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      steps: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            stepNumber: { type: Type.NUMBER },
                            title: { type: Type.STRING },
                            calculation: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                          },
                        },
                      },
                      finalAnswer: { type: Type.STRING },
                    },
                  },
                },
                mindMap: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    description: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          label: { type: Type.STRING },
                          description: { type: Type.STRING },
                          formula: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                experimentalGuide: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    toolsNeeded: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    safetyPrecautions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    expectedPhenomenon: { type: Type.STRING },
                    errorAnalysis: { type: Type.STRING },
                  },
                },
                summaryTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        });

        const textOutput = response.text || "{}";
        const parsed = JSON.parse(textOutput);

        const fullLesson = {
          id: `lesson_${Date.now()}`,
          topic,
          subTopic,
          gradeLevel,
          duration,
          method,
          branch,
          createdAt: new Date().toISOString(),
          ...parsed,
        };

        return res.json({ lesson: fullLesson });
      } else {
        // High-quality fallback when API key is not yet set
        const fallbackLesson = generateFallbackLesson(topic, branch, gradeLevel, duration, method);
        return res.json({ lesson: fallbackLesson, fallback: true });
      }
    } catch (error: any) {
      console.error("Error generating lesson:", error);
      res.status(500).json({
        error: "Không thể tạo bài giảng: " + (error?.message || "Lỗi máy chủ"),
      });
    }
  });

  // API Route: AI Physics Assistant Chat
  app.post("/api/physics/chat", async (req, res) => {
    try {
      const { messages, lessonContext, apiKey } = req.body;
      const customApiKey = (req.headers["x-gemini-api-key"] as string) || apiKey;
      const ai = getGeminiClient(customApiKey);

      if (!ai) {
        return res.json({
          reply: "🤖 Trợ lý Vật lý AI sẵn sàng giải đáp! Bạn có thể nhập **Gemini API Key** ở góc trên màn hình để kích hoạt toàn bộ trí tuệ nhân tạo Gemini 3.7 Flash.",
        });
      }

      const systemInstruction = `Bạn là Trợ lý AI Chuyên gia Giảng dạy Vật lý (PhysiBot).
Nhiệm vụ của bạn là hỗ trợ giáo viên và học sinh:
- Giải thích các định luật, hiện tượng vật lý dễ hiểu, trực quan, có ví dụ đời sống.
- Hướng dẫn phương pháp giảng dạy sư phạm sáng tạo, mẹo ghi nhớ công thức.
- Giải chi tiết bài tập vật lý từng bước kèm công thức LaTeX ($công thức$).
${lessonContext ? `Ngữ cảnh bài giảng hiện tại: "${JSON.stringify(lessonContext).slice(0, 1500)}"` : ""}
Hãy trả lời thân thiện, chuẩn xác khoa học và truyền cảm hứng. Sử dụng định dạng Markdown và công thức LaTeX khi cần.`;

      const lastUserMsg = messages[messages.length - 1]?.content || "";

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: lastUserMsg,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text || "Không có câu trả lời." });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PhysiCraft AI Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackLesson(topic: string, branch: string, gradeLevel: string, duration: string, method: string) {
  return {
    id: `lesson_fallback_${Date.now()}`,
    topic,
    subTopic: "Khái niệm và Định luật cơ bản",
    gradeLevel,
    duration,
    method,
    branch,
    createdAt: new Date().toISOString(),
    overview: {
      title: `Bài giảng Chuyên đề: ${topic}`,
      abstract: `Bài học cung cấp kiến thức nền tảng và chuyên sâu về ${topic}, liên hệ trực tiếp giữa lý thuyết toán học vật lý và các hiện tượng thực tiễn trong công nghệ và đời sống.`,
      knowledgeObjectives: [
        `Hiểu rõ bản chất vật lý và ý nghĩa của các đại lượng trong chủ đề ${topic}.`,
        `Nắm vững các định luật cốt lõi và phạm vi áp dụng.`,
        `Phân tích được mối liên hệ giữa các đại lượng động lực học và năng lượng.`
      ],
      skillObjectives: [
        "Vận dụng công thức để giải quyết các bài toán định tính và định lượng.",
        "Đọc, vẽ và phân tích đồ thị biến thiên của các đại lượng vật lý.",
        "Thao tác thí nghiệm ảo, thu thập số liệu và rút ra kết luận quy luật."
      ],
      attitudeObjectives: [
        "Hình thành tư duy phản biện khoa học và sự say mê khám phá tự nhiên.",
        "Nhận thức được vai trò của Vật lý trong cuộc sống và kỹ thuật hiện đại."
      ],
      prerequisites: [
        "Kiến thức đại số, hình học phẳng và vectơ cơ bản.",
        "Khái niệm hệ quy chiếu, vận tốc và gia tốc."
      ],
      keyFormulas: [
        {
          name: "Định luật II Newton",
          latex: "\\vec{F} = m \\cdot \\vec{a}",
          explanation: "Gia tốc của một vật cùng hướng với lực tác dụng, độ lớn tỉ lệ thuận với lực và tỉ lệ nghịch với khối lượng."
        },
        {
          name: "Động năng và Công cơ học",
          latex: "W_d = \\frac{1}{2} m v^2 \\quad;\\quad A = F \\cdot s \\cdot \\cos(\\alpha)",
          explanation: "Năng lượng chuyển động của vật và công thực hiện bởi lực F trên quãng đường s."
        },
        {
          name: "Bảo toàn cơ năng",
          latex: "W = W_d + W_t = \\text{const}",
          explanation: "Trong hệ kín chỉ chịu tác dụng của lực thế, tổng động năng và thế năng không đổi."
        }
      ]
    },
    activities: [
      {
        id: "act_1",
        phaseName: "1. Khởi động (Engage)",
        durationMinutes: 7,
        teacherAction: "Chiếu video hiện tượng thực tế và đặt câu hỏi gợi mở tạo xung đột nhận thức.",
        studentAction: "Quan sát, thảo luận nhóm đôi và đưa ra các giả thuyết ban đầu.",
        keyContent: "Tạo sự tò mò về hiện tượng vật lý trong tự nhiên.",
        pedagogicalTip: "Khuyến khích mọi ý kiến dù đúng hay sai để kích thích tư duy."
      },
      {
        id: "act_2",
        phaseName: "2. Khám phá (Explore)",
        durationMinutes: 13,
        teacherAction: "Giao nhiệm vụ tương tác với phòng thí nghiệm ảo và bảng ghi nhận số liệu.",
        studentAction: "Thay đổi các tham số trên mô phỏng, ghi nhận dữ liệu và tìm quy luật toán học.",
        keyContent: "Tự tay làm thí nghiệm số và rút ra mối tương quan giữa các biến số.",
        pedagogicalTip: "Hướng dẫn học sinh phương pháp kiểm soát biến số (giữ cố định 1 biến, thay đổi biến còn lại)."
      },
      {
        id: "act_3",
        phaseName: "3. Hình thành kiến thức (Explain)",
        durationMinutes: 12,
        teacherAction: "Dẫn dắt chuẩn hóa kiến thức, suy luận logic toán học và giới thiệu công thức chuẩn.",
        studentAction: "Đối chiếu giả thuyết ban đầu, ghi chép định luật và các lưu ý về đơn vị SI.",
        keyContent: "Định nghĩa chính xác, biểu thức vectơ và điều kiện áp dụng định luật.",
        pedagogicalTip: "Nhấn mạnh ý nghĩa vật lý thay vì chỉ học vẹt công thức toán."
      },
      {
        id: "act_4",
        phaseName: "4. Luyện tập (Elaborate)",
        durationMinutes: 8,
        teacherAction: "Đưa ra bài toán tình huống và câu hỏi tương tác trắc nghiệm nhanh.",
        studentAction: "Làm việc cá nhân, trình bày lời giải và phân tích các trường hợp giới hạn.",
        keyContent: "Rèn luyện kỹ năng giải bài tập định lượng và giải thích hiện tượng đời sống.",
        pedagogicalTip: "Tuyên dương các cách giải sáng tạo, ngắn gọn."
      },
      {
        id: "act_5",
        phaseName: "5. Đánh giá & Vận dụng (Evaluate)",
        durationMinutes: 5,
        teacherAction: "Tổng kết bài học bằng sơ đồ tư duy, giao nhiệm vụ mở rộng về nhà.",
        studentAction: "Tự đánh giá mức độ tiếp thu, đặt câu hỏi thắc mắc chưa rõ.",
        keyContent: "Củng cố sơ đồ tư duy toàn bài và liên hệ kỹ thuật.",
        pedagogicalTip: "Sử dụng phiếu đánh giá nhanh (Exit Ticket)."
      }
    ],
    slides: [
      {
        id: "s1",
        slideNumber: 1,
        title: topic,
        subtitle: "Bản chất vật lý - Mô hình toán học & Ứng dụng thực tiễn",
        bulletPoints: [
          "Khám phá các nguyên lý cơ bản chi phối chuyển động và tương tác.",
          "Mô hình hóa hiện tượng tự nhiên bằng ngôn ngữ toán học chuẩn xác.",
          "Vận dụng vào thiết kế kỹ thuật, hàng không và công nghệ hiện đại."
        ],
        formulaLatex: "\\vec{F}_{net} = \\sum \\vec{F}_i = m \\vec{a}",
        keyConcept: "Vật lý là khoa học thực nghiệm nghiên cứu quy luật vận động của vật chất.",
        realWorldApplication: "Từ chuyển động của xe cộ đến quỹ đạo vệ tinh không gian.",
        presenterNotes: "Chào cả lớp, hôm nay chúng ta sẽ khám phá một trong những định luật nền tảng nhất của vật lý.",
        visualType: "diagram"
      },
      {
        id: "s2",
        slideNumber: 2,
        title: "Hiện tượng Quan sát & Câu hỏi Khởi động",
        subtitle: "Tại sao mọi vật chuyển động lại tuân theo quy luật nhất quán?",
        bulletPoints: [
          "Khi tác dụng một lực không đổi lên hai vật có khối lượng khác nhau, điều gì xảy ra?",
          "Tại sao khi hãm phanh gấp, hành khách trên xe bị chúi người về phía trước?",
          "Khái niệm quán tính và độ đo mức quán tính của vật chất."
        ],
        formulaLatex: "I = \\int r^2 dm \\quad;\\quad m = \\text{độ đo quán tính}",
        keyConcept: "Mọi vật đều có xu hướng bảo toàn trạng thái vận tốc của nó.",
        realWorldApplication: "Hệ thống dây an toàn và túi khí trên ô tô (Airbag safety).",
        presenterNotes: "Cho học sinh suy nghĩ 1 phút về quán tính trước khi giải thích định luật.",
        visualType: "experiment"
      },
      {
        id: "s3",
        slideNumber: 3,
        title: "Định luật và Công thức Trọng tâm",
        subtitle: "Mối quan hệ định lượng giữa Lực, Khối lượng và Gia tốc",
        bulletPoints: [
          "Vectơ gia tốc tỉ lệ thuận với hợp lực tác dụng và tỉ lệ nghịch với khối lượng.",
          "Phương và chiều của gia tốc luôn trùng với phương chiều của hợp lực.",
          "Đơn vị đo chuẩn trong hệ SI: Lực (Newton - N), Khối lượng (kg), Gia tốc (m/s²)."
        ],
        formulaLatex: "\\vec{a} = \\frac{\\vec{F}}{m} \\iff \\vec{F} = m \\cdot \\vec{a}",
        keyConcept: "Lực không phải là nguyên nhân duy trì chuyển động mà là nguyên nhân làm thay đổi vận tốc.",
        realWorldApplication: "Động cơ tên lửa đẩy tàu vũ trụ vào không gian vũ trụ.",
        presenterNotes: "Lưu ý học sinh: Lực là đại lượng vectơ, cần chiếu lên hệ trục tọa độ khi giải toán.",
        visualType: "formula"
      },
      {
        id: "s4",
        slideNumber: 4,
        title: "Phân tích Thí nghiệm & Khảo sát Mô phỏng",
        subtitle: "Kiểm chứng định luật bằng số liệu thực nghiệm",
        bulletPoints: [
          "Đồ thị vận tốc theo thời gian $v(t)$ là đường thẳng có độ dốc chính là gia tốc $a$.",
          "Khi giữ nguyên khối lượng $m$, tăng lực kéo $F$ thì gia tốc $a$ tăng tuyến tính.",
          "Sai số thực nghiệm thường phát sinh do lực ma sát và sức cản không khí."
        ],
        formulaLatex: "v = v_0 + a t \\quad;\\quad s = v_0 t + \\frac{1}{2} a t^2",
        keyConcept: "Số liệu thực nghiệm khẳng định độ chính xác tuyệt đối của mô hình toán.",
        realWorldApplication: "Kiểm tra độ an toàn thử nghiệm va chạm ô tô (Crash test rating).",
        presenterNotes: "Chuyển sang tab 'Phòng thí nghiệm ảo' để cả lớp cùng kéo thả các thanh trượt tham số.",
        visualType: "experiment"
      },
      {
        id: "s5",
        slideNumber: 5,
        title: "Tổng kết & Bản đồ Kiến thức",
        subtitle: "Những điểm cốt lõi cần khắc sâu",
        bulletPoints: [
          "Nắm chắc hệ thức $\\vec{F} = m\\vec{a}$ và các phương pháp giải bài toán động lực học.",
          "Phân biệt rõ ràng giữa khối lượng (quán tính) và trọng lượng (lực hấp dẫn).",
          "Kỹ năng lập sơ đồ phân tích lực tác dụng lên vật (Free-body diagram)."
        ],
        formulaLatex: "P = m \\cdot g \\quad (g \\approx 9.8 \\text{ m/s}^2)",
        keyConcept: "Sự kết hợp giữa tư duy lý thuyết và thực nghiệm tạo nên sức mạnh của Vật lý.",
        realWorldApplication: "Nền tảng cho toàn bộ ngành Cơ học kỹ thuật và Chế tạo máy.",
        presenterNotes: "Nhắc học sinh làm các câu hỏi trắc nghiệm tự luyện trong phần Luyện tập.",
        visualType: "summary"
      }
    ],
    simulation: {
      type: "projectile",
      title: "Phòng Thí nghiệm Ném xiên & Động lực học",
      description: "Thao tác thay đổi vận tốc ban đầu (v0), góc bắn (alpha) và gia tốc trọng trường (g) để quan sát quỹ đạo parabol, tầm xa (L) và độ cao cực đại (H_max).",
      initialParams: {
        v0: 25,
        angle: 45,
        gravity: 9.8,
        height: 0
      },
      paramLabels: {
        v0: { label: "Vận tốc ban đầu (v₀)", min: 5, max: 60, step: 1, unit: "m/s" },
        angle: { label: "Góc bắn (α)", min: 0, max: 90, step: 1, unit: "độ" },
        gravity: { label: "Gia tốc trọng trường (g)", min: 1.6, max: 24.8, step: 0.1, unit: "m/s²" },
        height: { label: "Độ cao ban đầu (h₀)", min: 0, max: 30, step: 1, unit: "m" }
      }
    },
    quizzes: [
      {
        id: "q1",
        question: "Một vật có khối lượng $m = 2\\text{ kg}$ chịu tác dụng của một lực không đổi $F = 10\\text{ N}$. Gia tốc của vật thu được là bao nhiêu?",
        options: [
          "A. 20 m/s²",
          "B. 5 m/s²",
          "C. 0.2 m/s²",
          "D. 8 m/s²"
        ],
        correctIndex: 1,
        explanation: "Theo định luật II Newton: $a = \\frac{F}{m} = \\frac{10}{2} = 5\\text{ m/s}^2$.",
        hint: "Áp dụng biểu thức $a = F / m$.",
        difficulty: "easy"
      },
      {
        id: "q2",
        question: "Nếu đồng thời tăng độ lớn lực tác dụng lên 3 lần và giảm khối lượng của vật đi 2 lần, gia tốc của vật sẽ thay đổi như thế nào?",
        options: [
          "A. Tăng 6 lần",
          "B. Giảm 6 lần",
          "C. Tăng 1.5 lần",
          "D. Không đổi"
        ],
        correctIndex: 0,
        explanation: "Ta có $a' = \\frac{F'}{m'} = \\frac{3F}{m/2} = 6 \\cdot \\frac{F}{m} = 6a$. Vậy gia tốc tăng 6 lần.",
        hint: "Lập tỉ số giữa $a'$ và $a$.",
        difficulty: "medium"
      },
      {
        id: "q3",
        question: "Trong chuyển động ném xiên từ mặt đất bỏ qua sức cản không khí, tại điểm cao nhất của quỹ đạo, đại lượng nào sau đây KHÔNG bằng 0?",
        options: [
          "A. Thành phần vận tốc theo phương thẳng đứng $v_y$",
          "B. Gia tốc của vật $a$",
          "C. Độ cao của vật $y$",
          "D. Cả B và vận tốc $v_x$ theo phương ngang"
        ],
        correctIndex: 3,
        explanation: "Tại điểm cao nhất, $v_y = 0$, nhưng $v_x = v_0\\cos(\\alpha) \\neq 0$ và gia tốc của vật luôn là $a = g \\neq 0$ hướng xuống dưới.",
        hint: "Phân tích chuyển động thành 2 phương Ox (thẳng đều) và Oy (biến đổi đều).",
        difficulty: "hard"
      }
    ],
    problems: [
      {
        id: "prob_1",
        title: "Bài toán: Xe lăn tăng tốc trên mặt phẳng nằm ngang",
        problemStatement: "Một xe lăn có khối lượng $m = 500\\text{ g}$ đang đứng yên trên sàn nhẵn không ma sát. Tác dụng vào xe một lực kéo không đổi $F = 2\\text{ N}$ theo phương ngang trong thời gian $t = 3\\text{ s}$. Tính vận tốc của xe tại thời điểm $t = 3\\text{ s}$ và quãng đường xe đi được trong thời gian đó.",
        givenData: [
          { symbol: "m", value: "0.5", unit: "kg", description: "Khối lượng của xe" },
          { symbol: "v_0", value: "0", unit: "m/s", description: "Vận tốc ban đầu" },
          { symbol: "F", value: "2", unit: "N", description: "Lực tác dụng" },
          { symbol: "t", value: "3", unit: "s", description: "Thời gian tác dụng" }
        ],
        requiredToFind: ["Vận tốc $v$ sau 3s", "Quãng đường $s$ đi được sau 3s"],
        formulaList: [
          "a = \\frac{F}{m}",
          "v = v_0 + a \\cdot t",
          "s = v_0 \\cdot t + \\frac{1}{2} a \\cdot t^2"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Tính gia tốc của xe",
            calculation: "a = \\frac{F}{m} = \\frac{2}{0.5} = 4\\text{ m/s}^2",
            explanation: "Áp dụng định luật II Newton cho chuyển động thẳng theo phương ngang."
          },
          {
            stepNumber: 2,
            title: "Tính vận tốc sau 3 giây",
            calculation: "v = 0 + 4 \\times 3 = 12\\text{ m/s}",
            explanation: "Sử dụng công thức vận tốc của chuyển động thẳng nhanh dần đều."
          },
          {
            stepNumber: 3,
            title: "Tính quãng đường đi được",
            calculation: "s = 0 + \\frac{1}{2} \\times 4 \\times 3^2 = 18\\text{ m}",
            explanation: "Tính độ dời từ thời điểm $t=0$ đến $t=3\\text{ s}$."
          }
        ],
        finalAnswer: "Vận tốc đạt được là $12\\text{ m/s}$ và quãng đường đi được là $18\\text{ m}$."
      }
    ],
    mindMap: {
      id: "root",
      label: topic,
      description: "Hệ thống kiến thức trọng tâm",
      children: [
        {
          id: "branch_1",
          label: "1. Bản chất & Khái niệm",
          description: "Quán tính, Lực, Khối lượng",
          formula: "F_{net} = \\sum F_i"
        },
        {
          id: "branch_2",
          label: "2. Định luật Động lực học",
          description: "Mối quan hệ F - m - a",
          formula: "a = F / m"
        },
        {
          id: "branch_3",
          label: "3. Năng lượng & Công",
          description: "Công cơ học và Bảo toàn cơ năng",
          formula: "W = W_d + W_t"
        },
        {
          id: "branch_4",
          label: "4. Ứng dụng Thực tiễn",
          description: "Kỹ thuật giao thông & Không gian",
          formula: "p = m \\cdot v"
        }
      ]
    },
    experimentalGuide: {
      title: "Thí nghiệm kiểm chứng Định luật II Newton với Bàn đệm khí",
      toolsNeeded: [
        "Bàn đệm khí (Air track) giảm thiểu tối đa ma sát",
        "Xe trượt gắn cảm biến quang điện (Photogate)",
        "Bộ quả nặng gia tải chuẩn (10g, 20g, 50g)",
        "Đồng hồ bấm giây kỹ thuật số / Máy đo thời gian hiện số"
      ],
      safetyPrecautions: [
        "Không để vật nặng rơi vào chân khi thao tác dây kéo ròng rọc.",
        "Đặt bàn đệm khí cân bằng ngang chuẩn bằng thước thủy bọt nước."
      ],
      steps: [
        "Bước 1: Lắp đặt đường ray ngang, gắn cảm biến quang tại hai vị trí cách nhau $s = 50\\text{ cm}$.",
        "Bước 2: Mắc dây qua ròng rọc cố định ở đầu ray, treo quả nặng $m_{treo} = 20\\text{ g}$.",
        "Bước 3: Thả xe trượt chuyển động từ trạng thái nghỉ, ghi lại thời gian qua hai cổng quang.",
        "Bước 4: Lặp lại thí nghiệm 3 lần lấy giá trị trung bình.",
        "Bước 5: Thay đổi khối lượng xe và lực kéo, vẽ đồ thị $a = f(F)$ và $a = f(1/m)$."
      ],
      expectedPhenomenon: "Đồ thị $a = f(F)$ thu được là đường thẳng đi qua gốc tọa độ O, chứng minh gia tốc tỉ lệ thuận với lực tác dụng.",
      errorAnalysis: "Sai số nhỏ có thể do ma sát còn sót lại giữa xe và ray, hoặc độ trễ phản ứng của cổng quang."
    },
    summaryTakeaways: [
      "Định luật II Newton là chìa khóa mở ra cánh cửa của toàn bộ cơ học cổ điển.",
      "Gia tốc luôn cùng hướng với hợp lực tác dụng lên vật.",
      "Thực hành thí nghiệm và mô phỏng giúp chuyển hóa công thức trừu tượng thành trực quan sinh động.",
      "Luôn chú ý đổi các đại lượng về đơn vị chuẩn SI trước khi tính toán."
    ]
  };
}

startServer();
