// PLAT SKILL Employability Task Generator
// Configuration
const CONFIG = {
    // Gemini API Keys (fallback) - will be loaded from localStorage
    GEMINI_API_KEYS: [
        'AIzaSyAh_H6EwL3KOgJ8m086W3OBlCqPo7Khewk',  // Primary key
        'AIzaSyC0rDffMvwYnTVpAsUI2iMY-N5CqU7lvmU',  // Secondary key
    ],
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // OpenRouter API (Primary) - will be loaded from localStorage
    OPENROUTER_API_KEY: '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',
    OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    OPENROUTER_MODEL: 'google/gemini-2.5-pro',
    
    // OpenAI API - will be loaded from localStorage
    OPENAI_API_KEY: '',
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    
    // Anthropic API - will be loaded from localStorage
    ANTHROPIC_API_KEY: '',
    ANTHROPIC_API_URL: 'https://api.anthropic.com/v1/messages',
    
    // Custom API - will be loaded from localStorage
    CUSTOM_API_ENDPOINT: '',
    CUSTOM_API_KEY: '',
    
    // Model configurations
    MODELS: {
        // Gemini Models
        'gemini-2.0-flash': { provider: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent' },
        'gemini-1.5-pro': { provider: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent' },
        'gemini-1.5-flash': { provider: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent' },
        
        // OpenAI Models
        'gpt-4o': { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions' },
        'gpt-4o-mini': { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions' },
        
        // Anthropic Models
        'claude-3-5-sonnet': { provider: 'anthropic', url: 'https://api.anthropic.com/v1/messages' },
        'claude-3-haiku': { provider: 'anthropic', url: 'https://api.anthropic.com/v1/messages' },
        
        // OpenRouter Models
        'llama-3.2-3b': { provider: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions' },
        'llama-3.2-8b': { provider: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions' },
        'llama-3.2-70b': { provider: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions' },
        'mixtral-8x7b': { provider: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions' },
        'codellama-34b': { provider: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions' }
    },
    
    REQUIRED_FIELDS: ['education-level', 'education-year', 'semester', 'main-skill', 'skill-level', 'task-count'],
    SUPPORTED_LANGUAGES: {
        'en': 'English',
        'hi': 'Hindi',
        'mr': 'Marathi',
        'bn': 'Bengali',
        'te': 'Telugu',
        'ta': 'Tamil',
        'ml': 'Malayalam',
        'kn': 'Kannada',
        'gu': 'Gujarati',
        'pa': 'Punjabi',
        'or': 'Odia'
    }

};

// Load saved API keys on startup
function loadConfigFromStorage() {
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey');
    const savedGeminiKey1 = localStorage.getItem('geminiApiKey1');
    const savedGeminiKey2 = localStorage.getItem('geminiApiKey2');
    const savedOpenAIKey = localStorage.getItem('openaiApiKey');
    const savedAnthropicKey = localStorage.getItem('anthropicApiKey');
    const savedCustomEndpoint = localStorage.getItem('customApiEndpoint');
    const savedCustomKey = localStorage.getItem('customApiKey');
    
    if (savedOpenRouterKey) {
        CONFIG.OPENROUTER_API_KEY = savedOpenRouterKey;
    }
    if (savedGeminiKey1) {
        CONFIG.GEMINI_API_KEYS[0] = savedGeminiKey1;
    }
    if (savedGeminiKey2) {
        CONFIG.GEMINI_API_KEYS[1] = savedGeminiKey2;
    }
    if (savedOpenAIKey) {
        CONFIG.OPENAI_API_KEY = savedOpenAIKey;
    }
    if (savedAnthropicKey) {
        CONFIG.ANTHROPIC_API_KEY = savedAnthropicKey;
    }
    if (savedCustomEndpoint) {
        CONFIG.CUSTOM_API_ENDPOINT = savedCustomEndpoint;
    }
    if (savedCustomKey) {
        CONFIG.CUSTOM_API_KEY = savedCustomKey;
    }
}




// Translation cache for instant switching
const translationCache = new Map();

// DOM Elements
const DOM = {
    form: null,
    loadingDiv: null,
    resultsDiv: null,
    tasksTableBody: null,
    newTasksBtn: null,
    downloadExcelBtn: null,
    translateTasksBtn: null,
    preferredLanguageSelect: null,





    
    init() {
        this.form = document.getElementById('taskForm');
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        this.tasksTableBody = document.getElementById('tasksTableBody');
        this.newTasksBtn = document.getElementById('newTasks');
        this.downloadExcelBtn = document.getElementById('downloadExcel');
        this.translateTasksBtn = document.getElementById('translateTasks');
        this.preferredLanguageSelect = document.getElementById('preferred-language');




        


    }
};

// Initialize application
function initApp() {
    console.log('Initializing PLAT SKILL application...');
    
    // Load saved API keys first
    loadConfigFromStorage();
    
    DOM.init();
    
    // Event Listeners
    DOM.form?.addEventListener('submit', handleFormSubmit);
    DOM.newTasksBtn?.addEventListener('click', resetForm);
    DOM.downloadExcelBtn?.addEventListener('click', downloadExcel);
    DOM.translateTasksBtn?.addEventListener('click', handleTranslateTasks);


    // Initialize API keys
    loadSavedApiKeys();
    

}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(DOM.form);
        const studentData = Object.fromEntries(formData.entries());
        
        if (!validateForm(studentData)) return;
        
        showLoading();
        
        const tasks = await generateEmployabilityTasks(studentData);
        await displayResults(tasks);
        
    } catch (error) {
        console.error('Error generating tasks:', error);
        displayError(getErrorMessage(error));
    }
}

// Form validation
function validateForm(data) {
    for (const field of CONFIG.REQUIRED_FIELDS) {
        if (!data[field]?.trim()) {
            displayError(`Please fill in all required fields. Missing: ${field.replace('-', ' ')}`);
            return false;
        }
    }
    return true;
}

// Smart API call with OpenRouter primary and Gemini fallback
async function makeGeminiAPICall(prompt, config = {}) {
    const defaultConfig = {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // Try OpenRouter first (Primary)
    try {
        console.log('Attempting API call with OpenRouter (Gemini 2.5 Pro)...');
        
        const response = await fetch(CONFIG.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'PLAT SKILL Task Generator'
            },
            body: JSON.stringify({
                model: CONFIG.OPENROUTER_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: finalConfig.maxOutputTokens,
                temperature: finalConfig.temperature,
                top_p: finalConfig.topP
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`OpenRouter API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            
            // Check for specific OpenRouter errors
            if (response.status === 402) {
                console.warn('OpenRouter insufficient credits, falling back to Gemini...');
            } else if (response.status === 429) {
                console.warn('OpenRouter rate limited, falling back to Gemini...');
            }
            
            throw new Error(`OpenRouter failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            console.warn('Invalid response from OpenRouter');
            throw new Error('Invalid response from OpenRouter');
        }

        console.log('API call successful with OpenRouter (Gemini 2.5 Pro)');
        return data.choices[0].message.content.trim();
        
    } catch (error) {
        console.warn('OpenRouter failed, trying Gemini fallback...', error.message);
        
        // Fallback to Gemini API keys
        for (let i = 0; i < CONFIG.GEMINI_API_KEYS.length; i++) {
            const apiKey = CONFIG.GEMINI_API_KEYS[i];
            const isPrimary = i === 0;
            
            try {
                console.log(`Attempting Gemini API call with ${isPrimary ? 'primary' : 'secondary'} key...`);
                
                const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: finalConfig
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`Gemini API call failed with ${isPrimary ? 'primary' : 'secondary'} key: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
                    
                    // Check if it's a rate limit error
                    if (response.status === 429) {
                        const retryDelay = errorData.error?.details?.[0]?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' 
                            ? parseInt(errorData.error.details[0].retryDelay) * 1000 
                            : 60000; // Default 60 seconds
                        
                        console.log(`Rate limited. Waiting ${retryDelay/1000} seconds before trying next key...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                    
                    if (i === CONFIG.GEMINI_API_KEYS.length - 1) {
                        throw new Error(`All API keys failed. Last error: ${response.status}`);
                    }
                    continue; // Try next key
                }

                const data = await response.json();
                
                if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.warn(`Invalid response from ${isPrimary ? 'primary' : 'secondary'} key`);
                    if (i === CONFIG.GEMINI_API_KEYS.length - 1) {
                        throw new Error('Invalid response from all API keys');
                    }
                    continue; // Try next key
                }

                console.log(`API call successful with ${isPrimary ? 'primary' : 'secondary'} Gemini key`);
                return data.candidates[0].content.parts[0].text.trim();
                
            } catch (error) {
                console.warn(`Error with ${isPrimary ? 'primary' : 'secondary'} Gemini key:`, error.message);
                
                if (i === CONFIG.GEMINI_API_KEYS.length - 1) {
                    throw error; // Re-throw if all keys failed
                }
                // Continue to next key
            }
        }
    }
}



// Generate employability tasks
async function generateEmployabilityTasks(studentData) {
    try {
        const prompt = createEmployabilityPrompt(studentData);
        
        const generatedText = await makeGeminiAPICall(prompt, {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.95
        });
        
        return parseEmployabilityTasks(generatedText, studentData);
        
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error(`Task generation failed: ${error.message}`);
    }
}



// Parse employability tasks from AI response
function parseEmployabilityTasks(text, studentData) {
    const tasks = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
        if (line.includes('|') && !line.includes('Skill Level') && !line.includes('---')) {
            const columns = line.split('|').map(col => col.trim()).filter(col => col);
            
            if (columns.length >= 8) {
                // New 8-column format
                tasks.push({
                    skillLevel: columns[0],
                    bloomLevel: columns[1],
                    mainSkill: columns[2],
                    subSkill: columns[3],
                    heading: columns[4],
                    content: columns[5],
                    task: columns[6],
                    application: columns[7]
                });
            } else if (columns.length >= 6) {
                // Old 6-column format - map to new format
                console.warn('Detected old 6-column format, mapping to new format...');
                tasks.push({
                    skillLevel: columns[0],
                    bloomLevel: columns[1],
                    mainSkill: 'N/A', // Default value
                    subSkill: 'N/A', // Default value
                    heading: columns[2],
                    content: columns[3],
                    task: columns[4],
                    application: columns[5]
                });
            }
        }
    }
    
    return {
        studentData,
        tasks: tasks
    };
}

// Display results in table format
async function displayResults(data) {
    DOM.loadingDiv.classList.add('hidden');
    
    if (!data.tasks || data.tasks.length === 0) {
        displayError('No tasks received from AI. Please try again.');
        return;
    }
    
    // Store original tasks
    window.originalTasks = data.tasks;
    
    // Check if translation is needed
    const selectedLanguage = DOM.preferredLanguageSelect?.value || 'en';
    
    if (selectedLanguage === 'en') {
        // Show in English
        populateTasksTable(data.tasks);
    } else {
        // Translate to selected language
        try {
            const translatedTasks = await translateTasks(data.tasks, selectedLanguage);
            populateTasksTable(translatedTasks);
        } catch (error) {
            console.error('Translation failed:', error);
            // Fallback to English
            populateTasksTable(data.tasks);
        }
    }
    
    DOM.resultsDiv.classList.remove('hidden');
    DOM.resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle translation button click
async function handleTranslateTasks() {
    if (!window.originalTasks) {
        displayError('No tasks available for translation.');
        return;
    }
    
    const selectedLanguage = DOM.preferredLanguageSelect.value;
    
    if (selectedLanguage === 'en') {
        // Instant switch back to original English tasks
        populateTasksTable(window.originalTasks);
        return;
    }
    
    try {
        // Show loading state for translation
        DOM.translateTasksBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        DOM.translateTasksBtn.disabled = true;
        
        console.log('Translating tasks to:', selectedLanguage);
        const translatedTasks = await translateTasks(window.originalTasks, selectedLanguage);
        console.log('Translation completed');
        
        // Populate table with translated tasks
        populateTasksTable(translatedTasks);
        
        // Show success message
        showSuccess(`Successfully translated ${translatedTasks.length} tasks to ${CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]}!`);
        
    } catch (error) {
        console.error('Translation failed:', error);
        displayError('Translation failed. Please try again.');
    } finally {
        // Reset button state
        DOM.translateTasksBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
        DOM.translateTasksBtn.disabled = false;
    }
}

// Translate tasks
async function translateTasks(tasks, targetLanguage) {
    try {
        if (targetLanguage === 'en') {
            return tasks;
        }

        console.log(`Starting translation of ${tasks.length} tasks to ${targetLanguage}`);
        
        const translatedTasks = [];
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            console.log(`Translating task ${i + 1}: ${task.heading.substring(0, 30)}...`);
            
            try {
                const translatedTask = {
                    skillLevel: task.skillLevel, // Keep skill level as is
                    bloomLevel: task.bloomLevel, // Keep bloom level as is
                    mainSkill: await translateText(task.mainSkill, targetLanguage),
                    subSkill: await translateText(task.subSkill, targetLanguage),
                    heading: await translateText(task.heading, targetLanguage),
                    content: await translateText(task.content, targetLanguage),
                    task: await translateText(task.task, targetLanguage),
                    application: await translateText(task.application, targetLanguage)
                };
                
                translatedTasks.push(translatedTask);
                
                // Small delay between API calls
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (taskError) {
                console.error(`Error translating task: ${task.heading}`, taskError);
                // If translation fails for a task, keep the original
                translatedTasks.push(task);
            }
        }
        
        console.log(`Successfully translated ${translatedTasks.length} tasks to ${targetLanguage}`);
        return translatedTasks;
    } catch (error) {
        console.error('Error translating tasks:', error);
        return tasks;
    }
}

// Translate text using Gemini API with caching
async function translateText(text, targetLanguage) {
    try {
        if (targetLanguage === 'en') {
            return text;
        }

        // Check cache first for instant switching
        const cacheKey = `${text}_${targetLanguage}`;
        if (translationCache.has(cacheKey)) {
            console.log(`Cache hit for: ${cacheKey}`);
            return translationCache.get(cacheKey);
        }

        const languageNames = {
            'hi': 'Hindi',
            'mr': 'Marathi'
        };

        const targetLanguageName = languageNames[targetLanguage];
        
        // Create translation prompt
        const translationPrompt = `Translate this text to ${targetLanguageName}: "${text}"

CRITICAL RULES:
- Translate EVERYTHING to ${targetLanguageName} - no English words allowed
- Use native script only
- Translate ALL parts including names to appropriate ${targetLanguageName} equivalent
- No explanations, quotes, or extra text
- Keep same meaning and tone
- No repetition of words
- If it's a task instruction, translate the entire instruction
- If it's an application/benefit text, translate completely
- DO NOT CUT or truncate the translation - translate the complete text
- Ensure the full meaning is preserved

Output only the pure ${targetLanguageName} translation.`;

        let translatedText = await makeGeminiAPICall(translationPrompt, {
            maxOutputTokens: 300,
            temperature: 0.2,
            topP: 0.9
        });
        
        // Clean up translation output
        translatedText = cleanTranslationOutput(translatedText, targetLanguageName);
        
        // If translation is empty or same as original, return original
        if (!translatedText || translatedText === text) {
            console.log(`Translation failed or empty for: "${text}"`);
            return text;
        }
        
        console.log(`Translated: "${text}" -> "${translatedText}" (${targetLanguageName})`);
        
        // Cache the translation for instant switching
        translationCache.set(cacheKey, translatedText);
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text if translation fails
    }
}

// Clean up translation output
function cleanTranslationOutput(text, targetLanguage) {
    // Remove quotes and extra text
    text = text.replace(/^["""']|["""']$/g, '');
    text = text.split('\n')[0].trim();
    
    // Remove explanations (anything after ** or * or -)
    text = text.replace(/\*\*.*?\*\*/g, '');
    text = text.replace(/\*.*?\*/g, '');
    text = text.replace(/-.*$/g, '');
    
    // Remove any remaining quotes that might be inside the text
    text = text.replace(/^["""']|["""']$/g, '');
    
    return text.trim();
}

// Populate tasks table
function populateTasksTable(tasks) {
    DOM.tasksTableBody.innerHTML = '';
    
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="skill-level ${task.skillLevel.toLowerCase()}">${task.skillLevel}</span></td>
            <td><span class="bloom-level">${task.bloomLevel || 'N/A'}</span></td>
            <td><span class="main-skill">${task.mainSkill || 'N/A'}</span></td>
            <td><span class="sub-skill">${task.subSkill || 'N/A'}</span></td>
            <td><strong>${task.heading}</strong></td>
            <td>${task.content}</td>
            <td>${task.task}</td>
            <td>${task.application}</td>
        `;
        DOM.tasksTableBody.appendChild(row);
    });
}







// Download CSV
function downloadExcel() {
    try {
        const table = document.getElementById('tasksTable');
        if (!table) {
            displayError('No tasks table found');
            return;
        }

        // Create CSV content from table
        const rows = Array.from(table.querySelectorAll('tr'));
        const csvContent = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            return cells.map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',');
        }).join('\n');
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Employability_Tasks_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('CSV file downloaded successfully!');
    } catch (error) {
        console.error('Error downloading CSV:', error);
        displayError('Failed to download CSV file');
    }
}







// Reset form
function resetForm() {
    DOM.form.reset();
    DOM.resultsDiv.classList.add('hidden');
    DOM.form.style.display = 'block';
    // Clear stored tasks and cache
    window.originalTasks = null;
    translationCache.clear();
}

// Show loading
function showLoading() {
    DOM.form.style.display = 'none';
    DOM.resultsDiv.classList.add('hidden');
    DOM.loadingDiv.classList.remove('hidden');
    DOM.loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Display error
function displayError(message) {
    DOM.loadingDiv.classList.add('hidden');
    DOM.form.style.display = 'block';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; 
                    padding: 15px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s ease;">
            <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(errorDiv), 300);
    }, 5000);
}

// Show success
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; 
                    padding: 15px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s ease;">
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Get user-friendly error message
function getErrorMessage(error) {
    if (error.message.includes('timeout')) return 'Request timed out. Please try again.';
    if (error.message.includes('network') || error.message.includes('fetch')) return 'Network error. Check your connection.';
    if (error.message.includes('API')) return 'AI service temporarily unavailable. Please try again.';
    return 'Something went wrong. Please try again.';
}

// Prompt Management Functions






// API Key Management Functions
function loadSavedApiKeys() {
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey');
    const savedGeminiKey1 = localStorage.getItem('geminiApiKey1');
    const savedGeminiKey2 = localStorage.getItem('geminiApiKey2');
    const savedOpenAIKey = localStorage.getItem('openaiApiKey');
    const savedAnthropicKey = localStorage.getItem('anthropicApiKey');
    const savedCustomEndpoint = localStorage.getItem('customApiEndpoint');
    const savedCustomKey = localStorage.getItem('customApiKey');

    if (savedOpenRouterKey) {
        document.getElementById('openrouterApiKey').value = savedOpenRouterKey;
    }
    if (savedGeminiKey1) {
        document.getElementById('geminiApiKey1').value = savedGeminiKey1;
    }
    if (savedGeminiKey2) {
        document.getElementById('geminiApiKey2').value = savedGeminiKey2;
    }
    if (savedOpenAIKey) {
        document.getElementById('openaiApiKey').value = savedOpenAIKey;
    }
    if (savedAnthropicKey) {
        document.getElementById('anthropicApiKey').value = savedAnthropicKey;
    }
    if (savedCustomEndpoint) {
        document.getElementById('customApiEndpoint').value = savedCustomEndpoint;
    }
    if (savedCustomKey) {
        document.getElementById('customApiKey').value = savedCustomKey;
    }
}

function saveApiKeys() {
    const openRouterKey = document.getElementById('openrouterApiKey').value.trim();
    const geminiKey1 = document.getElementById('geminiApiKey1').value.trim();
    const geminiKey2 = document.getElementById('geminiApiKey2').value.trim();
    const openAIKey = document.getElementById('openaiApiKey').value.trim();
    const anthropicKey = document.getElementById('anthropicApiKey').value.trim();
    const customEndpoint = document.getElementById('customApiEndpoint').value.trim();
    const customKey = document.getElementById('customApiKey').value.trim();

    // Save to localStorage
    if (openRouterKey) {
        localStorage.setItem('openRouterApiKey', openRouterKey);
    } else {
        localStorage.removeItem('openRouterApiKey');
    }
    
    if (geminiKey1) {
        localStorage.setItem('geminiApiKey1', geminiKey1);
    } else {
        localStorage.removeItem('geminiApiKey1');
    }
    
    if (geminiKey2) {
        localStorage.setItem('geminiApiKey2', geminiKey2);
    } else {
        localStorage.removeItem('geminiApiKey2');
    }

    if (openAIKey) {
        localStorage.setItem('openaiApiKey', openAIKey);
    } else {
        localStorage.removeItem('openaiApiKey');
    }

    if (anthropicKey) {
        localStorage.setItem('anthropicApiKey', anthropicKey);
    } else {
        localStorage.removeItem('anthropicApiKey');
    }

    if (customEndpoint) {
        localStorage.setItem('customApiEndpoint', customEndpoint);
    } else {
        localStorage.removeItem('customApiEndpoint');
    }

    if (customKey) {
        localStorage.setItem('customApiKey', customKey);
    } else {
        localStorage.removeItem('customApiKey');
    }

    // Update CONFIG with new keys
    if (openRouterKey) CONFIG.OPENROUTER_API_KEY = openRouterKey;
    if (geminiKey1) CONFIG.GEMINI_API_KEYS[0] = geminiKey1;
    if (geminiKey2) CONFIG.GEMINI_API_KEYS[1] = geminiKey2;
    if (openAIKey) CONFIG.OPENAI_API_KEY = openAIKey;
    if (anthropicKey) CONFIG.ANTHROPIC_API_KEY = anthropicKey;
    if (customEndpoint) CONFIG.CUSTOM_API_ENDPOINT = customEndpoint;
    if (customKey) CONFIG.CUSTOM_API_KEY = customKey;

    showSuccess('API keys saved successfully!');
}

function resetApiKeys() {
    if (confirm('Are you sure you want to reset to default API keys? This will clear all custom keys.')) {
        localStorage.removeItem('openRouterApiKey');
        localStorage.removeItem('geminiApiKey1');
        localStorage.removeItem('geminiApiKey2');
        localStorage.removeItem('openaiApiKey');
        localStorage.removeItem('anthropicApiKey');
        localStorage.removeItem('customApiEndpoint');
        localStorage.removeItem('customApiKey');
        
        document.getElementById('openrouterApiKey').value = '';
        document.getElementById('geminiApiKey1').value = '';
        document.getElementById('geminiApiKey2').value = '';
        document.getElementById('openaiApiKey').value = '';
        document.getElementById('anthropicApiKey').value = '';
        document.getElementById('customApiEndpoint').value = '';
        document.getElementById('customApiKey').value = '';
        
        showSuccess('API keys reset to defaults!');
    }
}

function clearApiKeys() {
    if (confirm('Are you sure you want to clear all API keys? This will remove all stored keys.')) {
        localStorage.removeItem('openRouterApiKey');
        localStorage.removeItem('geminiApiKey1');
        localStorage.removeItem('geminiApiKey2');
        localStorage.removeItem('openaiApiKey');
        localStorage.removeItem('anthropicApiKey');
        localStorage.removeItem('customApiEndpoint');
        localStorage.removeItem('customApiKey');
        
        document.getElementById('openrouterApiKey').value = '';
        document.getElementById('geminiApiKey1').value = '';
        document.getElementById('geminiApiKey2').value = '';
        document.getElementById('openaiApiKey').value = '';
        document.getElementById('anthropicApiKey').value = '';
        document.getElementById('customApiEndpoint').value = '';
        document.getElementById('customApiKey').value = '';
        
        showSuccess('All API keys cleared!');
    }
}

function togglePasswordVisibility(elementId) {
    const input = document.getElementById(elementId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

async function testApiKey(keyType) {
    const button = event.target;
    const originalText = button.innerHTML;
    
    // Set testing state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    button.classList.add('testing');
    button.disabled = true;
    
    try {
        let apiKey, testUrl, testBody;
        
        switch(keyType) {
            case 'openrouter':
                apiKey = document.getElementById('openrouterApiKey').value.trim();
                if (!apiKey) {
                    throw new Error('No OpenRouter API key provided');
                }
                testUrl = CONFIG.OPENROUTER_API_URL;
                testBody = {
                    model: CONFIG.OPENROUTER_MODEL,
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10,
                    temperature: 0.7
                };
                break;
                
            case 'gemini1':
                apiKey = document.getElementById('geminiApiKey1').value.trim();
                if (!apiKey) {
                    throw new Error('No Gemini API key 1 provided');
                }
                testUrl = `${CONFIG.GEMINI_API_URL}?key=${apiKey}`;
                testBody = {
                    contents: [{ parts: [{ text: 'Hello' }] }],
                    generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
                };
                break;
                
            case 'gemini2':
                apiKey = document.getElementById('geminiApiKey2').value.trim();
                if (!apiKey) {
                    throw new Error('No Gemini API key 2 provided');
                }
                testUrl = `${CONFIG.GEMINI_API_URL}?key=${apiKey}`;
                testBody = {
                    contents: [{ parts: [{ text: 'Hello' }] }],
                    generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
                };
                break;
                
            default:
                throw new Error('Invalid API key type');
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (keyType === 'openrouter') {
            headers['Authorization'] = `Bearer ${apiKey}`;
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'PLAT SKILL Task Generator';
        }
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(testBody)
        });
        
        if (response.ok) {
            button.innerHTML = '<i class="fas fa-check"></i> Valid';
            button.classList.remove('testing');
            button.classList.add('success');
            showSuccess(`${keyType.toUpperCase()} API key is valid!`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error(`API key test failed for ${keyType}:`, error);
        button.innerHTML = '<i class="fas fa-times"></i> Invalid';
        button.classList.remove('testing');
        button.classList.add('error');
        displayError(`${keyType.toUpperCase()} API key test failed: ${error.message}`);
    }
    
    // Reset button after 3 seconds
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('testing', 'success', 'error');
        button.disabled = false;
    }, 3000);
}

// Remove API key functionality
function removeApiKey(provider) {
    if (!confirm('Are you sure you want to remove this API key? This action cannot be undone.')) {
        return;
    }
    
    let inputId, storageKey, message;
    
    switch (provider) {
        case 'openrouter':
            inputId = 'openrouterApiKey';
            storageKey = 'openRouterApiKey';
            message = 'OpenRouter API key removed';
            break;
        case 'gemini1':
            inputId = 'geminiApiKey1';
            storageKey = 'geminiApiKey1';
            message = 'Gemini API Key 1 removed';
            break;
        case 'gemini2':
            inputId = 'geminiApiKey2';
            storageKey = 'geminiApiKey2';
            message = 'Gemini API Key 2 removed';
            break;
        case 'openai':
            inputId = 'openaiApiKey';
            storageKey = 'openaiApiKey';
            message = 'OpenAI API key removed';
            break;
        case 'anthropic':
            inputId = 'anthropicApiKey';
            storageKey = 'anthropicApiKey';
            message = 'Anthropic API key removed';
            break;
        case 'custom-endpoint':
            inputId = 'customApiEndpoint';
            storageKey = 'customApiEndpoint';
            message = 'Custom API endpoint removed';
            break;
        case 'custom-key':
            inputId = 'customApiKey';
            storageKey = 'customApiKey';
            message = 'Custom API key removed';
            break;
        default:
            console.error('Unknown provider:', provider);
        return;
    }
    
    // Clear the input field
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
    }
    
    // Remove from localStorage
    localStorage.removeItem(storageKey);
    
    // Update CONFIG object to reset to default/empty values
    switch (provider) {
        case 'openrouter':
            CONFIG.OPENROUTER_API_KEY = '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';
            break;
        case 'gemini1':
            CONFIG.GEMINI_API_KEYS[0] = 'AIzaSyAh_H6EwL3KOgJ8m086W3OBlCqPo7Khewk';
            break;
        case 'gemini2':
            CONFIG.GEMINI_API_KEYS[1] = 'AIzaSyC0rDffMvwYnTVpAsUI2iMY-N5CqU7lvmU';
            break;
        case 'openai':
            CONFIG.OPENAI_API_KEY = '';
            break;
        case 'anthropic':
            CONFIG.ANTHROPIC_API_KEY = '';
            break;
        case 'custom-endpoint':
            CONFIG.CUSTOM_API_ENDPOINT = '';
            break;
        case 'custom-key':
            CONFIG.CUSTOM_API_KEY = '';
            break;
    }
    
    // Show success message
    displaySuccess(message);
    
    console.log(`${message} and reset to default`);
}







// Prompt Editor Functions
function initializePromptEditor() {
    // Load default prompt
    loadDefaultPrompt();
    
    // Load saved custom prompt if exists
    loadSavedPrompt();
    
    // Add event listeners
    document.getElementById('reset-prompt')?.addEventListener('click', resetToDefaultPrompt);
    document.getElementById('test-prompt')?.addEventListener('click', testCustomPrompt);
    document.getElementById('save-prompt')?.addEventListener('click', saveCustomPrompt);
}

function loadDefaultPrompt() {
    const defaultPrompt = `You are an instructional designer creating {task-count} bite-sized "Level-Up Tasks" for Indian UG or PG students.

LEARNER PROFILE
* Education Level (UG / PG): {education-level}
* Year / Semester: {education-year}, {semester}
* Target Employability Skill: {main-skill}

GLOBAL OUTPUT  ——  STRICT SCHEMA
* Return exactly {task-count} pipe-separated table rows, no extra text:
  Skill Level | Bloom Level | Main Skill | Sub Skill | Heading | Content | Task | Application
* Skill–Bloom mapping per row:  
    Low → Remembering / Understanding Medium → Applying / Analyzing High → Evaluating / Creating  
* Word windows (model MUST refuse if any row breaks them):  
    Heading 3–7 w Content 40–50 w Task 50–80 w Application 10–20 w

SECTION & QUALITY RULES  ——  (numbers match your checklist)

▶ Skill Level  
* Output Low / Medium / High (as provided in the user prompt).

▶ Bloom Level  
* Choose ONE Bloom category from the mapping above—no other words.

▶ Main Skill  
* Output the main skill category (e.g., Communication, Problem-Solving, Leadership, etc.).

▶ Sub Skill  
* Output a specific sub-skill within the main skill (e.g., "Verbal Communication", "Analytical Thinking", "Team Motivation", etc.).

▶ Heading (3–7 words)  
1–4. Balanced tone; hook-style idiom/quote OK; tied to task.

▶ Content (40–50 words)  
5–14. Relate to target skill; include *at least one* engaging fact, theory, index, hidden approach *or* Indian mini-case; unique; plain English; complexity aligned with Bloom level.

▶ Task (50–80 words)  
15–23. Text-box response only; fun, ≤5-min action; response ≤80 words; specific; cognitive demand matches Bloom level (e.g., recall fact for Remembering, design improvement for Creating).

▶ Application (10–20 words)  
24–28. One full sentence stating real-world benefit; phrasing depth also matches Bloom level.

LANGUAGE & CULTURE
* Simple English that translates cleanly to Indian languages.  
* Pan-India references (UPI, local markets, campus fest).

SKILL MAPPING:
- Main Skill: {main-skill}
- Subskills to focus on: Based on the selected skill
- Each task should directly target specific subskills within {main-skill}

TASK DISTRIBUTION:
- Create tasks for {skill-level} skill level
- Tasks must be self-contained (no external resources needed)
- Focus on employability skills relevant to the selected skill focus

END OF INSTRUCTIONS`;

    // Store default prompt globally
    window.defaultPrompt = defaultPrompt;
}

function loadSavedPrompt() {
    const savedPrompt = localStorage.getItem('customPrompt');
    const promptTextarea = document.getElementById('custom-prompt');
    
    // Check if the saved prompt has the old 6-column format
    if (savedPrompt && savedPrompt.includes('Skill Level | Bloom Level | Heading | Content | Task | Application')) {
        console.log('Detected old 6-column prompt format, clearing custom prompt...');
        localStorage.removeItem('customPrompt');
        if (promptTextarea) {
            promptTextarea.value = window.defaultPrompt;
        }
        showSuccess('Updated to new 8-column format! Please regenerate tasks.');
    } else if (savedPrompt && promptTextarea) {
        promptTextarea.value = savedPrompt;
    } else if (promptTextarea) {
        promptTextarea.value = window.defaultPrompt;
    }
}

function resetToDefaultPrompt() {
    const promptTextarea = document.getElementById('custom-prompt');
    if (promptTextarea && window.defaultPrompt) {
        promptTextarea.value = window.defaultPrompt;
        // Also clear the saved custom prompt from localStorage
        localStorage.removeItem('customPrompt');
        showSuccess('Prompt reset to default and custom prompt cleared!');
    }
}

function saveCustomPrompt() {
    const promptTextarea = document.getElementById('custom-prompt');
    if (promptTextarea) {
        const customPrompt = promptTextarea.value.trim();
        if (customPrompt) {
            localStorage.setItem('customPrompt', customPrompt);
            showSuccess('Custom prompt saved successfully!');
        } else {
            displayError('Please enter a valid prompt before saving.');
        }
    }
}

async function testCustomPrompt() {
    const promptTextarea = document.getElementById('custom-prompt');
    if (!promptTextarea || !promptTextarea.value.trim()) {
        displayError('Please enter a prompt to test.');
        return;
    }

    const customPrompt = promptTextarea.value.trim();
    
    // Get form data for placeholders
    const formData = new FormData(DOM.form);
    const studentData = Object.fromEntries(formData.entries());
    
    // Check if required fields are filled
    const requiredFields = ['education-level', 'education-year', 'semester', 'main-skill', 'skill-level', 'task-count'];
    const missingFields = requiredFields.filter(field => !studentData[field]?.trim());
    
    if (missingFields.length > 0) {
        displayError(`Please fill in all required fields before testing: ${missingFields.join(', ')}`);
        return;
    }

    // Show loading state
    const testBtn = document.getElementById('test-prompt');
    const originalText = testBtn.innerHTML;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    testBtn.disabled = true;

    try {
        // Replace placeholders in the custom prompt
        const processedPrompt = customPrompt
            .replace(/{education-level}/g, studentData['education-level'])
            .replace(/{education-year}/g, studentData['education-year'])
            .replace(/{semester}/g, studentData.semester)
            .replace(/{main-skill}/g, studentData['main-skill'])
            .replace(/{skill-level}/g, studentData['skill-level'])
            .replace(/{task-count}/g, studentData['task-count']);

        // Test the API call with the custom prompt
        const testResult = await testPromptWithAPI(processedPrompt);
        
        // Show test results in modal
        showTestResults(testResult);
        
    } catch (error) {
        console.error('Prompt test failed:', error);
        displayError(`Prompt test failed: ${error.message}`);
    } finally {
        // Reset button state
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
    }
}

async function testPromptWithAPI(prompt) {
    const result = {
        success: false,
        prompt: prompt,
        response: null,
        error: null,
        timestamp: new Date().toISOString()
    };

    try {
        console.log('Testing custom prompt with API...');
        
        const response = await makeGeminiAPICall(prompt, {
            maxOutputTokens: 500, // Shorter for testing
            temperature: 0.7,
            topP: 0.95
        });
        
        result.success = true;
        result.response = response;
        
        console.log('Prompt test successful');
        
    } catch (error) {
        console.error('Prompt test failed:', error);
        result.error = error.message;
    }
    
    return result;
}

function showTestResults(testResult) {
    const modal = document.getElementById('testResultsModal');
    const resultsBody = document.getElementById('testResultsBody');
    
    if (!modal || !resultsBody) return;
    
    // Clear previous results
    resultsBody.innerHTML = '';
    
    // Create result content
    const resultHTML = `
        <div class="test-result-item ${testResult.success ? 'test-result-success' : 'test-result-error'}">
            <h4>
                <i class="fas fa-${testResult.success ? 'check-circle' : 'exclamation-circle'}"></i>
                ${testResult.success ? 'Test Successful' : 'Test Failed'}
            </h4>
            <p><strong>Timestamp:</strong> ${new Date(testResult.timestamp).toLocaleString()}</p>
            <p><strong>Status:</strong> ${testResult.success ? 'API call completed successfully' : 'API call failed'}</p>
            
            ${testResult.success ? `
                <p><strong>Response Preview:</strong></p>
                <pre>${testResult.response.substring(0, 300)}${testResult.response.length > 300 ? '...' : ''}</pre>
            ` : `
                <p><strong>Error:</strong> ${testResult.error}</p>
            `}
            
            <p><strong>Processed Prompt:</strong></p>
            <pre>${testResult.prompt}</pre>
        </div>
    `;
    
    resultsBody.innerHTML = resultHTML;
    
    // Show modal
    modal.style.display = 'block';
}

function closeTestModal() {
    const modal = document.getElementById('testResultsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update the createEmployabilityPrompt function to use custom prompt if available
// Final standardized prompt for PLAT SKILL Task Generator
const FINAL_PROMPT = `You are an instructional designer creating *{{task-count}}* bite-sized "Level-Up Tasks" for Indian UG or PG students.

LEARNER PROFILE
• Education Level: {{education-level}}
• Year / Semester: {{education-year}}, {{semester}}
• Target Employability Skill: {{main-skill}}   ← must match a key in the map below
• Skill Level: {{skill-level}}  ← all *{{task-count}}* tasks must use this level only

ALLOWED SUB-SKILLS MAP  (STRICT)
Communication → verbal reasoning, non-verbal comprehension, professional writing, interview skills, presentation skills, résumé building  
Problem-Solving → logical reasoning, analytical thinking, critical thinking  
Foundational Cognitive Abilities → spatial reasoning, quantitative reasoning, abstract reasoning, attention to detail. **(No logical-sequence or pattern tasks; those belong under Problem-Solving → logical reasoning.)**
Collaboration → conflict resolution, inclusive communication, team dynamics management, networking, teamwork, stakeholder management, consultation skills, negotiation skills, customer/client/vendor relationship management  
Emotional Intelligence → empathy, emotional regulation, stress management, positive attitude, active listening, understanding emotions  
Leadership → ethical leadership, change management, task delegation, vision and strategic planning, resource allocation, building teams, project management, crisis management  
Learning Agility → adaptability, proactive learning, self-initiative, open-mindedness, continuous improvement, self-reflection  
Creativity and Innovation → brainstorming, creativity, mind-mapping, divergent thinking, innovation  
Growth Mindset → openness to feedback, embracing challenges, persistence, resilience, learning from others
Multifaceted Literacy Skills → digital literacy, scientific literacy and research, financial literacy, media and information literacy, cultural literacy, media literacy, environmental literacy, information literacy, business literacy / business acumen, policy literacy  
Productivity → time management, efficiency, goal setting, prioritization, task breakdown, organizational skills, scheduling  
Decision-Making → decision-making, risk analysis and management, ethical judgment and integrity  
Entrepreneurship → Must be related to all the skills involved in starting a business of one's own.

RULE: Every generated task must address **only** sub-skills listed for the chosen main skill. If not possible, refuse.

GLOBAL OUTPUT
• Return exactly *{{task-count}}* pipe-separated table rows, no extra text:  
  Skill Level | Bloom Level | Main Skill | Subskill | Heading | Content | Task | Application
• Skill–Bloom mapping per row:  
  Low → Remembering / Understanding Medium → Applying / Analyzing High → Evaluating / Creating
• Word windows (strict):  
  Heading 3–7 w Content 40–50 w Task 50–80 w Application 18-20 w
• Subskill *MUST* be from the SUB-SKILLS MAP provided above. 

SECTION & QUALITY RULES

▶ Heading (3–7 words)  
Balanced tone; hook/idiom OK; ties to task.

▶ Content (40–50 words)  
Relate to the main skill **and** at least one allowed sub-skill.  
*MUST* include exactly **one** of the following:
  • Authentic research study or dataset → Add APA in-text citation **and** either a DOI **or** an authoritative domain. A valid DOI or authoritative source URL **must be identified** for verification, **MUST** give an "&>" before the DOI and "<&" after the DOI.
  • Famous quote  → No citation needed
  • A proven helpful theory 
  • A hidden theory/habit/approach
  • Indian mini-case → No citation needed

**NEVER** invent studies.  
If you cannot recall a real, citable source, switch to a quote, theory, fact  or mini-case **or refuse** with: "Cannot provide a verifiable source for this skill at the moment."

Plain, non-technical English; unique phrasing each time.

▶ Task (50–80 words)  
Clear, fun, ≤ 5-min micro-action (including time to write the answer) **text-only response** (no links, images, or uploads) in the textbox we provide.  
• Do **NOT** ask learners to sketch, draw, paint, build, record audio/video, upload files, or paste links.  Searching the web is acceptable **rarely**.
• Instructions must be specific; cognitive demand must match Bloom level.  The output expected must not require more than 5 minutes of the student's time.  
• Do **NOT** mention word counts.

▶ Application (18-20 words)  
One formal, complete sentence on real-world benefit;  depth must match  Bloom level.
 **It must BEGIN with "This task", "This exercise", "This practice", "This habit" or their synonyms or ANY NOUNS.**
The sentence must **NOT** start with any -ing verb 

LANGUAGE & CULTURE  
Use examples relatable to Indian students; keep phrasing translation-friendly.

END OF INSTRUCTIONS`;

function createEmployabilityPrompt(data) {
    return FINAL_PROMPT
        .replace(/\{\{education-level\}\}/g, data['education-level'])
        .replace(/\{\{education-year\}\}/g, data['education-year'])
        .replace(/\{\{semester\}\}/g, data.semester)
        .replace(/\{\{main-skill\}\}/g, data['main-skill'])
        .replace(/\{\{skill-level\}\}/g, data['skill-level'])
        .replace(/\{\{task-count\}\}/g, data['task-count']);
}
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

