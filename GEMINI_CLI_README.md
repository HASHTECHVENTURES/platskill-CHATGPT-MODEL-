# 🤖 Gemini CLI Chat Tool

A simple command-line interface to chat with Google Gemini AI directly from your terminal.

## 🚀 Quick Start

### 1. Get Your API Key
First, you need a Google Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key (it starts with `AIza...`)

### 2. Run the CLI Tool

**Option 1: Direct execution**
```bash
node gemini-cli.js
```

**Option 2: Using npm script**
```bash
npm start
```

**Option 3: Using npm run**
```bash
npm run chat
```

### 3. Set Your API Key
Once the tool starts, set your API key:
```
set-key YOUR_GEMINI_API_KEY_HERE
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

### 4. Start Chatting!
Now you can ask questions directly to Gemini:

```
🤖 You: What is artificial intelligence?
🤖 Gemini: Artificial intelligence (AI) is a branch of computer science...
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `help` | Show help message |
| `quit` / `exit` / `bye` | Exit the application |
| `clear` | Clear the screen |
| `set-key YOUR_KEY` | Set your Gemini API key |

## 💡 Example Usage

```bash
# Start the tool
$ node gemini-cli.js

# Set your API key
🤖 You: set-key AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Ask questions
🤖 You: Explain quantum computing in simple terms
🤖 Gemini: Quantum computing is a type of computing that uses...

🤖 You: Write a Python function to calculate fibonacci numbers
🤖 Gemini: Here's a Python function to calculate Fibonacci numbers...

🤖 You: What's the weather like today?
🤖 Gemini: I don't have access to real-time weather data...

# Exit the tool
🤖 You: quit
👋 Goodbye! Thanks for using Gemini CLI!
```

## 🔧 Features

- ✅ **Interactive Chat**: Real-time conversation with Gemini
- ✅ **Colored Output**: Beautiful terminal colors for better readability
- ✅ **Error Handling**: Graceful error handling and user feedback
- ✅ **Command System**: Built-in commands for configuration
- ✅ **API Key Management**: Easy API key setup
- ✅ **Cross-platform**: Works on Windows, macOS, and Linux

## 🛠️ Requirements

- Node.js 14.0.0 or higher
- Internet connection
- Valid Google Gemini API key

## 🔒 Security Notes

- Your API key is stored in memory only (not saved to disk)
- The key will be lost when you close the terminal
- For production use, consider using environment variables

## 🚨 Troubleshooting

### "No API key configured" error
- Use `set-key YOUR_API_KEY` to set your key
- Make sure your API key is valid and active

### "API Error" messages
- Check if your API key is correct
- Ensure you have sufficient API quota
- Verify your internet connection

### "Request failed" errors
- Check your internet connection
- Try again in a few moments
- Verify the Gemini API service is available

## 📝 License

MIT License - Feel free to use and modify as needed!

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy chatting with Gemini! 🚀**
