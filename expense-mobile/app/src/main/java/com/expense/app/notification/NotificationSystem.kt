package com.expense.app.notification

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.expense.app.MainActivity
import com.expense.app.R
import java.util.Calendar

// ── Notification Channels
object NotificationChannels {
    const val DAILY_REMINDER        = "daily_reminder"
    const val BUDGET_ALERT          = "budget_alert"
    const val GOAL_PROGRESS         = "goal_progress"
    const val TRANSACTION_DETECTED  = "transaction_detected"
}

// ── Notification types (used as request codes for PendingIntent)
object NotifType {
    const val DAILY_LOG            = 1001
    const val WEEKLY_SUMMARY       = 1002
    const val BUDGET_WARNING       = 1003
    const val GOAL_ACHIEVED        = 1004
    const val EVENING_CHECK        = 1005
    const val TRANSACTION_DETECTED = 2001
}

// ══════════════════════════════════════════════════
//  NotificationHelper — setup channels + show notifs
// ══════════════════════════════════════════════════
object NotificationHelper {

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        listOf(
            NotificationChannel(
                NotificationChannels.DAILY_REMINDER,
                "Nhắc nhở hàng ngày",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Nhắc bạn ghi lại thu chi mỗi ngày"
                enableLights(true)
                lightColor = android.graphics.Color.GREEN
            },
            NotificationChannel(
                NotificationChannels.BUDGET_ALERT,
                "Cảnh báo ngân sách",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Cảnh báo khi chi tiêu gần hoặc vượt hạn mức"
                enableVibration(true)
            },
            NotificationChannel(
                NotificationChannels.GOAL_PROGRESS,
                "Tiến độ mục tiêu",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Cập nhật tiến độ mục tiêu tiết kiệm"
            },
            NotificationChannel(
                NotificationChannels.TRANSACTION_DETECTED,
                "Nhận diện giao dịch",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Thông báo khi phát hiện giao dịch từ ngân hàng"
                enableVibration(true)
                enableLights(true)
                lightColor = android.graphics.Color.GREEN
            }
        ).forEach { manager.createNotificationChannel(it) }
    }

    fun showDailyReminder(context: Context) {
        val messages = listOf(
            Pair("💰 Đừng quên ghi thu chi!", "Ghi lại giao dịch hôm nay để theo dõi tài chính tốt hơn."),
            Pair("📊 Tài chính hôm nay?", "Hôm nay bạn đã tiêu bao nhiêu? Hãy ghi lại ngay nhé!"),
            Pair("🎯 Mục tiêu tiết kiệm!", "Kiểm tra tiến độ mục tiêu của bạn hôm nay."),
            Pair("🤖 Trợ lý AI sẵn sàng!", "Hỏi AI về cách tối ưu chi tiêu tháng này.")
        )
        val (title, body) = messages.random()
        show(context, NotifType.DAILY_LOG, NotificationChannels.DAILY_REMINDER, title, body, "🌿")
    }

    fun showEveningCheck(context: Context) {
        show(
            context, NotifType.EVENING_CHECK, NotificationChannels.DAILY_REMINDER,
            "📋 Tổng kết ngày hôm nay",
            "Hãy kiểm tra lại chi tiêu trong ngày và cập nhật ghi chú nếu cần.",
            "🌙"
        )
    }

    fun showBudgetWarning(context: Context, category: String, percent: Int) {
        val (title, body) = when {
            percent >= 100 -> Pair(
                "🚨 Vượt hạn mức chi tiêu!",
                "Danh mục \"$category\" đã vượt 100% ngân sách tháng này."
            )
            percent >= 80 -> Pair(
                "⚠️ Gần hết ngân sách!",
                "Danh mục \"$category\" đã dùng $percent% ngân sách. Hãy kiểm soát chi tiêu."
            )
            else -> Pair(
                "💡 Nhắc nhở ngân sách",
                "Danh mục \"$category\" đã dùng $percent% ngân sách tháng này."
            )
        }
        show(context, NotifType.BUDGET_WARNING, NotificationChannels.BUDGET_ALERT, title, body, "💳")
    }

    fun showGoalAchieved(context: Context, goalName: String) {
        show(
            context, NotifType.GOAL_ACHIEVED, NotificationChannels.GOAL_PROGRESS,
            "🎉 Đạt mục tiêu rồi!",
            "Mục tiêu \"$goalName\" đã hoàn thành! Tuyệt vời lắm!",
            "🏆"
        )
    }

    /**
     * Hiển thị notification khi phát hiện giao dịch từ ngân hàng.
     */
    fun showTransactionDetected(context: Context, title: String, body: String) {
        // Dùng System.nanoTime() làm notifId để không bị ghi đè
        val notifId = (NotifType.TRANSACTION_DETECTED + (System.nanoTime() % 1000).toInt())
        show(
            context, notifId, NotificationChannels.TRANSACTION_DETECTED,
            title, body, "💰"
        )
    }

    fun showWeeklySummary(context: Context, income: String, expense: String, saved: String) {
        show(
            context, NotifType.WEEKLY_SUMMARY, NotificationChannels.DAILY_REMINDER,
            "📈 Tóm tắt tuần này",
            "Thu: $income · Chi: $expense · Tiết kiệm: $saved",
            "📊"
        )
    }

    private fun show(
        context: Context,
        notifId: Int,
        channel: String,
        title: String,
        body: String,
        largeEmoji: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context, notifId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channel)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(
                if (channel == NotificationChannels.BUDGET_ALERT)
                    NotificationCompat.PRIORITY_HIGH
                else NotificationCompat.PRIORITY_DEFAULT
            )
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setColor(android.graphics.Color.parseColor("#059669"))
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(notifId, notification)
    }
}

