package com.expense.app.notification

import android.util.Log

/**
 * Bộ phân tích thông minh giao dịch từ notification ngân hàng.
 *
 * Flow:
 * 1. Detect bank từ package name
 * 2. Regex extract: amount, type (income/expense), balance, description
 * 3. Local keyword matching để classify category (nhanh, offline)
 * 4. Fallback: nếu không match → category = null, user tự chọn
 */
object TransactionParser {

    private const val TAG = "TxParser"

    /**
     * Kết quả sau khi parse notification.
     */
    data class ParseResult(
        val amount: Double,
        val type: String,               // "income" | "expense"
        val bankName: String,
        val description: String,
        val balanceAfter: Double? = null,
        val suggestedCategoryId: String? = null,
        val suggestedCategoryName: String? = null,
        val confidence: Float = 0f,
        val rawText: String
    )

    // ── Mapping package name → bank info ──────────────────
    data class BankInfo(
        val name: String,
        val displayName: String,
        val incomeKeywords: List<String>,
        val expenseKeywords: List<String>
    )

    private val bankMap = mapOf(
        "com.VCB" to BankInfo(
            "VCB", "Vietcombank",
            listOf("GD: +", "GD:+", "so tien GD: +"),
            listOf("GD: -", "GD:-", "so tien GD: -", "Thanh toan")
        ),
        "vn.com.techcombank.bb.app" to BankInfo(
            "TCB", "Techcombank",
            listOf("+", "Nhận", "nhan"),
            listOf("-", "Thanh toán", "Chuyển", "thanh toan", "chuyen")
        ),
        "com.vnpay.bidv" to BankInfo(
            "BIDV", "BIDV",
            listOf("GD: +", "Nhận", "nhan"),
            listOf("GD: -", "Thanh toán", "thanh toan", "Trừ")
        ),
        "com.vnpay.vietinbank" to BankInfo(
            "CTG", "VietinBank",
            listOf("GD: +", "Nhận"),
            listOf("GD: -", "Thanh toán")
        ),
        "com.mbmobile" to BankInfo(
            "MB", "MB Bank",
            listOf("+", "Nhận", "nhan"),
            listOf("-", "Trừ", "thanh toan", "Chuyển")
        ),
        "com.mservice.momotransfer" to BankInfo(
            "MOMO", "MoMo",
            listOf("nhận", "Nhận", "nhan duoc", "Bạn vừa nhận"),
            listOf("chuyển", "thanh toán", "Bạn vừa chuyển", "trừ")
        ),
        "vn.com.vng.zalopay" to BankInfo(
            "ZALO", "ZaloPay",
            listOf("nhận", "Nhận"),
            listOf("thanh toán", "chuyển", "Chuyển")
        ),
        "vn.tpb.mb.gprsandroid" to BankInfo(
            "TPB", "TPBank",
            listOf("+", "Nhận"),
            listOf("-", "Trừ", "Thanh toán")
        )
    )

    // ── Supported package names ──────────────────
    val supportedPackages: Set<String> get() = bankMap.keys

    /**
     * Kiểm tra package có phải app ngân hàng được hỗ trợ không.
     */
    fun isBankingApp(packageName: String): Boolean = packageName in bankMap

    /**
     * Parse notification text từ banking app.
     * @return ParseResult nếu parse thành công, null nếu không trích xuất được amount.
     */
    fun parse(packageName: String, title: String, body: String): ParseResult? {
        val bankInfo = bankMap[packageName] ?: return null
        val fullText = "$title $body"
        Log.d(TAG, "Parsing [${bankInfo.name}]: $fullText")

        // 1. Extract amount
        val amount = extractAmount(fullText) ?: run {
            Log.w(TAG, "Could not extract amount from: $fullText")
            return null
        }

        // 2. Determine type (income / expense)
        val type = detectType(fullText, bankInfo)

        // 3. Extract balance after transaction (if available)
        val balance = extractBalance(fullText)

        // 4. Extract description
        val description = extractDescription(fullText, bankInfo.name)

        // 5. Classify category using local keywords (search full text for better accuracy)
        val (categoryId, categoryName, confidence) = classifyCategory(fullText, type)

        return ParseResult(
            amount = amount,
            type = type,
            bankName = bankInfo.displayName,
            description = description,
            balanceAfter = balance,
            suggestedCategoryId = categoryId,
            suggestedCategoryName = categoryName,
            confidence = confidence,
            rawText = fullText
        )
    }

