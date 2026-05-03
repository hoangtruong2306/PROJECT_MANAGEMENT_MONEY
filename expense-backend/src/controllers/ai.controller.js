const { GoogleGenAI } = require("@google/genai");
const db = require("../config/db");
const statsModel = require("../models/stats.model");

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.userId; // from authMiddleware

        if (!message) {
            return res.status(400).json({ message: "Vui lòng nhập lời nhắn." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "Chưa cấu hình GEMINI_API_KEY ở Backend.",
            });
        }

        // 1. Get user statistics to build context
        const stats = await statsModel.getUserStats(userId);

        // 2. Build Prompt Context
        const systemPrompt = `
      Bạn là một trợ lý tài chính cá nhân nhúng trong ứng dụng Quản lý chi tiêu (Expense Tracker).
      Dưới đây là thống kê thu chi của người dùng trong tháng này để bạn tham khảo khi trả lời:
      - Tổng thu nhập từ trước đến nay: ${Number(stats.total_income).toLocaleString()} đ
      - Tổng chi tiêu từ trước đến nay: ${Number(stats.total_expense).toLocaleString()} đ
      - Số dư tự nhiên (Thu - Chi): ${Number(stats.balance).toLocaleString()} đ
      - Tháng này đã chi: ${Number(stats.expense_this_month).toLocaleString()} đ
      - Tháng trước chi: ${Number(stats.expense_last_month).toLocaleString()} đ
      - Danh mục chi tiêu lớn nhất tháng này: ${stats.top_category} (${Number(stats.top_category_amount).toLocaleString()} đ)
      
      Quy tắc:
      1. Câu trả lời của bạn phải là tiếng Việt, ngắn gọn, súc tích, dễ đọc.
      2. Sử dụng định dạng văn bản Markdown để làm nổi bật (in đậm, danh sách) nếu cần thiết.
      3. Hãy đóng vai một chuyên gia tư vấn tài chính thông minh, thấu hiểu.
      4. Nếu người dùng hỏi các câu hỏi không liên quan đến tài chính, tiết kiệm, chi tiêu, hãy từ chối khéo léo và hướng họ về chủ đề tài chính.
    `;

        // 3. Initialize Google Gen AI
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Tôi hiểu. Tôi đã sẵn sàng đóng vai trợ lý tài chính để phân tích số liệu trên và giúp đỡ bạn." }] },
                { role: "user", parts: [{ text: message }] }
            ],
            config: {
                temperature: 0.7,
            }
        });

        const reply = response.text;

        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "Lỗi kết nối Gemini AI: " + error.message });
    }
};
