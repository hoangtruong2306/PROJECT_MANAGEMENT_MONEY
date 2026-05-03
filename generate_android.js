const fs = require('fs');
const path = require('path');

const root = 'd:/PROJECT_MANGEMENT/expense-mobile';
const appDir = path.join(root, 'app');
const mainDir = path.join(appDir, 'src', 'main');
const javaDir = path.join(mainDir, 'java', 'com', 'expense', 'app');
const resDir = path.join(mainDir, 'res');

fs.mkdirSync(javaDir, { recursive: true });
fs.mkdirSync(path.join(resDir, 'values'), { recursive: true });
fs.mkdirSync(path.join(root, 'gradle', 'wrapper'), { recursive: true });

// 1. settings.gradle.kts
fs.writeFileSync(path.join(root, 'settings.gradle.kts'), `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "ExpenseNative"
include(":app")
`);

// 2. build.gradle.kts (Project)
fs.writeFileSync(path.join(root, 'build.gradle.kts'), `plugins {
    id("com.android.application") version "8.1.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
}
`);

// 3. gradle.properties
fs.writeFileSync(path.join(root, 'gradle.properties'), `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`);

// 4. gradle-wrapper.properties
fs.writeFileSync(path.join(root, 'gradle', 'wrapper', 'gradle-wrapper.properties'), `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

// 5. app/build.gradle.kts
fs.writeFileSync(path.join(appDir, 'build.gradle.kts'), `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.expense.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.expense.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.0")
    implementation(platform("androidx.compose:compose-bom:2023.08.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Retrofit & Navigation & Coroutines
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("androidx.navigation:navigation-compose:2.7.5")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
}
`);

// 6. AndroidManifest.xml
fs.writeFileSync(path.join(mainDir, 'AndroidManifest.xml'), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ExpenseNative"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ExpenseNative">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

// 7. strings.xml
fs.writeFileSync(path.join(resDir, 'values', 'strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ExpenseNative</string>
</resources>
`);

// 8. themes.xml (dummy to satisfy manifest)
fs.writeFileSync(path.join(resDir, 'values', 'themes.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ExpenseNative" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`);

// 9. MainActivity.kt
fs.writeFileSync(path.join(javaDir, 'MainActivity.kt'), `package com.expense.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Text(text = "Hello Native Android!")
                }
            }
        }
    }
}
`);

console.log('Successfully generated Native Android scaffolding!');
