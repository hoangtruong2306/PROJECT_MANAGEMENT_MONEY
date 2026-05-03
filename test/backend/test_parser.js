/**
 * ═══════════════════════════════════════════════════════════════
 *  TEST SUITE: TransactionParser — Smart Transaction Detector
 *
 *  Port logic Kotlin sang JavaScript để test trên Node.js
 *  Verify: regex extraction, type detection, category classification
 *
 *  Chạy: node test_parser.js
 * ═══════════════════════════════════════════════════════════════
 */

// ── Re-implement TransactionParser logic in JS ──

const bankMap = {
  "com.VCB": { name: "VCB", displayName: "Vietcombank",
    incomeKeywords: ["GD: +", "GD:+", "so tien GD: +"],
    expenseKeywords: ["GD: -", "GD:-", "so tien GD: -", "Thanh toan"] },
  "vn.com.techcombank.bb.app": { name: "TCB", displayName: "Techcombank",
    incomeKeywords: ["+", "Nhận", "nhan"],
    expenseKeywords: ["-", "Thanh toán", "Chuyển", "thanh toan", "chuyen"] },
  "com.vnpay.bidv": { name: "BIDV", displayName: "BIDV",
    incomeKeywords: ["GD: +", "Nhận", "nhan"],
    expenseKeywords: ["GD: -", "Thanh toán", "thanh toan", "Trừ"] },
  "com.vnpay.vietinbank": { name: "CTG", displayName: "VietinBank",
    incomeKeywords: ["GD: +", "Nhận"],
    expenseKeywords: ["GD: -", "Thanh toán"] },
  "com.mbmobile": { name: "MB", displayName: "MB Bank",
    incomeKeywords: ["+", "Nhận", "nhan"],
    expenseKeywords: ["-", "Trừ", "thanh toan", "Chuyển"] },
  "com.mservice.momotransfer": { name: "MOMO", displayName: "MoMo",
    incomeKeywords: ["nhận", "Nhận", "nhan duoc", "Bạn vừa nhận"],
    expenseKeywords: ["chuyển", "thanh toán", "Bạn vừa chuyển", "trừ"] },
  "vn.com.vng.zalopay": { name: "ZALO", displayName: "ZaloPay",
    incomeKeywords: ["nhận", "Nhận"],
    expenseKeywords: ["thanh toán", "chuyển", "Chuyển"] },
  "vn.tpb.mb.gprsandroid": { name: "TPB", displayName: "TPBank",
    incomeKeywords: ["+", "Nhận"],
    expenseKeywords: ["-", "Trừ", "Thanh toán"] },
};

function isBankingApp(pkg) { return pkg in bankMap; }

