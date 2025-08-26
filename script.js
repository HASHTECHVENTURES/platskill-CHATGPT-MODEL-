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
    
    REQUIRED_FIELDS: ['education-level', 'education-year', 'semester', 'program', 'main-skill', 'skill-level', 'task-count'],
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



    // Excel translation elements
    excelFileInput: null,
    excelTargetLanguage: null,
    translateExcelBtn: null,
    previewTranslatedExcelBtn: null,
    downloadTranslatedExcelBtn: null,
    excelLoadingDiv: null,
    excelProgressBar: null,
    excelProgressText: null,
    
    // Excel preview modal elements
    excelPreviewModal: null,
    closeExcelPreviewModal: null,
    excelPreviewTable: null,
    previewOriginalFile: null,
    previewTargetLanguage: null,
    previewRowCount: null,

    
    init() {
        this.form = document.getElementById('taskForm');
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        this.tasksTableBody = document.getElementById('tasksTableBody');
        this.newTasksBtn = document.getElementById('newTasks');
        this.downloadExcelBtn = document.getElementById('downloadExcel');
        this.translateTasksBtn = document.getElementById('translateTasks');
        this.preferredLanguageSelect = document.getElementById('preferred-language');



        // Excel translation elements
        this.excelFileInput = document.getElementById('excel-file');
        this.excelTargetLanguage = document.getElementById('excel-target-language');
        this.translateExcelBtn = document.getElementById('translateExcel');
        this.previewTranslatedExcelBtn = document.getElementById('previewTranslatedExcel');
        this.downloadTranslatedExcelBtn = document.getElementById('downloadTranslatedExcel');
        this.excelLoadingDiv = document.getElementById('excelLoading');
        this.excelProgressBar = document.getElementById('excelProgress');
        this.excelProgressText = document.getElementById('excelProgressText');
        
        // Excel preview modal elements
        this.excelPreviewModal = document.getElementById('excelPreviewModal');
        this.closeExcelPreviewModal = document.getElementById('closeExcelPreviewModal');
        this.excelPreviewTable = document.getElementById('excelPreviewTable');
        this.previewOriginalFile = document.getElementById('previewOriginalFile');
        this.previewTargetLanguage = document.getElementById('previewTargetLanguage');
        this.previewRowCount = document.getElementById('previewRowCount');
        
        // Gemini Q&A elements
        this.geminiQuestion = document.getElementById('geminiQuestion');
        this.askGeminiBtn = document.getElementById('askGeminiBtn');
        this.geminiResponse = document.getElementById('geminiResponse');
        this.geminiResponseText = document.getElementById('geminiResponseText');
        this.geminiLoading = document.getElementById('geminiLoading');

    }
};