// ══════════════════════════════════════════════════
//  NotificationScheduler — schedule recurring alarms
// ══════════════════════════════════════════════════
object NotificationScheduler {

    fun scheduleAll(context: Context) {
        scheduleDailyMorning(context)   // 8:00 sáng mỗi ngày
        scheduleDailyEvening(context)   // 21:00 tối mỗi ngày
    }

    fun cancelAll(context: Context) {
        listOf(NotifType.DAILY_LOG, NotifType.EVENING_CHECK).forEach { requestCode ->
            val intent = Intent(context, NotificationReceiver::class.java)
            val pi = PendingIntent.getBroadcast(
                context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.cancel(pi)
        }
    }

    private fun scheduleDailyMorning(context: Context) {
        scheduleDaily(context, hour = 8, minute = 0, requestCode = NotifType.DAILY_LOG,
            action = NotificationReceiver.ACTION_MORNING)
    }

    private fun scheduleDailyEvening(context: Context) {
        scheduleDaily(context, hour = 21, minute = 0, requestCode = NotifType.EVENING_CHECK,
            action = NotificationReceiver.ACTION_EVENING)
    }

    private fun scheduleDaily(context: Context, hour: Int, minute: Int, requestCode: Int, action: String) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, NotificationReceiver::class.java).apply { this.action = action }
        val pi = PendingIntent.getBroadcast(
            context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            // If time has already passed today, schedule for tomorrow
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && am.canScheduleExactAlarms()) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pi)
            } else {
                am.setInexactRepeating(AlarmManager.RTC_WAKEUP, calendar.timeInMillis,
                    AlarmManager.INTERVAL_DAY, pi)
            }
        } catch (e: SecurityException) {
            // Fallback to inexact
            am.setInexactRepeating(AlarmManager.RTC_WAKEUP, calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY, pi)
        }
    }
}

// ══════════════════════════════════════════════════
//  BroadcastReceiver — handles alarm triggers
// ══════════════════════════════════════════════════
class NotificationReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_MORNING = "com.expense.app.MORNING_REMINDER"
        const val ACTION_EVENING = "com.expense.app.EVENING_REMINDER"
        const val ACTION_BOOT    = Intent.ACTION_BOOT_COMPLETED
    }

    override fun onReceive(context: Context, intent: Intent) {
        NotificationHelper.createChannels(context)
        when (intent.action) {
            ACTION_MORNING -> NotificationHelper.showDailyReminder(context)
            ACTION_EVENING -> NotificationHelper.showEveningCheck(context)
            ACTION_BOOT    -> {
                // Re-schedule on device reboot
                NotificationScheduler.scheduleAll(context)
            }
        }
    }
}