function extractAmount(text) {
  const patterns = [
    /GD[:\s]*[+\-]?\s*([0-9.,]+)\s*(?:VND|đ|d)?/i,
    /(?:so tien|số tiền|s[oố] ti[eề]n)[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?/i,
    /(?:nhận|nhan|chuyển|chuyen|thanh toán|thanh toan|trừ)\s+([0-9.,]+)\s*(?:VND|đ|d)?/i,
    /[+\-]\s?([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?/i,
    /([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|đ|d)?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const cleaned = m[1].replace(/[.,]/g, "");
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount >= 1000) return amount;
    }
  }
  return null;
}

function detectType(text, bankInfo) {
  // PRIORITY 1: Check explicit +/- signs (most reliable signal)
  if (text.includes("GD: +") || text.includes("GD:+")) return "income";
  if (text.includes("GD: -") || text.includes("GD:-")) return "expense";

  // PRIORITY 2: Check for strong income signals
  const lower = text.toLowerCase();
  const strongIncomeSignals = ["bạn vừa nhận", "nhận được", "nhan duoc", "nhận +"];
  for (const signal of strongIncomeSignals) {
    if (lower.includes(signal)) return "income";
  }

  // PRIORITY 3: Check bank-specific keywords (only long ones, skip single chars)
  for (const kw of bankInfo.expenseKeywords) {
    if (kw.length >= 3 && lower.includes(kw.toLowerCase())) return "expense";
  }
  for (const kw of bankInfo.incomeKeywords) {
    if (kw.length >= 3 && lower.includes(kw.toLowerCase())) return "income";
  }

  // PRIORITY 4: Simple +/- check
  if (text.includes("+") && !text.includes("-")) return "income";
  if (text.includes("-") && !text.includes("+")) return "expense";
  return "income";
}

function extractBalance(text) {
  const patterns = [
    /(?:SD|Số dư|so du|s[oố] d[uư])[:\s]*([0-9.,]+)\s*(?:VND|đ|d)?/i,
    /(?:Available|Avail)[:\s]*([0-9.,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const cleaned = m[1].replace(/[.,]/g, "");
      return parseFloat(cleaned);
    }
  }
  return null;
}

function extractDescription(text) {
  const patterns = [
    /(?:ND|Noi dung|nội dung)[:\s]*(.+?)(?:\.|$)/i,
    /(?:CHUYEN KHOAN|CK|Chuyển khoản)[:\s]*(.+?)(?:\.|$)/i,
    /(?:tai|từ|tu|toi|đến)\s+(.+?)(?:\.|SD|$)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1].trim().length > 3) return m[1].trim().substring(0, 100);
  }
  return text.substring(0, 80).trim();
}

function classifyCategory(desc, type) {
  const d = desc.toLowerCase();
  const containsAny = (...kws) => kws.some(k => d.includes(k));

  if (type === "income") {
    if (containsAny("luong", "lương", "salary", "wage")) return { id: "cat_salary", name: "Lương", conf: 0.90 };
    if (containsAny("thuong", "thưởng", "bonus")) return { id: "cat_bonus", name: "Thưởng", conf: 0.85 };
    if (containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer")) return { id: "cat_transfer", name: "Chuyển khoản", conf: 0.70 };
    if (containsAny("lai", "lãi", "interest")) return { id: "cat_interest", name: "Tiền lãi", conf: 0.80 };
    return { id: null, name: "Thu nhập khác", conf: 0.30 };
  }
  if (containsAny("grab", "gojek", "be", "taxi", "uber", "xang", "xăng", "parking")) return { id: "cat_transport", name: "Di chuyển", conf: 0.85 };
  if (containsAny("shopeepay", "shopee", "lazada", "tiki", "mua", "order")) return { id: "cat_shopping", name: "Mua sắm", conf: 0.80 };
  if (containsAny("dien", "điện", "nuoc", "nước", "internet", "wifi", "evn")) return { id: "cat_bills", name: "Hóa đơn", conf: 0.85 };
  if (containsAny("com", "cơm", "an", "ăn", "pho", "phở", "cafe", "coffee", "tra sua", "trà sữa", "baemin", "now", "food")) return { id: "cat_food", name: "Ăn uống", conf: 0.80 };
  if (containsAny("benh vien", "bệnh viện", "thuoc", "thuốc", "doctor", "hospital", "clinic")) return { id: "cat_health", name: "Sức khỏe", conf: 0.80 };
  if (containsAny("hoc phi", "học phí", "school", "education", "uni", "course")) return { id: "cat_education", name: "Giáo dục", conf: 0.80 };
  if (containsAny("nha", "nhà", "rent", "thue", "thuê", "apartment")) return { id: "cat_housing", name: "Nhà ở", conf: 0.75 };
  if (containsAny("chuyen khoan", "chuyển khoản", "ck", "transfer")) return { id: "cat_transfer_out", name: "Chuyển khoản", conf: 0.65 };
  return { id: null, name: null, conf: 0.0 };
}

function parse(packageName, title, body) {
  const bankInfo = bankMap[packageName];
  if (!bankInfo) return null;
  const fullText = `${title} ${body}`;
  const amount = extractAmount(fullText);
  if (!amount) return null;
  const type = detectType(fullText, bankInfo);
  const balance = extractBalance(fullText);
  const description = extractDescription(fullText);
  // Use fullText for classification (not just description) for better keyword matching
  const cat = classifyCategory(fullText, type);
  return { amount, type, bankName: bankInfo.displayName, description, balanceAfter: balance,
    suggestedCategoryId: cat.id, suggestedCategoryName: cat.name, confidence: cat.conf, rawText: fullText };
}

// ═══════════════════════════════════════════════════
//  TEST FRAMEWORK
// ═══════════════════════════════════════════════════

let totalTests = 0, passedCount = 0, failedCount = 0;
const failures = [];

function assert(cond, name) {
  totalTests++;
  if (cond) { passedCount++; console.log(`  ✅ PASS: ${name}`); }
  else { failedCount++; failures.push(name); console.log(`  ❌ FAIL: ${name}`); }
}

function assertEquals(exp, act, name) {
  totalTests++;
  if (exp === act) { passedCount++; console.log(`  ✅ PASS: ${name}`); }
  else { failedCount++; failures.push(`${name} (expected: ${exp}, got: ${act})`); console.log(`  ❌ FAIL: ${name} — expected: «${exp}» actual: «${act}»`); }
}

function section(name) {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║ ${name}`);
  console.log(`╚══════════════════════════════════════════════════╝`);
}

// ═══════════════════════════════════════════════════
//  RUN TESTS
// ═══════════════════════════════════════════════════

console.log("🧪 TransactionParser — Unit Test Suite (Node.js)");
console.log("═══════════════════════════════════════════════\n");

// TEST 1: Bank Package Recognition
section("TEST 1: Bank Package Recognition");
assert(isBankingApp("com.VCB"), "VCB is banking app");
assert(isBankingApp("vn.com.techcombank.bb.app"), "TCB is banking app");
assert(isBankingApp("com.vnpay.bidv"), "BIDV is banking app");
assert(isBankingApp("com.mbmobile"), "MB is banking app");
assert(isBankingApp("com.mservice.momotransfer"), "MoMo is banking app");
assert(isBankingApp("vn.com.vng.zalopay"), "ZaloPay is banking app");
assert(isBankingApp("vn.tpb.mb.gprsandroid"), "TPBank is banking app");
assert(!isBankingApp("com.facebook.katana"), "Facebook is NOT banking app");
assert(!isBankingApp("com.google.android.youtube"), "YouTube is NOT banking app");
assertEquals(8, Object.keys(bankMap).length, "Total supported banks = 8");

// TEST 2: VCB Income
section("TEST 2: VCB — Income (Nhận chuyển khoản)");
const vcbIncome = parse("com.VCB", "Vietcombank", "GD: +1,000,000 VND. SD: 5,000,000 VND. ND: CHUYEN KHOAN TU NGUYEN VAN A");
assert(vcbIncome !== null, "VCB income parsed");
assertEquals(1000000, vcbIncome?.amount, "Amount = 1,000,000");
assertEquals("income", vcbIncome?.type, "Type = income");
assertEquals("Vietcombank", vcbIncome?.bankName, "Bank = Vietcombank");
assertEquals(5000000, vcbIncome?.balanceAfter, "Balance = 5,000,000");
assert(vcbIncome?.description?.length > 3, "VCB description extracted (length > 3)");

// TEST 3: VCB Expense
section("TEST 3: VCB — Expense (Thanh toán)");
const vcbExpense = parse("com.VCB", "Vietcombank", "GD: -500,000 VND. SD: 4,500,000 VND. Thanh toan don hang Shopee");
assert(vcbExpense !== null, "VCB expense parsed");
assertEquals(500000, vcbExpense?.amount, "Amount = 500,000");
assertEquals("expense", vcbExpense?.type, "Type = expense");
assertEquals(4500000, vcbExpense?.balanceAfter, "Balance = 4,500,000");

// TEST 4: MoMo Income
section("TEST 4: MoMo — Income");
const momoIncome = parse("com.mservice.momotransfer", "MoMo", "Bạn vừa nhận 200.000đ từ TRAN THI B. ND: Tra tien com");
assert(momoIncome !== null, "MoMo income parsed");
assertEquals(200000, momoIncome?.amount, "Amount = 200,000");
assertEquals("income", momoIncome?.type, "Type = income");
assertEquals("MoMo", momoIncome?.bankName, "Bank = MoMo");

// TEST 5: MoMo Expense
section("TEST 5: MoMo — Expense");
const momoExpense = parse("com.mservice.momotransfer", "MoMo", "Bạn vừa chuyển 150.000đ đến LE VAN C. ND: Thanh toan grab");
assert(momoExpense !== null, "MoMo expense parsed");
assertEquals(150000, momoExpense?.amount, "Amount = 150,000");
assertEquals("expense", momoExpense?.type, "Type = expense");

// TEST 6: Techcombank Income
section("TEST 6: Techcombank — Income (Lương)");
const tcbIncome = parse("vn.com.techcombank.bb.app", "Techcombank", "TK 1234: +3,500,000 VND. Noi dung: LUONG THANG 4");
assert(tcbIncome !== null, "TCB income parsed");
assertEquals(3500000, tcbIncome?.amount, "Amount = 3,500,000");
assertEquals("income", tcbIncome?.type, "Type = income");

// TEST 7: BIDV Expense
section("TEST 7: BIDV — Expense (Hóa đơn điện)");
const bidvExpense = parse("com.vnpay.bidv", "BIDV SmartBanking", "GD: -2,000,000 VND. SD: 8,000,000 VND. Thanh toán tien dien EVN");
assert(bidvExpense !== null, "BIDV expense parsed");
assertEquals(2000000, bidvExpense?.amount, "Amount = 2,000,000");
assertEquals("expense", bidvExpense?.type, "Type = expense");
assertEquals(8000000, bidvExpense?.balanceAfter, "Balance = 8,000,000");

// TEST 8: MB Bank Large Amount
section("TEST 8: MB Bank — Large Amount");
const mbLarge = parse("com.mbmobile", "MB Bank", "Nhận +50,000,000 VND từ CONG TY ABC. ND: Chuyển khoản lương");
assert(mbLarge !== null, "MB large parsed");
assertEquals(50000000, mbLarge?.amount, "Amount = 50,000,000");
assertEquals("income", mbLarge?.type, "Type = income");

// TEST 9: Category Classification — Income
section("TEST 9: Category Classification — Income");
const salaryResult = parse("vn.com.techcombank.bb.app", "TCB", "TK 5678: +15,000,000 VND. Noi dung: LUONG THANG 4 2026");
assertEquals("cat_salary", salaryResult?.suggestedCategoryId, "Salary → cat_salary");
assertEquals("Lương", salaryResult?.suggestedCategoryName, "Name = 'Lương'");
assert(salaryResult?.confidence >= 0.8, "Salary confidence >= 80%");

// TEST 10: Category Classification — Expense
section("TEST 10: Category Classification — Expense");
const shopResult = parse("com.VCB", "VCB", "GD: -350,000 VND. SD: 1,500,000 VND. Thanh toan ShopeePay don hang");
assertEquals("expense", shopResult?.type, "Shop type = expense");
assertEquals("cat_shopping", shopResult?.suggestedCategoryId, "Shopee → cat_shopping");

const billResult = parse("com.vnpay.bidv", "BIDV", "GD: -800,000 VND. SD: 3,000,000 VND. Thanh toán tien dien EVN T4/2026");
assertEquals("expense", billResult?.type, "Bill type = expense");
assertEquals("cat_bills", billResult?.suggestedCategoryId, "EVN → cat_bills");

const transportResult = parse("com.mservice.momotransfer", "MoMo", "Bạn vừa chuyển 85.000đ cho Grab. ND: Thanh toan cuoc xe Grab");
assertEquals("expense", transportResult?.type, "Transport type = expense");
assertEquals("cat_transport", transportResult?.suggestedCategoryId, "Grab → cat_transport");

// TEST 11: Edge Cases
section("TEST 11: Edge Cases");
const nonBank = parse("com.facebook.katana", "FB", "You have a new message");
assert(nonBank === null, "Non-banking app → null");

const noAmount = parse("com.VCB", "VCB", "Thong bao bao tri he thong");
assert(noAmount === null, "No amount → null");

const smallAmount = parse("com.VCB", "VCB", "GD: +500 VND. SD: 100 VND");
assert(smallAmount === null, "Amount < 1000 → null (filter noise)");

const dotFormat = parse("com.VCB", "VCB", "GD: +1.500.000 VND. SD: 10.000.000 VND");
assertEquals(1500000, dotFormat?.amount, "Dot format 1.500.000 = 1,500,000");
assertEquals(10000000, dotFormat?.balanceAfter, "Dot format balance 10.000.000");

// TEST 12: ZaloPay / TPBank
section("TEST 12: ZaloPay / TPBank");
const zaloResult = parse("vn.com.vng.zalopay", "ZaloPay", "Nhận 100.000đ từ VO THI E qua ZaloPay");
assert(zaloResult !== null, "ZaloPay parsed");
assertEquals(100000, zaloResult?.amount, "ZaloPay amount = 100,000");
assertEquals("ZaloPay", zaloResult?.bankName, "Bank = ZaloPay");

const tpbResult = parse("vn.tpb.mb.gprsandroid", "TPBank", "TK **1234: +5.000.000 VND. SD: 20.000.000 VND. Nhận chuyển khoản");
assert(tpbResult !== null, "TPBank parsed");
assertEquals(5000000, tpbResult?.amount, "TPBank amount = 5,000,000");
assertEquals("income", tpbResult?.type, "TPBank type = income");

// ══════════════════════════════════════════════════
//  SUMMARY
// ══════════════════════════════════════════════════
console.log("\n");
console.log("══════════════════════════════════════════════════");
console.log("  📊 PARSER TEST RESULTS");
console.log("══════════════════════════════════════════════════");
console.log(`  Total: ${totalTests}`);
console.log(`  ✅ Passed: ${passedCount}`);
console.log(`  ❌ Failed: ${failedCount}`);
console.log(`  Success rate: ${totalTests > 0 ? Math.round(passedCount / totalTests * 100) : 0}%`);

if (failures.length > 0) {
  console.log("\n  ⚠️ Failed tests:");
  failures.forEach(f => console.log(`    - ${f}`));
}

console.log("══════════════════════════════════════════════════");
process.exit(failedCount > 0 ? 1 : 0);
