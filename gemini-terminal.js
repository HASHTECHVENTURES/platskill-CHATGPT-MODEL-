#!/usr/bin/env node

const readline = require('readline');
const https = require('https');

// Use the API key from your PLAT SKILL system
const GEMINI_API_KEY = 'AIzaSyAh_H6EwL3KOgJ8m086W3OBlCqPo7Khewk';

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask Gemini
function askGemini(question) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{
                parts: [{
                    text: question
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    
                    if (response.error) {
                        reject(new Error(`API Error: ${response.error.message}`));
                        return;
                    }

                    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                        const text = response.candidates[0].content.parts[0].text;
                        resolve(text);
                    } else {
                        reject(new Error('No response from Gemini'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.write(data);
        req.end();
    });
}

// Function to display banner
function showBanner() {
    console.log(colors.cyan + colors.bright);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    🤖 Gemini Terminal Chat                   ║');
    console.log('║                                                              ║');
    console.log('║  Type your questions and press Enter to get AI responses!    ║');
    console.log('║  Type "quit", "exit", or "bye" to end the conversation.     ║');
    console.log('║  Type "help" for available commands.                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    console.log('');
}

// Function to show help
function showHelp() {
    console.log(colors.yellow + colors.bright + '\n📖 Available Commands:' + colors.reset);
    console.log(colors.cyan + '  help' + colors.reset + '     - Show this help message');
    console.log(colors.cyan + '  quit' + colors.reset + '     - Exit the application');
    console.log(colors.cyan + '  exit' + colors.reset + '     - Exit the application');
    console.log(colors.cyan + '  bye' + colors.reset + '      - Exit the application');
    console.log(colors.cyan + '  clear' + colors.reset + '    - Clear the screen');
    console.log('');
    console.log(colors.yellow + '💡 Tips:' + colors.reset);
    console.log('  - Just type your question and press Enter');
    console.log('  - You can ask anything: technical questions, creative writing, etc.');
    console.log('  - The AI will respond with detailed answers');
    console.log('');
}

// Function to clear screen
function clearScreen() {
    console.clear();
    showBanner();
}

// Main chat function
async function startChat() {
    showBanner();

    const askQuestion = () => {
        rl.question(colors.green + '🤖 You: ' + colors.reset, async (input) => {
            const question = input.trim();
            
            if (!question) {
                askQuestion();
                return;
            }

            // Handle commands
            if (question.toLowerCase() === 'quit' || question.toLowerCase() === 'exit' || question.toLowerCase() === 'bye') {
                console.log(colors.yellow + '\n👋 Goodbye! Thanks for using Gemini Terminal!' + colors.reset);
                rl.close();
                return;
            }

            if (question.toLowerCase() === 'help') {
                showHelp();
                askQuestion();
                return;
            }

            if (question.toLowerCase() === 'clear') {
                clearScreen();
                askQuestion();
                return;
            }

            try {
                console.log(colors.blue + '🤔 Thinking...' + colors.reset);
                
                const response = await askGemini(question);
                
                console.log(colors.magenta + '🤖 Gemini: ' + colors.reset + response);
                console.log('');
                console.log(colors.yellow + '─'.repeat(80) + colors.reset);
                console.log('');
                
            } catch (error) {
                console.log(colors.red + '❌ Error: ' + colors.reset + error.message);
                console.log('');
            }

            askQuestion();
        });
    };

    askQuestion();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log(colors.yellow + '\n👋 Goodbye! Thanks for using Gemini Terminal!' + colors.reset);
    rl.close();
    process.exit(0);
});

// Start the chat
startChat().catch(error => {
    console.error(colors.red + '❌ Fatal error: ' + colors.reset + error.message);
    process.exit(1);
});
