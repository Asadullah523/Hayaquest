# Haya Quest - Android Application Guide

This project has been converted into an Android application using Capacitor.

## 🚀 How to Get the APK (No Android Studio Required)

Since you don't have Android Studio installed locally, I have set up a **Cloud Build System** using GitHub Actions.

1.  **Push your code to GitHub**:
    Simply commit and push your changes to the main branch of your repository.
    ```bash
    git add .
    git commit -m "Setup Android App"
    git push origin main
    ```

2.  **Download the APK**:
    - Go to your repository on GitHub.
    - Click on the **"Actions"** tab at the top.
    - Click on the latest **"Build Android APK"** workflow run.
    - Scroll down to the **"Artifacts"** section.
    - Click on **"HayaQuest-Debug"** to download the zip file containing your APK.
    - Extract the zip and transfer the `.apk` file to your phone to install!

## Local Development (If you install Android Studio later)

If you decide to install Android Studio in the future, you can build locally:

1.  **Build the Web App**:
    ```bash
    npm run build
    ```

2.  **Sync with Android**:
    ```bash
    npx cap sync
    ```

3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```

## Features Implemented

- **Mobile First UI**: Exact clone of your mobile website.
- **Background Timer**: Native notification support keeps your timer running even when the app is minimized.
- **Offline Capable**: The app allows normal interaction (sync requires internet).

