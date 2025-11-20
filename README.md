# Gemini Omni-Tool

A powerful, modern AI interface capable of switching between Google's Gemini models (Cloud) and local Ollama models (Local).

**Made by The Angel Studio**

## Features

*   **Dual Provider Support:**
    *   **Google Gemini:** Access the latest Gemini 1.5, 2.0, and 3.0 models with your API key.
    *   **Local Ollama:** Run Llama 3, Mistral, Llava, and other models locally on your machine for privacy and offline use.
*   **Chat Interface:** Full markdown support, code highlighting, and conversation history.
*   **Vision Capabilities:** Analyze images using Gemini Vision or multimodal local models (like Llava).
*   **Desktop Application:** Built with Electron for a native experience on Windows.
*   **Auto-Updates:** Built-in support for automatic updates via GitHub Releases.

## Prerequisites

1.  **Node.js:** Install Node.js (v16 or higher) from [nodejs.org](https://nodejs.org/).
2.  **Ollama (Optional):** For local model support, install [Ollama](https://ollama.com/) and pull your desired models (e.g., `ollama run llama3`).

## Installation (Development)

1.  Clone the repository:
    ```bash
    git clone https://github.com/sanek1989/Gemini-Omni-Tool.git
    cd Gemini-Omni-Tool
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run in development mode (starts the server and opens Electron):
    ```bash
    npm run dev
    ```

## Building the Desktop App (.exe)

To create a standalone Windows installer (`.exe`) with auto-update support:

1.  **Verify Configuration:** The `package.json` is already configured for the repository `sanek1989/Gemini-Omni-Tool`.

2.  Run the build command:
    ```bash
    npm run build
    ```

3.  The installer will be created in the `dist/` folder (e.g., `Gemini Omni-Tool Setup 1.0.0.exe`).

## Configuring Auto-Updates

For users to receive updates automatically:

1.  Push your changes to GitHub.
2.  **Important:** You need to create a **GitHub Token** (Personal Access Token) with `repo` scope if you want to publish directly from the command line, OR simply upload the artifacts manually to GitHub Releases.
3.  Draft a new **Release** on GitHub (e.g., tag `v1.0.1`).
4.  Upload the generated `.exe` and `.blockmap` files from the `dist/` folder to the release assets.
5.  Publish the release.
6.  The app will automatically detect the new version upon launch and prompt the user to update.

## Usage

### Using Gemini (Cloud)
1.  Go to Settings.
2.  Select **Google Gemini**.
3.  Enter your [Google AI Studio API Key](https://aistudio.google.com/app/apikey).
4.  The app will automatically fetch available models.

### Using Ollama (Local)
1.  Ensure Ollama is running (`ollama serve`).
2.  Go to Settings.
3.  Select **Local Ollama**.
4.  The app attempts to connect to `http://localhost:3000` (which proxies to port 11434).
5.  Select your model from the dropdown.

## Troubleshooting

*   **"Failed to fetch" (Ollama):** Ensure the background server is running. If running via `npm run dev` or the installed `.exe`, this is handled automatically. If running manually, execute `node server.js`.
*   **CORS Errors:** The app uses a local proxy server (port 3000) to communicate with Ollama to avoid CORS issues. Ensure you are pointing settings to `http://localhost:3000`.

---
License: MIT