    // ── Amount Extraction ──────────────────────────
    /**
     * Trích xuất số tiền từ text notification.
     * Hỗ trợ formats: 1,000,000 | 1.000.000 | 1000000 | 1,000,000 VND
     */
    private fun extractAmount(text: String): Double? {
        // Pattern 1: Số tiền theo format "GD: +1,000,000 VND" hoặc "so tien: 500.000 đ"
        val amountPatterns = listOf(
            // "GD: +1,000,000" hoặc "GD: -500.000"
            Regex("""GD[:\s]*[+\-]?\s*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            // "so tien: 1.000.000" hoặc "số tiền: 500,000"
            Regex("""(?:so tien|số tiền|s[oố] ti[eề]n)[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            // "nhận 200.000đ" hoặc "chuyển 1,000,000 VND"
            Regex("""(?:nhận|nhan|chuyển|chuyen|thanh toán|thanh toan|trừ)\s+([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            // "+500.000 VND" hoặc "-1,000,000đ" ở đầu hoặc giữa text
            Regex("""[+\-]\s?([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            // Fallback: bất kỳ số lớn nào (>= 1000) có dấu phân cách
            Regex("""([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE)
        )

        for (pattern in amountPatterns) {
            val match = pattern.find(text)
            if (match != null) {
                val raw = match.groupValues[1]
                val cleaned = raw.replace(Regex("[.,]"), "")
                val amount = cleaned.toDoubleOrNull()
                if (amount != null && amount >= 1000) { // Bỏ qua số quá nhỏ
                    return amount
                }
            }
        }

        return null
    }

    // ── Type Detection ──────────────────────────
    private fun detectType(text: String, bankInfo: BankInfo): String {
        // PRIORITY 1: Check explicit +/- signs (most reliable signal)
        if (text.contains("GD: +") || text.contains("GD:+")) return "income"
        if (text.contains("GD: -") || text.contains("GD:-")) return "expense"

        // PRIORITY 2: Check for Nhận / Bạn vừa nhận (stronger income signals)
        val lowerText = text.lowercase()
        val strongIncomeSignals = listOf("bạn vừa nhận", "nhận được", "nhan duoc", "nhận +", "+")
        for (signal in strongIncomeSignals) {
            if (lowerText.contains(signal)) {
                // But make sure it's not "nhận hàng" or similar
                if (signal == "+" && lowerText.contains("-")) continue
                return "income"
            }
        }

        // PRIORITY 3: Check bank-specific keywords
        for (keyword in bankInfo.expenseKeywords) {
            if (keyword.length >= 3 && lowerText.contains(keyword.lowercase())) return "expense"
        }
        for (keyword in bankInfo.incomeKeywords) {
            if (keyword.length >= 3 && lowerText.contains(keyword.lowercase())) return "income"
        }

        // PRIORITY 4: Simple +/- check
        return when {
            text.contains("+") && !text.contains("-") -> "income"
            text.contains("-") && !text.contains("+") -> "expense"
            else -> "income" // Default: assume income (tiền về)
        }
    }

    // ── Balance Extraction ──────────────────────
    private fun extractBalance(text: String): Double? {
        val balancePatterns = listOf(
            Regex("""(?:SD|Số dư|so du|s[oố] d[uư])[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""(?:Available|Avail)[:\s]*([0-9.,]+)""", RegexOption.IGNORE_CASE)
        )

        for (pattern in balancePatterns) {
            val match = pattern.find(text)
            if (match != null) {
                val raw = match.groupValues[1].replace(Regex("[.,]"), "")
                return raw.toDoubleOrNull()
            }
        }
        return null
    }

    // ── Description Extraction ──────────────────
    private fun extractDescription(text: String, bankCode: String): String {
        // Tìm phần mô tả sau keywords
        val descPatterns = listOf(
            Regex("""(?:ND|Noi dung|nội dung)[:\s]*(.+?)(?:\.|$)""", RegexOption.IGNORE_CASE),
            Regex("""(?:CHUYEN KHOAN|CK|Chuyển khoản)[:\s]*(.+?)(?:\.|$)""", RegexOption.IGNORE_CASE),
            Regex("""(?:tai|từ|tu|toi|đến)\s+(.+?)(?:\.|SD|$)""", RegexOption.IGNORE_CASE)
        )

        for (pattern in descPatterns) {
            val match = pattern.find(text)
            if (match != null) {
                val desc = match.groupValues[1].trim()
                if (desc.length > 3) return desc.take(100)
            }
        }

        // Fallback: dùng toàn bộ text, cắt ngắn
        return text.take(80).trim()
    }

    /**
     * Phân loại category dựa trên toàn bộ rawText (không chỉ description).
     * Điều này giúp match keyword trong toàn bộ notification.
     */
    fun classifyCategoryFromFullText(fullText: String, description: String, type: String): Triple<String?, String?, Float> {
        // Kiểm tra cả fullText VÀ description
        val combined = "$fullText $description"
        return classifyCategory(combined, type)
    }

    // ── Category Classification (Local Keywords) ──────────────
    /**
     * Phân loại category dựa trên keyword matching.
     * Nhanh, offline, không cần API.
     * @return Triple(categoryId, categoryName, confidence)
     */
    private fun classifyCategory(description: String, type: String): Triple<String?, String?, Float> {
        val desc = description.lowercase()

        // Income categories
        if (type == "income") {
            return when {
                desc.containsAny("luong", "lương", "salary", "wage") ->
                    Triple("cat_salary", "Lương", 0.90f)
                desc.containsAny("thuong", "thưởng", "bonus") ->
                    Triple("cat_bonus", "Thưởng", 0.85f)
                desc.containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer") ->
                    Triple("cat_transfer", "Chuyển khoản", 0.70f)
                desc.containsAny("lai", "lãi", "interest") ->
                    Triple("cat_interest", "Tiền lãi", 0.80f)
                else -> Triple(null, "Thu nhập khác", 0.30f)
            }
        }

        // Expense categories
        return when {
            desc.containsAny("grab", "gojek", "be", "taxi", "uber", "xang", "xăng", "parking") ->
                Triple("cat_transport", "Di chuyển", 0.85f)
            desc.containsAny("shopeepay", "shopee", "lazada", "tiki", "mua", "order") ->
                Triple("cat_shopping", "Mua sắm", 0.80f)
            desc.containsAny("dien", "điện", "nuoc", "nước", "internet", "wifi", "evn") ->
                Triple("cat_bills", "Hóa đơn", 0.85f)
            desc.containsAny("com", "cơm", "an", "ăn", "pho", "phở", "cafe", "coffee", "tra sua", "trà sữa", "baemin", "now", "food") ->
                Triple("cat_food", "Ăn uống", 0.80f)
            desc.containsAny("benh vien", "bệnh viện", "thuoc", "thuốc", "doctor", "hospital", "clinic") ->
                Triple("cat_health", "Sức khỏe", 0.80f)
            desc.containsAny("hoc phi", "học phí", "school", "education", "uni", "course") ->
                Triple("cat_education", "Giáo dục", 0.80f)
            desc.containsAny("nha", "nhà", "rent", "thue", "thuê", "apartment") ->
                Triple("cat_housing", "Nhà ở", 0.75f)
            desc.containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer") ->
                Triple("cat_transfer_out", "Chuyển khoản", 0.65f)
            else -> Triple(null, null, 0.0f)
        }
    }

    /**
     * Extension: kiểm tra string chứa bất kỳ keyword nào.
     */
    private fun String.containsAny(vararg keywords: String): Boolean {
        return keywords.any { this.contains(it) }
    }
}
