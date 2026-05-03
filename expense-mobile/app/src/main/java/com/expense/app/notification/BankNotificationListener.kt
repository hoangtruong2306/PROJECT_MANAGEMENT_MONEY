package com.expense.app.notification

import android.app.Notification
import android.content.Intent
import android.os.IBinder
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.expense.app.data.local.AppDatabase
import com.expense.app.data.local.entity.SuggestedTransactionEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

/**
 * NotificationListenerService lắng nghe notification từ các app ngân hàng.
 *
 * Khi phát hiện notification từ banking app:
 * 1. Parse notification text → extract amount, type, description
 * 2. Classify category (local keyword matching)
 * 3. Lưu vào Room DB (SuggestedTransactionEntity)
 * 4. Hiển thị in-app notification "💰 Nhận X đ từ Bank Y"
 *
 * ⚠️ Yêu cầu user cấp "Notification Access" trong Settings hệ thống.
 */
class BankNotificationListener : NotificationListenerService() {

    companion object {
        const val TAG = "BankNotifListener"

        // Debounce: tránh duplicate notification (cùng nội dung trong 30 giây)
        private const val DEBOUNCE_MS = 30_000L
        private val recentHashes = mutableMapOf<Int, Long>()

        /**
         * Kiểm tra service có đang chạy không (dùng cho UI toggle).
         */
        @Volatile
        var isRunning = false
            private set
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var suggestedDao: com.expense.app.data.local.dao.SuggestedTransactionDao

    override fun onCreate() {
        super.onCreate()
        suggestedDao = AppDatabase.getInstance(applicationContext).suggestedTransactionDao()
        isRunning = true
        Log.d(TAG, "BankNotificationListener started")
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        Log.d(TAG, "BankNotificationListener stopped")
    }

    override fun onBind(intent: Intent?): IBinder? {
        return super.onBind(intent)
    }

    /**
     * Callback khi có notification mới từ bất kỳ app nào.
     */
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return

        val packageName = sbn.packageName
        // Chỉ xử lý notification từ banking apps
        if (!TransactionParser.isBankingApp(packageName)) return

        val notification = sbn.notification ?: return
        val extras = notification.extras ?: return

        // Extract title và body text
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val body = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()

        // Prefer bigText (nội dung đầy đủ) over body (bị cắt)
        val fullBody = bigText ?: body

        if (fullBody.isBlank()) return

        Log.d(TAG, "Banking notification from $packageName: title=$title body=$fullBody")

        // Debounce: kiểm tra duplicate
        val hash = "$packageName|$fullBody".hashCode()
        val now = System.currentTimeMillis()
        recentHashes.entries.removeAll { now - it.value > DEBOUNCE_MS }

        if (recentHashes.containsKey(hash)) {
            Log.d(TAG, "Duplicate notification — skipping")
            return
        }
        recentHashes[hash] = now

        // Parse notification
        val result = TransactionParser.parse(packageName, title, fullBody)

        if (result == null) {
            Log.w(TAG, "Could not parse transaction from notification")
            return
        }

        Log.d(TAG, "Parsed: ${result.type} ${result.amount} from ${result.bankName} — ${result.description}")

        // Lưu vào Room DB
        scope.launch {
            try {
                val entity = SuggestedTransactionEntity(
                    amount = result.amount,
                    type = result.type,
                    bankName = result.bankName,
                    description = result.description,
                    suggestedCategoryId = result.suggestedCategoryId,
                    suggestedCategoryName = result.suggestedCategoryName,
                    confidence = result.confidence,
                    rawNotificationText = result.rawText,
                    packageName = packageName,
                    balanceAfter = result.balanceAfter,
                    status = "PENDING"
                )
                suggestedDao.insert(entity)
                Log.d(TAG, "Saved suggested transaction: ${entity.id}")

                // Hiển thị in-app notification
                showDetectedNotification(result)

            } catch (e: Exception) {
                Log.e(TAG, "Error saving suggested transaction", e)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Không cần xử lý
    }

    /**
     * Hiển thị notification tóm tắt cho user.
     */
    private fun showDetectedNotification(result: TransactionParser.ParseResult) {
        val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
        val amountStr = "${fmt.format(result.amount)} đ"

        val (title, body) = if (result.type == "income") {
            "💰 Nhận $amountStr từ ${result.bankName}" to
            "Giao dịch: ${result.description.take(50)}${if (result.suggestedCategoryName != null) " · ${result.suggestedCategoryName}" else ""}"
        } else {
            "💳 Chi $amountStr qua ${result.bankName}" to
            "Giao dịch: ${result.description.take(50)}${if (result.suggestedCategoryName != null) " · ${result.suggestedCategoryName}" else ""}"
        }

        NotificationHelper.showTransactionDetected(applicationContext, title, body)
    }
}
