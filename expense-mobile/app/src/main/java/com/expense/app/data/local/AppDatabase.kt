package com.expense.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.expense.app.data.local.dao.CachedTransactionDao
import com.expense.app.data.local.dao.PendingSyncDao
import com.expense.app.data.local.dao.SuggestedTransactionDao
import com.expense.app.data.local.entity.CachedTransactionEntity
import com.expense.app.data.local.entity.PendingSyncEntity
import com.expense.app.data.local.entity.SuggestedTransactionEntity

/**
 * Room Database cho offline sync.
 * Lưu pending sync operations, cached transactions, và suggested transactions từ banking notification.
 */
@Database(
    entities = [
        PendingSyncEntity::class,
        CachedTransactionEntity::class,
        SuggestedTransactionEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun pendingSyncDao(): PendingSyncDao
    abstract fun cachedTransactionDao(): CachedTransactionDao
    abstract fun suggestedTransactionDao(): SuggestedTransactionDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "expense_offline_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

