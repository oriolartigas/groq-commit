# Groq Commit 🚀

**Groq Commit** is a high-performance extension for Cursor and VS Code that leverages **Groq's** ultra-fast AI to generate intelligent, semantic commit messages from your staged changes (git diff) in record time.

Powered by Groq's LPU™ architecture, generating a commit message is now near-instantaneous.

---

## ✨ Features

- **One-Click Generation**: Analyzes your staged changes and writes the commit message for you.
- **Integrated UI**: Custom action button located directly in the Source Control (Git) title bar.
- **Multilingual Support**: Generate messages in English, Spanish, Catalan, French, German, Italian and Portuguese.
- **Model Selection**: Choose between the latest models (Llama 3.3, Mixtral, etc.).
- **Privacy First**: You use your own Groq API Key. No middle-man servers.

---

## 🚀 Installation

### Option 1: Fast Install (Recommended)

1. Go to the [Releases] section of this GitHub repository.
2. Download the latest groq-commit-X.X.X.vsix file.
3. Open Cursor or VS Code.
4. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac) to open the Command Palette..
5. Type "Install from VSIX" and select the command: Extensions: Install from VSIX...
6. Select the downloaded file and you're ready to go!

### Option 2: Build from Source

1. Clone the repository: git clone https://github.com/oriolartigas/groq-commit.git
2. Install dependencies: npm install
3. Compile the code: npm run compile
4. Package the extension: npx vsce package (This will generate a new .vsix file).
5. Follow the instructions of Option 1.

---

## ⚙️ Configuration

Before the first use, you need to set up your API Key:

1. Get a free key at the [Groq Cloud Console](https://console.groq.com/).
2. In Cursor, go to **Settings** > **Extensions** > **Groq Commit**.
3. Paste your key into the `Groq Commit: Api Key` field.
4. (Optional) Set your preferred default language and model.

---

## 📖 Usage

1. Make changes to your code.
2. Stage your changes using `git add` or the "+" icon in the Git panel.
3. In the **Source Control** panel, look for the sparkle icon (`✨`).
4. **Click the icon** to automatically fill the message box.

---

## 🛠️ Development

If you want to contribute or modify the extension:

```bash
# Install dependencies
npm install

# Compile the code
npm run compile