// Initialize application
function initApp() {
    console.log('Initializing PLAT SKILL application...');
    
    // Load saved API keys first
    loadConfigFromStorage();
    
    DOM.init();
    
    // Debug: Check if Gemini Q&A elements are found
    console.log('Gemini Q&A elements found:');
    console.log('- Question textarea:', !!DOM.geminiQuestion);
    console.log('- Ask button:', !!DOM.askGeminiBtn);
    console.log('- Response div:', !!DOM.geminiResponse);
    console.log('- Loading div:', !!DOM.geminiLoading);
    
    // Event Listeners
    DOM.form?.addEventListener('submit', handleFormSubmit);
    DOM.newTasksBtn?.addEventListener('click', resetForm);
    DOM.downloadExcelBtn?.addEventListener('click', downloadExcel);
    DOM.translateTasksBtn?.addEventListener('click', handleTranslateTasks);

    // Excel translation event listeners
    DOM.excelFileInput?.addEventListener('change', handleExcelFileSelect);
    DOM.translateExcelBtn?.addEventListener('click', handleExcelTranslation);
    DOM.previewTranslatedExcelBtn?.addEventListener('click', previewTranslatedExcel);
    DOM.downloadTranslatedExcelBtn?.addEventListener('click', downloadTranslatedExcel);
    
    // Excel preview modal event listeners
    DOM.closeExcelPreviewModal?.addEventListener('click', hideExcelPreviewModal);
    DOM.excelPreviewModal?.addEventListener('click', (e) => {
        if (e.target === DOM.excelPreviewModal) {
            hideExcelPreviewModal();
        }
    });
    
    // Gemini Q&A event listeners
    if (DOM.askGeminiBtn) {
        console.log('Adding click listener to Ask Gemini button');
        DOM.askGeminiBtn.addEventListener('click', handleGeminiQuestion);
    }
    
    if (DOM.geminiQuestion) {
        console.log('Adding keydown listener to Gemini question textarea');
        DOM.geminiQuestion.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleGeminiQuestion();
            }
        });
    }
    
    // Test: Make sure Gemini Q&A section is visible
    const geminiSection = document.querySelector('.gemini-qa-section');
    if (geminiSection) {
        console.log('✅ Gemini Q&A section found and visible');
        geminiSection.style.border = '2px solid red'; // Temporary border for debugging
    } else {
        console.log('❌ Gemini Q&A section not found');
    }
    

    
    // Initialize API keys
    loadSavedApiKeys();
    
    // Test: Make sure Gemini Q&A section is visible
    setTimeout(() => {
        const geminiSection = document.querySelector('.gemini-qa-section');
        if (geminiSection) {
            console.log('✅ Gemini Q&A section found and visible');
            geminiSection.style.border = '2px solid green';
        } else {
            console.log('❌ Gemini Q&A section not found');
        }
    }, 1000);
    

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

