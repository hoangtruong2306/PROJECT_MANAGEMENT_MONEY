package com.expense.app.data.remote

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

object TokenManager {
    private val TOKEN_KEY = stringPreferencesKey("jwt_token")
    private val USER_ID_KEY = stringPreferencesKey("user_id")
    private val USER_NAME_KEY = stringPreferencesKey("user_name")

    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { it[TOKEN_KEY] = token }
    }

    suspend fun saveUser(context: Context, id: String, name: String) {
        context.dataStore.edit {
            it[USER_ID_KEY] = id
            it[USER_NAME_KEY] = name
        }
    }

    fun getToken(context: Context): Flow<String?> =
        context.dataStore.data.map { it[TOKEN_KEY] }

    fun getUserId(context: Context): Flow<String?> =
        context.dataStore.data.map { it[USER_ID_KEY] }

    fun getUserName(context: Context): Flow<String?> =
        context.dataStore.data.map { it[USER_NAME_KEY] }

    fun getTokenSync(context: Context): String? = runBlocking {
        context.dataStore.data.first()[TOKEN_KEY]
    }

    fun getUserIdSync(context: Context): String? = runBlocking {
        context.dataStore.data.first()[USER_ID_KEY]
    }

    suspend fun clear(context: Context) {
        context.dataStore.edit { it.clear() }
    }
}

object RetrofitClient {
    // Use 10.0.2.2 for Android Emulator to reach host machine localhost
    private const val BASE_URL = "http://10.0.2.2:5000/"

    fun create(context: Context): ApiService {
        val authInterceptor = Interceptor { chain ->
            val token = TokenManager.getTokenSync(context)
            val request = if (token != null) {
                chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $token")
                    .build()
            } else {
                chain.request()
            }
            chain.proceed(request)
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
