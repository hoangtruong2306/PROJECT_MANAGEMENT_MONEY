package com.expense.app.data.cloud

import android.content.Context
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.tasks.await

/**
 * Class test để xác nhận Firebase Firestore đã kết nối thành công.
 * 
 * Gọi FirebaseTest.runTest(context) trong MainActivity hoặc ViewModel
 * để kiểm tra. Xem kết quả trong Logcat với tag "FirebaseTest".
 * 
 * ⚠️ XÓA FILE NÀY SAU KHI TEST XONG.
 */
object FirebaseTest {

    private const val TAG = "FirebaseTest"

    /**
     * Test 1: Kiểm tra Firebase đã khởi tạo chưa
     */
    fun checkInitialized(context: Context): Boolean {
        return try {
            val app = FirebaseApp.getInstance()
            Log.d(TAG, "✅ Firebase initialized: ${app.name}")
            Log.d(TAG, "   Project ID: ${app.options.projectId}")
            Log.d(TAG, "   App ID: ${app.options.applicationId}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Firebase NOT initialized: ${e.message}")
            false
        }
    }

    /**
     * Test 2: Ghi 1 document test lên Firestore rồi đọc lại
     */
    suspend fun testFirestoreWriteRead(): Boolean {
        return try {
            val db = Firebase.firestore
            val testDoc = hashMapOf(
                "message" to "Hello from Expense App!",
                "timestamp" to System.currentTimeMillis(),
                "test" to true
            )

            // Ghi
            Log.d(TAG, "📝 Writing test document to Firestore...")
            db.collection("_test")
                .document("connection_test")
                .set(testDoc)
                .await()
            Log.d(TAG, "✅ Write successful!")

            // Đọc lại
            Log.d(TAG, "📖 Reading test document back...")
            val snapshot = db.collection("_test")
                .document("connection_test")
                .get()
                .await()

            if (snapshot.exists()) {
                Log.d(TAG, "✅ Read successful! Data: ${snapshot.data}")
                
                // Cleanup: xóa document test
                db.collection("_test").document("connection_test").delete().await()
                Log.d(TAG, "🗑️ Test document cleaned up")
                true
            } else {
                Log.e(TAG, "❌ Document not found after write!")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Firestore test FAILED: ${e.message}", e)
            false
        }
    }

    /**
     * Test 3: Test full flow — ghi pending sync item rồi đọc lại
     */
    suspend fun testPendingSyncFlow(): Boolean {
        return try {
            val db = Firebase.firestore
            val testItem = hashMapOf(
                "localId" to "test-${System.currentTimeMillis()}",
                "action" to "CREATE",
                "entityType" to "transaction",
                "payload" to """{"type":"expense","amount":50000,"note":"Test offline"}""",
                "userId" to "test-user",
                "createdAt" to System.currentTimeMillis(),
                "syncStatus" to "PENDING_SERVER"
            )

            // 1. Ghi pending sync item
            val docId = testItem["localId"] as String
            Log.d(TAG, "📝 Writing pending_sync test item: $docId")
            db.collection("pending_sync")
                .document(docId)
                .set(testItem)
                .await()
            Log.d(TAG, "✅ Pending sync item written!")

            // 2. Query pending items
            Log.d(TAG, "🔍 Querying pending items for test-user...")
            val results = db.collection("pending_sync")
                .whereEqualTo("userId", "test-user")
                .whereEqualTo("syncStatus", "PENDING_SERVER")
                .get()
                .await()

            Log.d(TAG, "✅ Found ${results.size()} pending items")
            results.documents.forEach { doc ->
                Log.d(TAG, "   - ${doc.id}: ${doc.getString("entityType")}/${doc.getString("action")}")
            }

            // 3. Cleanup
            db.collection("pending_sync").document(docId).delete().await()
            Log.d(TAG, "🗑️ Test item cleaned up")

            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Pending sync flow test FAILED: ${e.message}", e)
            false
        }
    }

    /**
     * Chạy tất cả tests.
     * Gọi trong viewModelScope.launch { FirebaseTest.runAllTests(context) }
     */
    suspend fun runAllTests(context: Context) {
        Log.d(TAG, "═══════════════════════════════════════")
        Log.d(TAG, "  FIREBASE CONNECTION TEST")
        Log.d(TAG, "═══════════════════════════════════════")

        // Test 1
        Log.d(TAG, "\n--- Test 1: Initialization ---")
        val initOk = checkInitialized(context)

        if (!initOk) {
            Log.e(TAG, "⛔ Firebase not initialized — skipping remaining tests")
            Log.e(TAG, "   Check google-services.json and build.gradle")
            return
        }

        // Test 2
        Log.d(TAG, "\n--- Test 2: Firestore Write/Read ---")
        val writeReadOk = testFirestoreWriteRead()

        // Test 3
        Log.d(TAG, "\n--- Test 3: Pending Sync Flow ---")
        val syncFlowOk = testPendingSyncFlow()

        // Summary
        Log.d(TAG, "\n═══════════════════════════════════════")
        Log.d(TAG, "  TEST RESULTS")
        Log.d(TAG, "═══════════════════════════════════════")
        Log.d(TAG, "  Init:       ${if (initOk) "✅ PASS" else "❌ FAIL"}")
        Log.d(TAG, "  Write/Read: ${if (writeReadOk) "✅ PASS" else "❌ FAIL"}")
        Log.d(TAG, "  Sync Flow:  ${if (syncFlowOk) "✅ PASS" else "❌ FAIL"}")
        Log.d(TAG, "═══════════════════════════════════════")

        if (initOk && writeReadOk && syncFlowOk) {
            Log.d(TAG, "🎉 ALL TESTS PASSED — Firebase is ready!")
        } else {
            Log.e(TAG, "⚠️ Some tests failed — check logs above")
        }
    }
}
