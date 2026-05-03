/**
 * ═══════════════════════════════════════════════════════════════
 *  TEST SUITE: TransactionParser — Smart Transaction Detector
 *  
 *  Script Kotlin thuần chạy trên JVM để verify logic parse.
 *  Không cần Android — test regex, type detection, classification.
 * ═══════════════════════════════════════════════════════════════
 */

// Re-implement the core logic without android.util.Log for JVM testing
object TestTransactionParser {

    data class ParseResult(
        val amount: Double,
        val type: String,
        val bankName: String,
        val description: String,
        val balanceAfter: Double? = null,
        val suggestedCategoryId: String? = null,
        val suggestedCategoryName: String? = null,
        val confidence: Float = 0f,
        val rawText: String
    )

    data class BankInfo(
        val name: String,
        val displayName: String,
        val incomeKeywords: List<String>,
        val expenseKeywords: List<String>
    )

    private val bankMap = mapOf(
        "com.VCB" to BankInfo("VCB", "Vietcombank",
            listOf("GD: +", "GD:+", "so tien GD: +"),
            listOf("GD: -", "GD:-", "so tien GD: -", "Thanh toan")),
        "vn.com.techcombank.bb.app" to BankInfo("TCB", "Techcombank",
            listOf("+", "Nhận", "nhan"),
            listOf("-", "Thanh toán", "Chuyển", "thanh toan", "chuyen")),
        "com.vnpay.bidv" to BankInfo("BIDV", "BIDV",
            listOf("GD: +", "Nhận", "nhan"),
            listOf("GD: -", "Thanh toán", "thanh toan", "Trừ")),
        "com.vnpay.vietinbank" to BankInfo("CTG", "VietinBank",
            listOf("GD: +", "Nhận"),
            listOf("GD: -", "Thanh toán")),
        "com.mbmobile" to BankInfo("MB", "MB Bank",
            listOf("+", "Nhận", "nhan"),
            listOf("-", "Trừ", "thanh toan", "Chuyển")),
        "com.mservice.momotransfer" to BankInfo("MOMO", "MoMo",
            listOf("nhận", "Nhận", "nhan duoc", "Bạn vừa nhận"),
            listOf("chuyển", "thanh toán", "Bạn vừa chuyển", "trừ")),
        "vn.com.vng.zalopay" to BankInfo("ZALO", "ZaloPay",
            listOf("nhận", "Nhận"),
            listOf("thanh toán", "chuyển", "Chuyển")),
        "vn.tpb.mb.gprsandroid" to BankInfo("TPB", "TPBank",
            listOf("+", "Nhận"),
            listOf("-", "Trừ", "Thanh toán"))
    )

    val supportedPackages: Set<String> get() = bankMap.keys
    fun isBankingApp(packageName: String): Boolean = packageName in bankMap

    fun parse(packageName: String, title: String, body: String): ParseResult? {
        val bankInfo = bankMap[packageName] ?: return null
        val fullText = "$title $body"
        val amount = extractAmount(fullText) ?: return null
        val type = detectType(fullText, bankInfo)
        val balance = extractBalance(fullText)
        val description = extractDescription(fullText, bankInfo.name)
        val (categoryId, categoryName, confidence) = classifyCategory(description, type)
        return ParseResult(amount, type, bankInfo.displayName, description, balance, categoryId, categoryName, confidence, fullText)
    }

