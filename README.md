# Gemini Omni-Tool

**The Ultimate AI Interface: Google Gemini (Cloud) + Ollama (Local)**

Created by **The Angel Studio**

Gemini Omni-Tool is a desktop application that combines the power of Google's cloud-based Gemini models with the privacy and offline capabilities of local LLMs via Ollama.

---

## 📥 For Users (How to Install & Run)

**You do NOT need Node.js or any other software installed to use this program.**

1.  **Download:** Go to the [Releases Page](https://github.com/sanek1989/Gemini-Omni-Tool/releases) (once published).
2.  **Choose your version:**
    *   **Installer (`Gemini Omni-Tool Setup X.X.X.exe`):** Recommended. Installs the app to your system and supports **automatic updates**.
    *   **Portable (`Gemini Omni-Tool Portable X.X.X.exe`):** A single file you can run from anywhere (USB stick, desktop folder). No installation required.
3.  **Run:** Double-click the `.exe` file.
4.  **Setup AI:**
    *   **Gemini:** Click Settings -> Enter your [Google API Key](https://aistudio.google.com/app/apikey).
    *   **Ollama:** Install [Ollama](https://ollama.com/) separately if you want to use local models, then run `ollama serve` in a terminal.

---

## 🛠 For Developers (How to Build from Source)

If you want to modify the code or build the `.exe` files yourself, follow these steps.

### Prerequisites
*   **Node.js:** (Version 16+) [Download here](https://nodejs.org/).
*   **Git:** [Download here](https://git-scm.com/).

### 1. Install & Setup
```bash
# Clone the repository
git clone https://github.com/sanek1989/Gemini-Omni-Tool.git
cd Gemini-Omni-Tool

# Install dependencies (This downloads libraries to the local project folder only)
npm install
```

### 2. Development Mode
To run the app locally for testing:
```bash
npm run dev
```

### 3. Build Executables
To create the `.exe` files for distribution:
```bash
npm run build
```
*   **Output:** Check the `dist/` folder.
*   You will find both the **Installer** and the **Portable** versions there.

### 4. Configuring Auto-Update
1.  Push your code changes to GitHub.
2.  Create a **New Release** on GitHub.
3.  Upload the `.exe` files from the `dist/` folder to the release assets.
4.  The application (Installer version) will automatically detect the new version and prompt users to update.

---

## 🚀 Features
*   **Dual Mode:** Switch instantly between Gemini (Fast, Smart, Cloud) and Ollama (Private, Local, Uncensored).
*   **Vision Support:** Analyze images using Gemini Vision or LLaVA (Local).
*   **Auto-Updates:** Stay up to date effortlessly.
*   **Portable:** Run without admin rights or installation.

## License
MIT License