// Create employability prompt
function createEmployabilityPrompt(data) {
    const taskCount = parseInt(data['task-count']);
    const skillLevel = data['skill-level'];
    const mainSkill = data['main-skill'];
    
    let skillLevelText = '';
    if (skillLevel === 'all') {
        skillLevelText = 'Create tasks for all skill levels (low, medium, high)';
    } else {
        skillLevelText = `Create tasks for ${skillLevel} skill level only`;
    }
    
    // Skill mapping for better task generation
    const skillMapping = {
        'communication': 'verbal communication, written communication, presentation skills, active listening, public speaking, storytelling, persuasion, negotiation, cross-cultural communication, digital communication',
        'problem-solving': 'analytical thinking, creative problem-solving, root cause analysis, decision-making frameworks, troubleshooting, strategic thinking, logical reasoning, innovative solutions, systematic approach, critical analysis',
        'foundational-cognitive-abilities': 'memory enhancement, attention to detail, pattern recognition, information processing, cognitive flexibility, mental agility, learning strategies, knowledge retention, intellectual curiosity, cognitive endurance',
        'collaboration': 'team dynamics, group facilitation, conflict resolution, consensus building, peer support, cross-functional collaboration, virtual teamwork, leadership within teams, collaborative problem-solving, team communication',
        'emotional-intelligence': 'self-awareness, empathy, emotional regulation, social skills, relationship management, emotional resilience, stress management, interpersonal effectiveness, emotional literacy, emotional agility',
        'leadership': 'vision setting, team motivation, strategic planning, change management, decision-making, influence and persuasion, conflict management, coaching and mentoring, organizational skills, inspirational leadership',
        'learning-agility': 'rapid learning, adaptability to change, knowledge transfer, skill acquisition, learning from failure, continuous improvement, intellectual curiosity, learning mindset, knowledge synthesis, learning efficiency',
        'creativity-innovation': 'creative thinking, innovative problem-solving, design thinking, brainstorming techniques, artistic expression, innovative solutions, creative confidence, experimentation, divergent thinking, creative collaboration',
        'growth-mindset': 'resilience, continuous learning, embracing challenges, effort and persistence, learning from criticism, celebrating others\' success, adaptability, positive attitude, self-improvement, lifelong learning',
        'multifaceted-literacy-skills': 'digital literacy, media literacy, financial literacy, information literacy, cultural literacy, technological literacy, data literacy, visual literacy, critical literacy, functional literacy',
        'productivity': 'time management, goal setting, prioritization, efficiency optimization, workflow management, task organization, performance optimization, resource management, productivity systems, output maximization',
        'decision-making': 'strategic decision-making, risk assessment, data-driven decisions, ethical decision-making, quick decision-making, informed choices, decision frameworks, problem analysis, outcome evaluation, decision confidence',
        'entrepreneurship': 'business acumen, opportunity recognition, risk management, innovation, market analysis, resource mobilization, strategic planning, customer focus, financial management, growth strategies'
    };
    
    const skillSubskills = skillMapping[mainSkill] || mainSkill;
    
    return `Create ${taskCount} employability tasks following these STRICT guidelines:

STUDENT PROFILE:
- Education Level: ${data['education-level']}
- Education Year: ${data['education-year']}
- Semester: ${data['semester']}
- Program: ${data.program}
- Main Skill Focus: ${mainSkill}

HEADING REQUIREMENTS (3-7 words):
- Not too casual, not too formal/plain
- Interesting, hook-like with idioms/quotes
- Related to the task/content
- Examples: "Think Like a CEO", "The 7-Second Rule", "Master the Art of..."

- **No Repetition**: Avoid repeating words unnecessarily
- **Hook-Style**: Make them catchy and memorable in any language

CONTENT REQUIREMENTS (around 50 words):
- Related to skill/task/heading/education level
- Helpful for student upskilling - something they learn from
- Formal but engaging - hook-like, not casual
- Simple language
- Include: Research, New Technique, Tips and Tricks, or Case study (prefer Indian examples)
- Each content should be UNIQUE - avoid repetitive formatting
- Common to all programs in the paper code
- Not repetitive - one concept/tip should not repeat
- Not too technical
- **Translation-Friendly**: Use language that translates naturally to Indian languages
- **Cultural Context**: Include Indian examples that work across all regions

TASK REQUIREMENTS (50-80 words):
- Related to skill/content/heading/education level
- Only text box writing - avoid uploads
- Simple language
- Action and application-oriented, learning to do something new, or observe something new
- NOT academic
- Interesting and fun to do
- Requires not more than 5 minutes
- Requires not more than 80-worded answer
- Not too open-ended, give specific instructions
- **Translation-Ready**: Use language that translates clearly to all Indian languages
- **Universal Terms**: Avoid English-specific idioms that don't translate well

APPLICATION REQUIREMENTS (10-20 words, full sentence):
- Concise and specific
- Related to skill/content/task/heading/education level
- How will it help the student from that paper code to do this task
- **Translation-Friendly**: Keep sentences simple for easy translation

SKILL MAPPING:
- Main Skill: ${mainSkill}
- Subskills to focus on: ${skillSubskills}
- Each task should directly target specific subskills within ${mainSkill}

TASK DISTRIBUTION:
- ${skillLevelText}
- Tasks must be self-contained (no external resources needed)
- Focus on employability skills relevant to ${data.program}



OUTPUT FORMAT:
Create a table with exactly ${taskCount} rows in this format:

| Skill Level | Heading | Content | Task | Application |
|-------------|---------|---------|------|-------------|
| [Low/Medium/High] | [3-7 word hook-like title] | [~50 words: research/technique/tips/Indian case study] | [50-80 words: 5-min text task] | [10-20 words: full sentence benefit] |

Example format:
| Medium | The 7-Second Rule | Research shows recruiters spend just 7 seconds on first impressions. Indian companies like TCS and Infosys use this principle. | Write a 30-second elevator pitch for a ${data.program} role. Include your unique value proposition. | This skill transforms you into an interview ninja.



Make tasks engaging, practical, and specifically tailored for ${data.program} students at ${data['education-level']} level. Ensure each task follows the exact word limits and formatting requirements while being engaging and practical.`;
}

