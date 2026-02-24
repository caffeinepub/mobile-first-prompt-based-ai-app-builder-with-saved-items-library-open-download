// Note: This is a placeholder implementation since jszip is not available in the fixed package.json
// For a production implementation, jszip would need to be added to dependencies

export async function exportAndroidProjectZip(creationId: string, parsedContent: any): Promise<Blob> {
  // Since jszip is not available in the fixed package.json, we'll create a simple text file
  // with instructions on how to set up the Android project manually
  
  const instructions = generateAndroidSetupInstructions(parsedContent);
  const blob = new Blob([instructions], { type: 'text/plain' });
  
  return blob;
}

function generateAndroidSetupInstructions(parsedContent: any): string {
  const title = parsedContent.data?.title || parsedContent.prompt || 'My App';
  const dataJson = JSON.stringify(parsedContent.data || {}, null, 2);
  
  return `# Android Setup Instructions

## About This Export

This file contains instructions for creating an Android app for your creation: "${title}"

Note: This is a setup guide, not an installable APK. For immediate use, download the HTML export instead.

## Recommended: Use HTML Export

For the quickest way to use your creation on Android:
1. Download the HTML export from the download menu
2. Open the downloaded .html file in any browser on your Android device
3. Your creation will work immediately without any setup

The HTML export is fully functional and works offline after the first load.

## Advanced: Create Native Android App

If you need a native Android app, follow these steps:

### 1. Install Android Studio
Download from: https://developer.android.com/studio

### 2. Create New Project
- Open Android Studio
- File → New → New Project
- Select "Empty Activity"
- Set package name: com.caffeine.myapp
- Minimum SDK: API 21 (Android 5.0)
- Click Finish

### 3. Add WebView to MainActivity

Replace the content of MainActivity.java with:

\`\`\`java
package com.caffeine.myapp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
\`\`\`

### 4. Update Layout

Replace res/layout/activity_main.xml with:

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
\`\`\`

### 5. Create Web Content

Create a file at app/src/main/assets/index.html with:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        .info { color: #666; line-height: 1.6; }
        .data { 
            background: #f9f9f9; 
            padding: 16px; 
            border-radius: 8px; 
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="info">
            <p>This is your generated app running in a WebView!</p>
            <p style="margin-top: 12px;">Type: <strong>${parsedContent.type}</strong></p>
        </div>
        <div class="data">
            <pre>${dataJson}</pre>
        </div>
    </div>
</body>
</html>
\`\`\`

### 6. Update AndroidManifest.xml

Add internet permission in app/src/main/AndroidManifest.xml:

\`\`\`xml
<uses-permission android:name="android.permission.INTERNET" />
\`\`\`

### 7. Build APK

- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Or run: ./gradlew assembleDebug
- APK will be in: app/build/outputs/apk/debug/app-debug.apk

### 8. Install on Device

- Connect Android device via USB
- Enable USB debugging in Developer Options
- Run: adb install app/build/outputs/apk/debug/app-debug.apk

## Your App Data

Type: ${parsedContent.type}
Prompt: ${parsedContent.prompt || 'N/A'}

Data:
${dataJson}

---

Built with ❤️ using caffeine.ai
https://caffeine.ai

## Remember

For immediate use without development tools, use the HTML export option instead.
The HTML file works on any device with a web browser.
`;
}
