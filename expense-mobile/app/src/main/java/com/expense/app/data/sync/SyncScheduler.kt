package com.expense.app.data.sync

import android.content.Context
import android.util.Log
import androidx.work.*
import java.util.concurrent.TimeUnit

/**
 * Quản lý việc schedule SyncWorker qua WorkManager.
 *
 * - scheduleOneTime: Trigger sync ngay lập tức (khi server vừa online)
 * - schedulePeriodic: Sync định kỳ mỗi 15 phút (minimum interval của WorkManager)
 * - cancel: Hủy tất cả sync jobs
 */
object SyncScheduler {

    private const val TAG = "SyncScheduler"
    private const val ONE_TIME_WORK_NAME = "sync_one_time"
    private const val PERIODIC_WORK_NAME = "sync_periodic"

    /**
     * Schedule sync ngay lập tức (one-time).
     * Dùng khi: server vừa online trở lại, hoặc sau khi lưu offline.
     */
    fun scheduleOneTime(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                30, TimeUnit.SECONDS
            )
            .addTag("sync")
            .build()

        WorkManager.getInstance(context)
            .enqueueUniqueWork(
                ONE_TIME_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                syncRequest
            )

        Log.d(TAG, "Scheduled one-time sync")
    }

    /**
     * Schedule sync định kỳ mỗi 15 phút.
     * Dùng khi: app khởi động, đảm bảo pending items luôn được sync.
     */
    fun schedulePeriodic(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                30, TimeUnit.SECONDS
            )
            .addTag("sync_periodic")
            .build()

        WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )

        Log.d(TAG, "Scheduled periodic sync (every 15 min)")
    }

    /**
     * Hủy tất cả sync jobs.
     */
    fun cancelAll(context: Context) {
        WorkManager.getInstance(context).cancelAllWorkByTag("sync")
        WorkManager.getInstance(context).cancelAllWorkByTag("sync_periodic")
        Log.d(TAG, "Cancelled all sync jobs")
    }

    /**
     * Kiểm tra có sync job đang chạy không.
     */
    fun isRunning(context: Context): Boolean {
        val workInfos = WorkManager.getInstance(context)
            .getWorkInfosForUniqueWork(ONE_TIME_WORK_NAME)
            .get()
        return workInfos.any { it.state == WorkInfo.State.RUNNING }
    }
}