// Parse employability tasks from AI response
function parseEmployabilityTasks(text, studentData) {
    const tasks = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
        if (line.includes('|') && !line.includes('Skill Level') && !line.includes('---')) {
            const columns = line.split('|').map(col => col.trim()).filter(col => col);
            
            if (columns.length >= 5) {
                tasks.push({
                    skillLevel: columns[0],
                    heading: columns[1],
                    content: columns[2],
                    task: columns[3],
                    application: columns[4]
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
            <td><strong>${task.heading}</strong></td>
            <td>${task.content}</td>
            <td>${task.task}</td>
            <td>${task.application}</td>
        `;
        DOM.tasksTableBody.appendChild(row);
    });
}







// Download Excel
function downloadExcel() {
    try {
        const table = document.getElementById('tasksTable');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Employability Tasks" });
        XLSX.writeFile(wb, `Employability_Tasks_${new Date().toISOString().split('T')[0]}.xlsx`);
        showSuccess('Excel file downloaded successfully!');
    } catch (error) {
        console.error('Error downloading Excel:', error);
        displayError('Failed to download Excel file');
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



// Excel Translation Functions

// Global variables for Excel translation
let uploadedExcelData = null;
let translatedExcelData = null;

// Handle Excel file selection
function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        DOM.translateExcelBtn.disabled = true;
        return;
    }

    // Validate file type
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ];
    
    if (!validTypes.includes(file.type)) {
        displayError('Please select a valid Excel file (.xlsx or .xls)');
        event.target.value = '';
        DOM.translateExcelBtn.disabled = true;
        return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        displayError('File size must be less than 5MB');
        event.target.value = '';
        DOM.translateExcelBtn.disabled = true;
        return;
    }

    // Read and parse Excel file
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
                displayError('Excel file is empty or has no data');
                event.target.value = '';
                DOM.translateExcelBtn.disabled = true;
                return;
            }

            uploadedExcelData = {
                workbook: workbook,
                worksheet: worksheet,
                jsonData: jsonData,
                sheetName: firstSheetName,
                fileName: file.name
            };

            DOM.translateExcelBtn.disabled = false;
            showSuccess(`Excel file "${file.name}" loaded successfully!`);
            
        } catch (error) {
            console.error('Error reading Excel file:', error);
            displayError('Error reading Excel file. Please try again.');
            event.target.value = '';
            DOM.translateExcelBtn.disabled = true;
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Handle Gemini Q&A
async function handleGeminiQuestion() {
    const question = DOM.geminiQuestion.value.trim();
    
    if (!question) {
        displayError('Please enter a question');
        return;
    }
    
    try {
        // Show loading
        DOM.geminiLoading.classList.remove('hidden');
        DOM.geminiResponse.classList.add('hidden');
        DOM.askGeminiBtn.disabled = true;
        
        // Ask Gemini
        const response = await askGeminiDirect(question);
        
        // Hide loading and show response
        DOM.geminiLoading.classList.add('hidden');
        DOM.geminiResponse.classList.remove('hidden');
        DOM.geminiResponseText.textContent = response;
        DOM.askGeminiBtn.disabled = false;
        
    } catch (error) {
        console.error('Gemini Q&A error:', error);
        DOM.geminiLoading.classList.add('hidden');
        DOM.askGeminiBtn.disabled = false;
        displayError('Failed to get response from Gemini: ' + error.message);
    }
}

// Direct Gemini API call for Q&A
async function askGeminiDirect(question) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEYS[0]}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(`API Error: ${data.error.message}`);
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No response from Gemini');
        }
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

// Handle Excel translation
async function handleExcelTranslation() {
    if (!uploadedExcelData) {
        displayError('Please select an Excel file first');
        return;
    }

    const targetLanguage = DOM.excelTargetLanguage.value;
    if (!targetLanguage) {
        displayError('Please select a target language');
        return;
    }

    try {
        showExcelLoading();
        
        const translatedData = await translateExcelData(uploadedExcelData, targetLanguage);
        translatedExcelData = translatedData;
        
        hideExcelLoading();
        DOM.previewTranslatedExcelBtn.disabled = false;
        DOM.downloadTranslatedExcelBtn.disabled = false;
        
        showSuccess(`Excel file translated to ${CONFIG.SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage} successfully! Click "Preview Translation" to review before downloading.`);
        
    } catch (error) {
        console.error('Error translating Excel:', error);
        hideExcelLoading();
        displayError('Error translating Excel file. Please try again.');
    }
}

// Translate Excel data with improved quality
async function translateExcelData(excelData, targetLanguage) {
    const { jsonData } = excelData;
    const translatedRows = [];
    
    // Update progress
    updateExcelProgress(0, 'Starting translation...');
    
    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const translatedRow = [];
        
        for (let j = 0; j < row.length; j++) {
            const cellValue = row[j];
            
            if (cellValue && typeof cellValue === 'string' && cellValue.trim()) {
                try {
                    // Pre-process the text to handle special cases
                    const processedText = preprocessTextForTranslation(cellValue, targetLanguage);
                    const translatedValue = await translateTextWithQuality(processedText, targetLanguage);
                    // Post-process the translated text
                    const finalValue = postprocessTranslatedText(translatedValue, targetLanguage);
                    translatedRow.push(finalValue);
                } catch (error) {
                    console.warn(`Translation failed for cell [${i},${j}]:`, error);
                    translatedRow.push(cellValue); // Keep original if translation fails
                }
            } else {
                translatedRow.push(cellValue); // Keep non-string values as is
            }
        }
        
        translatedRows.push(translatedRow);
        
        // Update progress
        const progress = Math.round(((i + 1) / jsonData.length) * 100);
        updateExcelProgress(progress, `Translating row ${i + 1} of ${jsonData.length}...`);
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    updateExcelProgress(100, 'Translation completed!');
    
    return {
        ...excelData,
        jsonData: translatedRows
    };
}

// Pre-process text for better translation
function preprocessTextForTranslation(text, targetLanguage) {
    let processedText = text;
    
    // Preserve question numbers and options
    processedText = processedText.replace(/(\d+\.)/g, 'QUESTION_NUMBER_$1');
    processedText = processedText.replace(/([A-Z])\./g, 'OPTION_LETTER_$1');
    
    // Preserve mathematical expressions
    processedText = processedText.replace(/(\d+)/g, 'NUMBER_$1');
    
    // Preserve special formatting
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, 'BOLD_$1_BOLD');
    processedText = processedText.replace(/\*(.*?)\*/g, 'ITALIC_$1_ITALIC');
    
    return processedText;
}

// Post-process translated text to restore formatting
function postprocessTranslatedText(text, targetLanguage) {
    let processedText = text;
    
    // Restore question numbers
    processedText = processedText.replace(/QUESTION_NUMBER_(\d+)/g, '$1.');
    
    // Restore option letters with proper translation
    const optionLetterMap = {
        'hi': { 'A': 'क', 'B': 'ख', 'C': 'ग', 'D': 'घ', 'P': 'प', 'Q': 'क्यू', 'R': 'आर', 'T': 'टी' },
        'mr': { 'A': 'अ', 'B': 'ब', 'C': 'क', 'D': 'ड', 'P': 'प', 'Q': 'क्यू', 'R': 'र', 'T': 'ट' },
        'bn': { 'A': 'ক', 'B': 'খ', 'C': 'গ', 'D': 'ঘ', 'P': 'প', 'Q': 'কিউ', 'R': 'র', 'T': 'টি' },
        'te': { 'A': 'ఎ', 'B': 'బి', 'C': 'సి', 'D': 'డి', 'P': 'పి', 'Q': 'క్యూ', 'R': 'ఆర్', 'T': 'టి' },
        'ta': { 'A': 'அ', 'B': 'பி', 'C': 'சி', 'D': 'டி', 'P': 'பி', 'Q': 'க்யூ', 'R': 'ஆர்', 'T': 'டி' },
        'ml': { 'A': 'എ', 'B': 'ബി', 'C': 'സി', 'D': 'ഡി', 'P': 'പി', 'Q': 'ക്യൂ', 'R': 'ആർ', 'T': 'ടി' },
        'kn': { 'A': 'ಎ', 'B': 'ಬಿ', 'C': 'ಸಿ', 'D': 'ಡಿ', 'P': 'ಪಿ', 'Q': 'ಕ್ಯೂ', 'R': 'ಆರ್', 'T': 'ಟಿ' },
        'gu': { 'A': 'એ', 'B': 'બી', 'C': 'સી', 'D': 'ડી', 'P': 'પી', 'Q': 'ક્યૂ', 'R': 'આર', 'T': 'ટી' },
        'pa': { 'A': 'ਏ', 'B': 'ਬੀ', 'C': 'ਸੀ', 'D': 'ਡੀ', 'P': 'ਪੀ', 'Q': 'ਕਿਊ', 'R': 'ਆਰ', 'T': 'ਟੀ' },
        'or': { 'A': 'ଏ', 'B': 'ବି', 'C': 'ସି', 'D': 'ଡି', 'P': 'ପି', 'Q': 'କିଉ', 'R': 'ଆର', 'T': 'ଟି' }
    };
    
    const letterMap = optionLetterMap[targetLanguage] || optionLetterMap['en'];
    processedText = processedText.replace(/OPTION_LETTER_([A-Z])/g, (match, letter) => {
        return letterMap[letter] || letter;
    });
    
    // Restore numbers with proper translation
    const numberMap = {
        'hi': { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' },
        'mr': { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' },
        'bn': { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' },
        'te': { '0': '౦', '1': '౧', '2': '౨', '3': '౩', '4': '౪', '5': '౫', '6': '౬', '7': '౭', '8': '౮', '9': '౯' },
        'ta': { '0': '௦', '1': '௧', '2': '௨', '3': '௩', '4': '௪', '5': '௫', '6': '௬', '7': '௭', '8': '௮', '9': '௯' },
        'ml': { '0': '൦', '1': '൧', '2': '൨', '3': '൩', '4': '൪', '5': '൫', '6': '൬', '7': '൭', '8': '൮', '9': '൯' },
        'kn': { '0': '೦', '1': '೧', '2': '೨', '3': '೩', '4': '೪', '5': '೫', '6': '೬', '7': '೭', '8': '೮', '9': '೯' },
        'gu': { '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪', '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯' },
        'pa': { '0': '੦', '1': '੧', '2': '੨', '3': '੩', '4': '੪', '5': '੫', '6': '੬', '7': '੭', '8': '੮', '9': '੯' },
        'or': { '0': '୦', '1': '୧', '2': '୨', '3': '୩', '4': '୪', '5': '୫', '6': '୬', '7': '୭', '8': '୮', '9': '୯' }
    };
    
    const numMap = numberMap[targetLanguage] || {};
    processedText = processedText.replace(/NUMBER_(\d+)/g, (match, number) => {
        return number.split('').map(digit => numMap[digit] || digit).join('');
    });
    
    // Restore formatting
    processedText = processedText.replace(/BOLD_(.*?)_BOLD/g, '**$1**');
    processedText = processedText.replace(/ITALIC_(.*?)_ITALIC/g, '*$1*');
    
    return processedText;
}

// Enhanced translation function with better quality
async function translateTextWithQuality(text, targetLanguage) {
    const languageNames = {
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
    };

    const targetLanguageName = languageNames[targetLanguage];
    
    // Enhanced translation prompt for better quality
    const enhancedTranslationPrompt = `Translate this text to ${targetLanguageName} with high accuracy:

TEXT: "${text}"

CRITICAL REQUIREMENTS:
1. Translate EVERYTHING to ${targetLanguageName} - no English words allowed
2. Use native script only
3. Maintain the exact meaning and context
4. Preserve question structure and formatting
5. Keep numbers, mathematical expressions, and special characters intact
6. Ensure complete sentences and proper grammar
7. Use appropriate terminology for educational content
8. Maintain consistency in technical terms
9. If it's a question, ensure it's complete and clear
10. If it's an option (A, B, C, D, P, Q, R, T), translate the letter appropriately

Output only the pure ${targetLanguageName} translation without any explanations or quotes.`;

    let translatedText = await makeGeminiAPICall(enhancedTranslationPrompt, {
        maxOutputTokens: 500,
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
    
    return translatedText;
}

// Download translated Excel
function downloadTranslatedExcel() {
    if (!translatedExcelData) {
        displayError('No translated Excel data available');
        return;
    }

    try {
        // Create new workbook with translated data
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(translatedExcelData.jsonData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, translatedExcelData.sheetName);
        
        // Generate filename
        const originalName = translatedExcelData.fileName.replace(/\.(xlsx|xls)$/i, '');
        const targetLanguage = DOM.excelTargetLanguage.value;
        const languageName = CONFIG.SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage;
        const newFileName = `${originalName}_translated_${languageName}.xlsx`;
        
        // Download file
        XLSX.writeFile(newWorkbook, newFileName);
        
        showSuccess(`Translated Excel file downloaded as "${newFileName}"`);
        
    } catch (error) {
        console.error('Error downloading translated Excel:', error);
        displayError('Error downloading translated Excel file');
    }
}

// Show Excel loading state
function showExcelLoading() {
    DOM.excelLoadingDiv.classList.remove('hidden');
    DOM.excelLoadingDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hide Excel loading state
function hideExcelLoading() {
    DOM.excelLoadingDiv.classList.add('hidden');
}

// Preview translated Excel
function previewTranslatedExcel() {
    if (!translatedExcelData) {
        displayError('No translated Excel data available');
        return;
    }

    try {
        // Populate preview modal with data
        DOM.previewOriginalFile.textContent = translatedExcelData.fileName;
        DOM.previewTargetLanguage.textContent = CONFIG.SUPPORTED_LANGUAGES[DOM.excelTargetLanguage.value] || DOM.excelTargetLanguage.value;
        DOM.previewRowCount.textContent = translatedExcelData.jsonData.length;
        
        // Create preview table
        const table = DOM.excelPreviewTable;
        table.innerHTML = '';
        
        // Add header row if data exists
        if (translatedExcelData.jsonData.length > 0) {
            const headerRow = document.createElement('tr');
            const firstRow = translatedExcelData.jsonData[0];
            
            for (let j = 0; j < firstRow.length; j++) {
                const th = document.createElement('th');
                th.textContent = `Column ${j + 1}`;
                headerRow.appendChild(th);
            }
            table.appendChild(headerRow);
        }
        
        // Add data rows (show first 20 rows for preview)
        const maxPreviewRows = Math.min(20, translatedExcelData.jsonData.length);
        for (let i = 0; i < maxPreviewRows; i++) {
            const row = translatedExcelData.jsonData[i];
            const tr = document.createElement('tr');
            
            for (let j = 0; j < row.length; j++) {
                const td = document.createElement('td');
                const cellValue = row[j];
                
                // Handle different data types
                if (cellValue === null || cellValue === undefined) {
                    td.textContent = '';
                } else if (typeof cellValue === 'string') {
                    td.textContent = cellValue;
                } else {
                    td.textContent = String(cellValue);
                }
                
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        
        // Show preview modal
        DOM.excelPreviewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error showing Excel preview:', error);
        displayError('Error showing Excel preview');
    }
}

// Hide Excel preview modal
function hideExcelPreviewModal() {
    DOM.excelPreviewModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Update Excel progress
function updateExcelProgress(percentage, text) {
    if (DOM.excelProgressBar) {
        DOM.excelProgressBar.style.width = `${percentage}%`;
    }
    if (DOM.excelProgressText) {
        DOM.excelProgressText.textContent = text;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

