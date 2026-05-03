package com.expense.app.data.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

/**
 * Theo dõi trạng thái kết nối mạng và khả năng truy cập server backend.
 *
 * - isNetworkAvailable: Thiết bị có kết nối Internet hay không
 * - isServerReachable: Server backend đang phản hồi được hay không
 *
 * Khi server trở lại online → trigger sync.
 */
class NetworkMonitor(private val context: Context) {

    companion object {
        private const val TAG = "NetworkMonitor"
        private const val SERVER_CHECK_INTERVAL_MS = 30_000L // 30 giây
        private const val SERVER_HEALTH_URL = "http://10.0.2.2:5000/api/sync/health"

        @Volatile
        private var INSTANCE: NetworkMonitor? = null

        fun getInstance(context: Context): NetworkMonitor {
            return INSTANCE ?: synchronized(this) {
                val instance = NetworkMonitor(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }

    private val _isNetworkAvailable = MutableStateFlow(false)
    val isNetworkAvailable: StateFlow<Boolean> = _isNetworkAvailable.asStateFlow()

    private val _isServerReachable = MutableStateFlow(false)
    val isServerReachable: StateFlow<Boolean> = _isServerReachable.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var healthCheckJob: Job? = null

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            Log.d(TAG, "Network available")
            _isNetworkAvailable.value = true
            startHealthCheck()
        }

        override fun onLost(network: Network) {
            Log.d(TAG, "Network lost")
            _isNetworkAvailable.value = false
            _isServerReachable.value = false
            stopHealthCheck()
        }

        override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
            val hasInternet = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            _isNetworkAvailable.value = hasInternet
            if (hasInternet) {
                startHealthCheck()
            }
        }
    }

    init {
        // Kiểm tra trạng thái ban đầu
        val activeNetwork = connectivityManager.activeNetwork
        val caps = activeNetwork?.let { connectivityManager.getNetworkCapabilities(it) }
        _isNetworkAvailable.value = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true

        // Đăng ký network callback
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(request, networkCallback)

        // Bắt đầu kiểm tra server nếu có mạng
        if (_isNetworkAvailable.value) {
            startHealthCheck()
        }
    }

    /**
     * Ping server mỗi 30 giây để kiểm tra khả năng kết nối.
     */
    private fun startHealthCheck() {
        if (healthCheckJob?.isActive == true) return

        healthCheckJob = scope.launch {
            while (isActive) {
                checkServerHealth()
                delay(SERVER_CHECK_INTERVAL_MS)
            }
        }
    }

    private fun stopHealthCheck() {
        healthCheckJob?.cancel()
        healthCheckJob = null
    }

    /**
     * Kiểm tra server backend có phản hồi không.
     */
    private suspend fun checkServerHealth() {
        withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(SERVER_HEALTH_URL)
                    .build()

                val response = httpClient.newCall(request).execute()
                val reachable = response.isSuccessful
                response.close()

                if (reachable != _isServerReachable.value) {
                    Log.d(TAG, "Server reachable: $reachable")
                    _isServerReachable.value = reachable

                    // Nếu server vừa trở lại online → trigger sync
                    if (reachable) {
                        Log.d(TAG, "Server back online — triggering sync")
                        SyncScheduler.scheduleOneTime(context)
                    }
                }
            } catch (e: Exception) {
                if (_isServerReachable.value) {
                    Log.d(TAG, "Server unreachable: ${e.message}")
                    _isServerReachable.value = false
                }
            }
        }
    }

    /**
     * Kiểm tra tức thì server có reachable không (one-shot).
     */
    suspend fun checkServerNow(): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(SERVER_HEALTH_URL)
                    .build()
                val response = httpClient.newCall(request).execute()
                val reachable = response.isSuccessful
                response.close()
                _isServerReachable.value = reachable
                reachable
            } catch (e: Exception) {
                _isServerReachable.value = false
                false
            }
        }
    }

    fun destroy() {
        scope.cancel()
        try {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        } catch (_: Exception) { }
    }
}
