#!/usr/bin/env node

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

// Ask about Orange Digital
async function askAboutOrangeDigital() {
    console.log(colors.cyan + colors.bright);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    🤖 Asking Gemini                          ║');
    console.log('║                    About: Orange Digital                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    console.log('');

    const question = "What is Orange Digital? Please provide a comprehensive explanation including what they do, their services, and any notable information about the company.";

    console.log(colors.green + `🤖 Question: ${question}` + colors.reset);
    console.log(colors.blue + '🤔 Thinking...' + colors.reset);
    console.log('');

    try {
        const response = await askGemini(question);
        console.log(colors.magenta + '🤖 Gemini Response:' + colors.reset);
        console.log('');
        console.log(response);
        console.log('');
        console.log(colors.yellow + '─'.repeat(80) + colors.reset);
        console.log('');
        console.log(colors.green + colors.bright + '✅ Question answered successfully!' + colors.reset);
        
    } catch (error) {
        console.log(colors.red + '❌ Error: ' + colors.reset + error.message);
        console.log('');
    }
}

// Run the question
askAboutOrangeDigital().catch(error => {
    console.error(colors.red + '❌ Failed: ' + colors.reset + error.message);
    process.exit(1);
});