    private fun extractAmount(text: String): Double? {
        val amountPatterns = listOf(
            Regex("""GD[:\s]*[+\-]?\s*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""(?:so tien|số tiền|s[oố] ti[eề]n)[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""(?:nhận|nhan|chuyển|chuyen|thanh toán|thanh toan|trừ)\s+([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""[+\-]\s?([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE)
        )
        for (pattern in amountPatterns) {
            val match = pattern.find(text)
            if (match != null) {
                val raw = match.groupValues[1]
                val cleaned = raw.replace(Regex("[.,]"), "")
                val amount = cleaned.toDoubleOrNull()
                if (amount != null && amount >= 1000) return amount
            }
        }
        return null
    }

    private fun detectType(text: String, bankInfo: BankInfo): String {
        val lowerText = text.lowercase()
        for (keyword in bankInfo.expenseKeywords) {
            if (lowerText.contains(keyword.lowercase())) return "expense"
        }
        for (keyword in bankInfo.incomeKeywords) {
            if (lowerText.contains(keyword.lowercase())) return "income"
        }
        return when {
            text.contains("GD: +") || text.contains("GD:+") -> "income"
            text.contains("GD: -") || text.contains("GD:-") -> "expense"
            text.contains("+") && !text.contains("-") -> "income"
            text.contains("-") && !text.contains("+") -> "expense"
            else -> "income"
        }
    }

    private fun extractBalance(text: String): Double? {
        val patterns = listOf(
            Regex("""(?:SD|Số dư|so du|s[oố] d[uư])[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?""", RegexOption.IGNORE_CASE),
            Regex("""(?:Available|Avail)[:\s]*([0-9.,]+)""", RegexOption.IGNORE_CASE)
        )
        for (pattern in patterns) {
            val match = pattern.find(text)
            if (match != null) {
                val raw = match.groupValues[1].replace(Regex("[.,]"), "")
                return raw.toDoubleOrNull()
            }
        }
        return null
    }

    private fun extractDescription(text: String, bankCode: String): String {
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
        return text.take(80).trim()
    }

    private fun classifyCategory(description: String, type: String): Triple<String?, String?, Float> {
        val desc = description.lowercase()
        if (type == "income") {
            return when {
                desc.containsAny("luong", "lương", "salary", "wage") -> Triple("cat_salary", "Lương", 0.90f)
                desc.containsAny("thuong", "thưởng", "bonus") -> Triple("cat_bonus", "Thưởng", 0.85f)
                desc.containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer") -> Triple("cat_transfer", "Chuyển khoản", 0.70f)
                desc.containsAny("lai", "lãi", "interest") -> Triple("cat_interest", "Tiền lãi", 0.80f)
                else -> Triple(null, "Thu nhập khác", 0.30f)
            }
        }
        return when {
            desc.containsAny("grab", "gojek", "be", "taxi", "uber", "xang", "xăng", "parking") -> Triple("cat_transport", "Di chuyển", 0.85f)
            desc.containsAny("shopeepay", "shopee", "lazada", "tiki", "mua", "order") -> Triple("cat_shopping", "Mua sắm", 0.80f)
            desc.containsAny("dien", "điện", "nuoc", "nước", "internet", "wifi", "evn") -> Triple("cat_bills", "Hóa đơn", 0.85f)
            desc.containsAny("com", "cơm", "an", "ăn", "pho", "phở", "cafe", "coffee", "tra sua", "trà sữa", "baemin", "now", "food") -> Triple("cat_food", "Ăn uống", 0.80f)
            desc.containsAny("benh vien", "bệnh viện", "thuoc", "thuốc", "doctor", "hospital", "clinic") -> Triple("cat_health", "Sức khỏe", 0.80f)
            desc.containsAny("hoc phi", "học phí", "school", "education", "uni", "course") -> Triple("cat_education", "Giáo dục", 0.80f)
            desc.containsAny("nha", "nhà", "rent", "thue", "thuê", "apartment") -> Triple("cat_housing", "Nhà ở", 0.75f)
            desc.containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer") -> Triple("cat_transfer_out", "Chuyển khoản", 0.65f)
            else -> Triple(null, null, 0.0f)
        }
    }

    private fun String.containsAny(vararg keywords: String): Boolean = keywords.any { this.contains(it) }
}

// ═══════════════════════════════════════════════════════════
//  TEST FRAMEWORK
// ═══════════════════════════════════════════════════════════

var totalTests = 0
var passed = 0
var failed = 0
val failures = mutableListOf<String>()

fun assert(condition: Boolean, testName: String) {
    totalTests++
    if (condition) {
        passed++
        println("  ✅ PASS: $testName")
    } else {
        failed++
        failures.add(testName)
        println("  ❌ FAIL: $testName")
    }
}

fun assertEquals(expected: Any?, actual: Any?, testName: String) {
    totalTests++
    if (expected == actual) {
        passed++
        println("  ✅ PASS: $testName")
    } else {
        failed++
        failures.add("$testName — expected: $expected, actual: $actual")
        println("  ❌ FAIL: $testName — expected: «$expected» actual: «$actual»")
    }
}

fun section(name: String) {
    println("\n╔══════════════════════════════════════════════════╗")
    println("║ $name")
    println("╚══════════════════════════════════════════════════╝")
}

// ═══════════════════════════════════════════════════════════
//  TEST CASES
// ═══════════════════════════════════════════════════════════

fun main() {
    println("🧪 Smart Transaction Detector — Test Suite")
    println("═══════════════════════════════════════════════")

    // ──────────────────────────────────────────────────
    section("TEST 1: Bank Package Recognition")
    // ──────────────────────────────────────────────────
    assert(TestTransactionParser.isBankingApp("com.VCB"), "VCB is banking app")
    assert(TestTransactionParser.isBankingApp("vn.com.techcombank.bb.app"), "TCB is banking app")
    assert(TestTransactionParser.isBankingApp("com.vnpay.bidv"), "BIDV is banking app")
    assert(TestTransactionParser.isBankingApp("com.mbmobile"), "MB is banking app")
    assert(TestTransactionParser.isBankingApp("com.mservice.momotransfer"), "MoMo is banking app")
    assert(TestTransactionParser.isBankingApp("vn.com.vng.zalopay"), "ZaloPay is banking app")
    assert(TestTransactionParser.isBankingApp("vn.tpb.mb.gprsandroid"), "TPBank is banking app")
    assert(!TestTransactionParser.isBankingApp("com.facebook.katana"), "Facebook is NOT banking app")
    assert(!TestTransactionParser.isBankingApp("com.google.android.youtube"), "YouTube is NOT banking app")
    assertEquals(8, TestTransactionParser.supportedPackages.size, "Total supported banks = 8")

    // ──────────────────────────────────────────────────
    section("TEST 2: VCB — Income (Nhận chuyển khoản)")
    // ──────────────────────────────────────────────────
    val vcbIncome = TestTransactionParser.parse(
        "com.VCB",
        "Vietcombank",
        "GD: +1,000,000 VND. SD: 5,000,000 VND. ND: CHUYEN KHOAN TU NGUYEN VAN A"
    )
    assert(vcbIncome != null, "VCB income parsed successfully")
    assertEquals(1_000_000.0, vcbIncome?.amount, "VCB income amount = 1,000,000")
    assertEquals("income", vcbIncome?.type, "VCB income type = income")
    assertEquals("Vietcombank", vcbIncome?.bankName, "VCB bank name")
    assertEquals(5_000_000.0, vcbIncome?.balanceAfter, "VCB balance after = 5,000,000")
    assert(vcbIncome?.description?.contains("NGUYEN VAN A") == true, "VCB description extracted")

    // ──────────────────────────────────────────────────
    section("TEST 3: VCB — Expense (Thanh toán)")
    // ──────────────────────────────────────────────────
    val vcbExpense = TestTransactionParser.parse(
        "com.VCB",
        "Vietcombank",
        "GD: -500,000 VND. SD: 4,500,000 VND. Thanh toan don hang Shopee"
    )
    assert(vcbExpense != null, "VCB expense parsed successfully")
    assertEquals(500_000.0, vcbExpense?.amount, "VCB expense amount = 500,000")
    assertEquals("expense", vcbExpense?.type, "VCB expense type = expense")
    assertEquals(4_500_000.0, vcbExpense?.balanceAfter, "VCB expense balance = 4,500,000")

    // ──────────────────────────────────────────────────
    section("TEST 4: MoMo — Income")
    // ──────────────────────────────────────────────────
    val momoIncome = TestTransactionParser.parse(
        "com.mservice.momotransfer",
        "MoMo",
        "Bạn vừa nhận 200.000đ từ TRAN THI B. ND: Tra tien com"
    )
    assert(momoIncome != null, "MoMo income parsed successfully")
    assertEquals(200_000.0, momoIncome?.amount, "MoMo income amount = 200,000")
    assertEquals("income", momoIncome?.type, "MoMo type = income")
    assertEquals("MoMo", momoIncome?.bankName, "MoMo bank name")

    // ──────────────────────────────────────────────────
    section("TEST 5: MoMo — Expense")
    // ──────────────────────────────────────────────────
    val momoExpense = TestTransactionParser.parse(
        "com.mservice.momotransfer",
        "MoMo",
        "Bạn vừa chuyển 150.000đ đến LE VAN C. ND: Thanh toan grab"
    )
    assert(momoExpense != null, "MoMo expense parsed successfully")
    assertEquals(150_000.0, momoExpense?.amount, "MoMo expense = 150,000")
    assertEquals("expense", momoExpense?.type, "MoMo type = expense")

    // ──────────────────────────────────────────────────
    section("TEST 6: Techcombank — Income")
    // ──────────────────────────────────────────────────
    val tcbIncome = TestTransactionParser.parse(
        "vn.com.techcombank.bb.app",
        "Techcombank",
        "TK 1234: +3,500,000 VND. Noi dung: LUONG THANG 4"
    )
    assert(tcbIncome != null, "TCB income parsed successfully")
    assertEquals(3_500_000.0, tcbIncome?.amount, "TCB income = 3,500,000")
    assertEquals("income", tcbIncome?.type, "TCB type = income")

    // ──────────────────────────────────────────────────
    section("TEST 7: BIDV — Expense")
    // ──────────────────────────────────────────────────
    val bidvExpense = TestTransactionParser.parse(
        "com.vnpay.bidv",
        "BIDV SmartBanking",
        "GD: -2,000,000 VND. SD: 8,000,000 VND. Thanh toán tien dien EVN"
    )
    assert(bidvExpense != null, "BIDV expense parsed successfully")
    assertEquals(2_000_000.0, bidvExpense?.amount, "BIDV expense = 2,000,000")
    assertEquals("expense", bidvExpense?.type, "BIDV type = expense")
    assertEquals(8_000_000.0, bidvExpense?.balanceAfter, "BIDV balance = 8,000,000")

    // ──────────────────────────────────────────────────
    section("TEST 8: MB Bank — Large Amount")
    // ──────────────────────────────────────────────────
    val mbLarge = TestTransactionParser.parse(
        "com.mbmobile",
        "MB Bank",
        "Nhận +50,000,000 VND từ CONG TY ABC. ND: Chuyển khoản lương"
    )
    assert(mbLarge != null, "MB large amount parsed")
    assertEquals(50_000_000.0, mbLarge?.amount, "MB amount = 50,000,000")
    assertEquals("income", mbLarge?.type, "MB type = income")

    // ──────────────────────────────────────────────────
    section("TEST 9: Category Classification — Income")
    // ──────────────────────────────────────────────────
    // Salary detection
    val salaryResult = TestTransactionParser.parse(
        "vn.com.techcombank.bb.app",
        "Techcombank",
        "TK 5678: +15,000,000 VND. Noi dung: LUONG THANG 4 2026"
    )
    assertEquals("cat_salary", salaryResult?.suggestedCategoryId, "Salary classified correctly")
    assertEquals("Lương", salaryResult?.suggestedCategoryName, "Salary name = 'Lương'")
    assert((salaryResult?.confidence ?: 0f) >= 0.8f, "Salary confidence >= 80%")

    // Transfer detection
    val transferResult = TestTransactionParser.parse(
        "com.VCB",
        "Vietcombank",
        "GD: +500,000 VND. SD: 2,000,000 VND. CK TU NGUYEN VAN D"
    )
    assertEquals("income", transferResult?.type, "Transfer type = income")

    // ──────────────────────────────────────────────────
    section("TEST 10: Category Classification — Expense")
    // ──────────────────────────────────────────────────
    // Food
    val foodResult = TestTransactionParser.parse(
        "com.mservice.momotransfer",
        "MoMo",
        "Bạn vừa chuyển 50.000đ đến QUAN COM BINH DAN. ND: Tien an com trua"
    )
    assertEquals("expense", foodResult?.type, "Food type = expense")
    // Should detect food keywords
    
    // Shopping (Shopee)
    val shopResult = TestTransactionParser.parse(
        "com.VCB",
        "Vietcombank",
        "GD: -350,000 VND. SD: 1,500,000 VND. Thanh toan ShopeePay don hang"
    )
    assertEquals("expense", shopResult?.type, "Shopee type = expense")
    assertEquals("cat_shopping", shopResult?.suggestedCategoryId, "Shopee → Shopping category")

    // Bills (EVN electricity)
    val billResult = TestTransactionParser.parse(
        "com.vnpay.bidv",
        "BIDV",
        "GD: -800,000 VND. SD: 3,000,000 VND. Thanh toán tien dien EVN T4/2026"
    )
    assertEquals("expense", billResult?.type, "Bill type = expense")
    assertEquals("cat_bills", billResult?.suggestedCategoryId, "EVN → Bills category")

    // Transport (Grab)
    val transportResult = TestTransactionParser.parse(
        "com.mservice.momotransfer",
        "MoMo",
        "Bạn vừa chuyển 85.000đ cho Grab. ND: Thanh toan cuoc xe Grab"
    )
    assertEquals("expense", transportResult?.type, "Transport type = expense")
    assertEquals("cat_transport", transportResult?.suggestedCategoryId, "Grab → Transport category")

    // ──────────────────────────────────────────────────
    section("TEST 11: Edge Cases")
    // ──────────────────────────────────────────────────
    // Non-banking app → null
    val nonBank = TestTransactionParser.parse("com.facebook.katana", "FB", "You have a new message")
    assert(nonBank == null, "Non-banking app returns null")

    // No amount in text → null
    val noAmount = TestTransactionParser.parse("com.VCB", "VCB", "Thong bao bao tri he thong")
    assert(noAmount == null, "No amount returns null")

    // Very small amount (< 1000) → null
    val smallAmount = TestTransactionParser.parse("com.VCB", "VCB", "GD: +500 VND. SD: 100 VND")
    assert(smallAmount == null, "Amount < 1000 returns null (filter noise)")

    // Dot-separated format (1.000.000)
    val dotFormat = TestTransactionParser.parse(
        "com.VCB", "VCB",
        "GD: +1.500.000 VND. SD: 10.000.000 VND"
    )
    assertEquals(1_500_000.0, dotFormat?.amount, "Dot format 1.500.000 = 1,500,000")
    assertEquals(10_000_000.0, dotFormat?.balanceAfter, "Dot format balance 10.000.000")

    // ──────────────────────────────────────────────────
    section("TEST 12: ZaloPay / TPBank")
    // ──────────────────────────────────────────────────
    val zaloResult = TestTransactionParser.parse(
        "vn.com.vng.zalopay",
        "ZaloPay",
        "Nhận 100.000đ từ VO THI E qua ZaloPay"
    )
    assert(zaloResult != null, "ZaloPay parsed")
    assertEquals(100_000.0, zaloResult?.amount, "ZaloPay amount = 100,000")
    assertEquals("ZaloPay", zaloResult?.bankName, "ZaloPay bank name")

    val tpbResult = TestTransactionParser.parse(
        "vn.tpb.mb.gprsandroid",
        "TPBank",
        "TK **1234: +5.000.000 VND. SD: 20.000.000 VND. Nhận chuyển khoản"
    )
    assert(tpbResult != null, "TPBank parsed")
    assertEquals(5_000_000.0, tpbResult?.amount, "TPBank amount = 5,000,000")
    assertEquals("income", tpbResult?.type, "TPBank type = income")

    // ══════════════════════════════════════════════════
    //  SUMMARY
    // ══════════════════════════════════════════════════
    println("\n")
    println("══════════════════════════════════════════════════")
    println("  📊 TEST RESULTS")
    println("══════════════════════════════════════════════════")
    println("  Total: $totalTests")
    println("  ✅ Passed: $passed")
    println("  ❌ Failed: $failed")
    println("  Success rate: ${if (totalTests > 0) (passed * 100 / totalTests) else 0}%")
    
    if (failures.isNotEmpty()) {
        println("\n  ⚠️ Failed tests:")
        failures.forEach { println("    - $it") }
    }
    
    println("══════════════════════════════════════════════════")
    
    // Exit code
    if (failed > 0) {
        System.exit(1)
    }
}
