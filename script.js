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
    
    REQUIRED_FIELDS: ['name', 'education-level', 'education-year', 'semester', 'program', 'main-skill', 'skill-level', 'task-count', 'api-provider'],
    SUPPORTED_LANGUAGES: {
        'en': 'English',
        'hi': 'Hindi',
        'bn': 'Bengali',
        'te': 'Telugu',
        'ta': 'Tamil',
        'mr': 'Marathi',
        'ml': 'Malayalam',
        'kn': 'Kannada'
    }
};

// Load saved API keys on startup
function loadConfigFromStorage() {
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey');
    const savedGeminiKey1 = localStorage.getItem('geminiApiKey1');
    const savedGeminiKey2 = localStorage.getItem('geminiApiKey2');
    
    if (savedOpenRouterKey) {
        CONFIG.OPENROUTER_API_KEY = savedOpenRouterKey;
    }
    if (savedGeminiKey1) {
        CONFIG.GEMINI_API_KEYS[0] = savedGeminiKey1;
    }
    if (savedGeminiKey2) {
        CONFIG.GEMINI_API_KEYS[1] = savedGeminiKey2;
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
    showPromptsBtn: null,
    promptsModal: null,
    closePromptsModal: null,
    resetPromptsBtn: null,
    apiProviderSelect: null,
    
    init() {
        this.form = document.getElementById('taskForm');
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        this.tasksTableBody = document.getElementById('tasksTableBody');
        this.newTasksBtn = document.getElementById('newTasks');
        this.downloadExcelBtn = document.getElementById('downloadExcel');
        this.translateTasksBtn = document.getElementById('translateTasks');
        this.preferredLanguageSelect = document.getElementById('preferred-language');
        this.showPromptsBtn = document.getElementById('show-prompts-btn');
        this.promptsModal = document.getElementById('promptsModal');
        this.closePromptsModal = document.getElementById('closePromptsModal');
        this.resetPromptsBtn = document.getElementById('resetPrompts');
        this.apiProviderSelect = document.getElementById('api-provider');
    }
};

// Initialize application
function initApp() {
    // Load saved API keys first
    loadConfigFromStorage();
    
    DOM.init();
    
    // Event Listeners
    DOM.form?.addEventListener('submit', handleFormSubmit);
    DOM.newTasksBtn?.addEventListener('click', resetForm);
    DOM.downloadExcelBtn?.addEventListener('click', downloadExcel);
    DOM.translateTasksBtn?.addEventListener('click', handleTranslateTasks);
    DOM.showPromptsBtn?.addEventListener('click', showPromptsModal);
    DOM.closePromptsModal?.addEventListener('click', hidePromptsModal);
    DOM.resetPromptsBtn?.addEventListener('click', resetToDefaultPrompts);
    
    // Close modal when clicking outside
    DOM.promptsModal?.addEventListener('click', (e) => {
        if (e.target === DOM.promptsModal) {
            hidePromptsModal();
        }
    });
    
    // Check API provider availability when form loads
    DOM.apiProviderSelect?.addEventListener('change', checkApiProviderAvailability);
    
    // Initialize default prompts and API keys
    initializeDefaultPrompts();
    loadSavedApiKeys();
    
    // Check API provider availability on page load
    setTimeout(checkApiProviderAvailability, 100);
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
    
    // Validate API provider selection
    const selectedProvider = data['api-provider'];
    if (!selectedProvider) {
        displayError('Please select an API provider.');
        return false;
    }
    
    // Check if selected provider has API key configured
    if (selectedProvider === 'openrouter') {
        const openRouterKey = localStorage.getItem('openRouterApiKey') || CONFIG.OPENROUTER_API_KEY;
        if (!openRouterKey || openRouterKey === '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') {
            displayError('Please configure your OpenRouter API key in the prompts settings.');
            return false;
        }
    } else if (selectedProvider === 'gemini1') {
        const geminiKey1 = localStorage.getItem('geminiApiKey1') || CONFIG.GEMINI_API_KEYS[0];
        if (!geminiKey1 || geminiKey1 === 'AIzaSyAh_H6EwL3KOgJ8m086W3OBlCqPo7Khewk') {
            displayError('Please configure your Gemini API Key 1 in the prompts settings.');
            return false;
        }
    } else if (selectedProvider === 'gemini2') {
        const geminiKey2 = localStorage.getItem('geminiApiKey2') || CONFIG.GEMINI_API_KEYS[1];
        if (!geminiKey2 || geminiKey2 === 'AIzaSyC0rDffMvwYnTVpAsUI2iMY-N5CqU7lvmU') {
            displayError('Please configure your Gemini API Key 2 in the prompts settings.');
            return false;
        }
    }
    
    return true;
}

// Smart API call with user-selected provider and fallback
async function makeGeminiAPICall(prompt, config = {}) {
    const defaultConfig = {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const selectedProvider = DOM.apiProviderSelect?.value || 'auto';
    
    // If user selected a specific provider, try that first
    if (selectedProvider !== 'auto') {
        try {
            console.log(`Attempting API call with selected provider: ${selectedProvider}`);
            
            switch (selectedProvider) {
                case 'openrouter':
                    return await callOpenRouterAPI(prompt, finalConfig);
                case 'gemini1':
                    return await callGeminiAPI(prompt, finalConfig, 0);
                case 'gemini2':
                    return await callGeminiAPI(prompt, finalConfig, 1);
                default:
                    throw new Error(`Unknown provider: ${selectedProvider}`);
            }
        } catch (error) {
            console.warn(`Selected provider ${selectedProvider} failed, falling back to auto mode...`, error.message);
            // Fall back to auto mode if selected provider fails
        }
    }
    
    // Auto mode: Try OpenRouter first, then Gemini fallbacks
    try {
        console.log('Attempting API call with OpenRouter (Gemini 2.5 Pro)...');
        return await callOpenRouterAPI(prompt, finalConfig);
    } catch (error) {
        console.warn('OpenRouter failed, trying Gemini fallback...', error.message);
        
        // Fallback to Gemini API keys
        for (let i = 0; i < CONFIG.GEMINI_API_KEYS.length; i++) {
            try {
                console.log(`Attempting Gemini API call with key ${i + 1}...`);
                return await callGeminiAPI(prompt, finalConfig, i);
            } catch (error) {
                console.warn(`Error with Gemini key ${i + 1}:`, error.message);
                if (i === CONFIG.GEMINI_API_KEYS.length - 1) {
                    throw error; // Re-throw if all keys failed
                }
            }
        }
    }
}

// Helper function for OpenRouter API calls
async function callOpenRouterAPI(prompt, config) {
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
            max_tokens: config.maxOutputTokens,
            temperature: config.temperature,
            top_p: config.topP
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenRouter');
    }

    console.log('API call successful with OpenRouter (Gemini 2.5 Pro)');
    return data.choices[0].message.content.trim();
}

// Helper function for Gemini API calls
async function callGeminiAPI(prompt, config, keyIndex) {
    const apiKey = CONFIG.GEMINI_API_KEYS[keyIndex];
    const isPrimary = keyIndex === 0;
    
    const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: config
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API call failed with ${isPrimary ? 'primary' : 'secondary'} key: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error(`Invalid response from ${isPrimary ? 'primary' : 'secondary'} key`);
    }

    console.log(`API call successful with ${isPrimary ? 'primary' : 'secondary'} Gemini key`);
    return data.candidates[0].content.parts[0].text.trim();
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
- Name: ${data.name}
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
- **Translation-Ready**: Create headings that will translate well to all Indian languages (Hindi, Bengali, Telugu, Tamil, Marathi, Malayalam, Kannada)
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
| Medium | The 7-Second Rule | Research shows recruiters spend just 7 seconds on first impressions. Indian companies like TCS and Infosys use this principle in their hiring process. Your first impression is like a lightning-fast movie trailer - make it unforgettable! | Write a 30-second elevator pitch for a ${data.program} role. Include your unique value proposition and use confident, engaging language that would make an employer remember you instantly. | This skill transforms you into an interview ninja, making you unforgettable in any professional setting.

TRANSLATION COMPATIBILITY GUIDELINES (GPT-OSS-20B Rulebook Integration):
- **Faithful meaning**: Preserve tone/intent; avoid literal-only translation
- **Placeholders & tokens**: Keep {} %s <b> etc. unchanged
- **Numbers**: Use Western digits (0–9)
- **Verb-final**: Ensure content works with SOV structure in Indic languages
- **Articles**: Present in English; will be absent in Indic languages
- **Honorifics**: Respect politeness levels across cultures
- **Consistency**: Use same term consistently
- **Style**: Always formal-neutral, easy to understand
- **Script Safety**: Ensure content will work in native scripts
- **No quotes**: Avoid unnecessary quotation marks
- **No repetition**: Avoid repeating the same words unnecessarily
- **Hook-style**: Make headings catchy and hook-like in any language

LANGUAGE-SPECIFIC CONSIDERATIONS:
- **Hindi**: Content should work with SOV structure, no articles, honorific forms
- **Bengali**: Compatible with SOV, classifiers, postpositions
- **Telugu**: Works with agglutinative structure, case markers
- **Tamil**: Compatible with agglutinative suffixes, urai-nadai style
- **Marathi**: Works with gender agreement, postpositions
- **Malayalam**: Compatible with agglutinative structure, honorifics
- **Kannada**: Works with case inflection, politeness distinctions

Make tasks engaging, practical, and specifically tailored for ${data.program} students at ${data['education-level']} level. Ensure each task follows the exact word limits and formatting requirements while being fully compatible with translation to all Indian languages.`;
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
    
    // Store original tasks for translation
    window.originalTasks = data.tasks;
    
    // Get selected language from results dropdown
    const selectedLanguage = DOM.preferredLanguageSelect.value;
    
    if (selectedLanguage === 'en') {
        // Show in English
        populateTasksTable(data.tasks);
        updateResultsHeader('English');
    } else {
        // Auto-translate to selected language
        try {
            // Show loading state for translation
            const progressDiv = document.createElement('div');
            progressDiv.id = 'translationProgress';
            progressDiv.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                            z-index: 10000; text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 10px;"></i>
                    <h3>Generating Tasks in ${CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]}</h3>
                    <p>Please wait while we translate ${data.tasks.length} tasks...</p>
                </div>
            `;
            document.body.appendChild(progressDiv);
            
            const translatedTasks = await translateTasks(data.tasks, selectedLanguage);
            
            // Remove progress indicator
            document.body.removeChild(progressDiv);
            
            // Populate table with translated tasks
            populateTasksTable(translatedTasks);
            updateResultsHeader(CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]);
            
        } catch (error) {
            console.error('Auto-translation failed:', error);
            // Fallback to English
            populateTasksTable(data.tasks);
            updateResultsHeader('English');
        }
    }
    
    // Start pre-translating to all languages in background for faster switching
    preTranslateAllLanguages(data.tasks);
    
    DOM.resultsDiv.classList.remove('hidden');
    DOM.resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Translate tasks with consistency and batch processing
async function translateTasks(tasks, targetLanguage) {
    try {
        if (targetLanguage === 'en') {
            return tasks;
        }

        const translatedTasks = [];
        
        // Process tasks in smaller batches to avoid rate limits
        const batchSize = 3;
        for (let i = 0; i < tasks.length; i += batchSize) {
            const batch = tasks.slice(i, i + batchSize);
            console.log(`Translating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tasks.length/batchSize)}`);
            
            // Process each task in the batch
            for (const task of batch) {
                try {
                    console.log(`Translating task: ${task.heading.substring(0, 30)}...`);
                    
                    const translatedTask = {
                        skillLevel: task.skillLevel, // Keep skill level as is
                        heading: await translateText(task.heading, targetLanguage),
                        content: await translateText(task.content, targetLanguage),
                        task: await translateText(task.task, targetLanguage),
                        application: await translateText(task.application, targetLanguage)
                    };
                    
                    translatedTasks.push(translatedTask);
                    
                    // Add small delay between API calls to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (taskError) {
                    console.error(`Error translating task: ${task.heading}`, taskError);
                    // If translation fails for a task, keep the original
                    translatedTasks.push(task);
                }
            }
            
            // Add delay between batches
            if (i + batchSize < tasks.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`Successfully translated ${translatedTasks.length} tasks to ${targetLanguage}`);
        return translatedTasks;
    } catch (error) {
        console.error('Error translating tasks:', error);
        return tasks;
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
            'bn': 'Bengali', 
            'te': 'Telugu',
            'ta': 'Tamil',
            'mr': 'Marathi',
            'ml': 'Malayalam',
            'kn': 'Kannada'
        };

        const targetLanguageName = languageNames[targetLanguage];
        
        const translationPrompt = `Translate this text to ${targetLanguageName}: "${text}"

CRITICAL RULES:
- Translate EVERYTHING to ${targetLanguageName} - no English words allowed
- Use native script only
- Translate ALL parts including names like "Sujal" to appropriate ${targetLanguageName} equivalent
- No explanations, quotes, or extra text
- Keep same meaning and tone
- No repetition of words
- If it's a task instruction, translate the entire instruction
- If it's an application/benefit text, translate completely

Output only the pure ${targetLanguageName} translation.`;

        let translatedText = await makeGeminiAPICall(translationPrompt, {
            maxOutputTokens: 200,
            temperature: 0.3,
            topP: 0.8
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
        updateResultsHeader('English');
        return;
    }
    
    try {
        // Show loading state for translation
        DOM.translateTasksBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        DOM.translateTasksBtn.disabled = true;
        
        // Show progress message
        const progressDiv = document.createElement('div');
        progressDiv.id = 'translationProgress';
        progressDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        z-index: 10000; text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 10px;"></i>
                <h3>Translating Tasks</h3>
                <p>Please wait while we translate ${window.originalTasks.length} tasks to ${CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]}...</p>
                <p style="font-size: 0.9rem; color: #666;">This may take a few moments for larger task sets.</p>
            </div>
        `;
        document.body.appendChild(progressDiv);
        
        console.log('Translating tasks to:', selectedLanguage);
        const translatedTasks = await translateTasks(window.originalTasks, selectedLanguage);
        console.log('Translation completed');
        
        // Remove progress indicator
        document.body.removeChild(progressDiv);
        
        // Populate table with translated tasks
        populateTasksTable(translatedTasks);
        
        // Update results header with language info
        updateResultsHeader(CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]);
        
        // Show success message
        showSuccess(`Successfully translated ${translatedTasks.length} tasks to ${CONFIG.SUPPORTED_LANGUAGES[selectedLanguage]}!`);
        
    } catch (error) {
        console.error('Translation failed:', error);
        displayError('Translation failed. Please try again.');
        
        // Remove progress indicator if it exists
        const progressDiv = document.getElementById('translationProgress');
        if (progressDiv) {
            document.body.removeChild(progressDiv);
        }
    } finally {
        // Reset button state
        DOM.translateTasksBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
        DOM.translateTasksBtn.disabled = false;
    }
}

// Pre-translate all languages in background for faster switching
async function preTranslateAllLanguages(tasks) {
    const languages = ['hi', 'bn', 'te', 'ta', 'mr', 'ml', 'kn'];
    
    // Limit pre-translation for large task counts to avoid overwhelming the API
    const maxTasksForPreTranslation = 6;
    const tasksToPreTranslate = tasks.slice(0, maxTasksForPreTranslation);
    
    console.log(`Pre-translating ${tasksToPreTranslate.length} tasks to ${languages.length} languages...`);
    
    // Start background translation for all languages
    languages.forEach(async (lang) => {
        try {
            console.log(`Pre-translating to ${lang}...`);
            for (const task of tasksToPreTranslate) {
                // Pre-translate each field with error handling
                try {
                    await translateText(task.heading, lang);
                    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
                    await translateText(task.content, lang);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await translateText(task.task, lang);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await translateText(task.application, lang);
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (fieldError) {
                    console.error(`Error pre-translating field for ${lang}:`, fieldError);
                }
            }
            console.log(`Pre-translation to ${lang} completed`);
        } catch (error) {
            console.error(`Pre-translation to ${lang} failed:`, error);
        }
    });
}

// Update results header with language info
function updateResultsHeader(language) {
    const resultsHeader = DOM.resultsDiv.querySelector('.results-header h2');
    if (resultsHeader) {
        if (language === 'English') {
            resultsHeader.innerHTML = '<i class="fas fa-tasks"></i> Your Employability Tasks';
        } else {
            resultsHeader.innerHTML = `<i class="fas fa-tasks"></i> Your Employability Tasks <span style="font-size: 0.8rem; color: #28a745; margin-left: 10px;">(${language})</span>`;
        }
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
let defaultPrompts = {};

function initializeDefaultPrompts() {
    // Store default prompts for reset functionality
    defaultPrompts = {
        taskGeneration: `Create {taskCount} employability tasks following these STRICT guidelines:

STUDENT PROFILE:
- Name: {name}
- Education Level: {education-level}
- Education Year: {education-year}
- Semester: {semester}
- Program: {program}
- Main Skill Focus: {main-skill}

HEADING REQUIREMENTS (3-7 words):
- Not too casual, not too formal/plain
- Interesting, hook-like with idioms/quotes
- Related to the task/content
- Examples: "Think Like a CEO", "The 7-Second Rule", "Master the Art of..."
- **Translation-Ready**: Create headings that will translate well to all Indian languages
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

OUTPUT FORMAT:
Create a table with exactly {taskCount} rows in this format:

| Skill Level | Heading | Content | Task | Application |
|-------------|---------|---------|------|-------------|
| [Low/Medium/High] | [3-7 word hook-like title] | [~50 words: research/technique/tips/Indian case study] | [50-80 words: 5-min text task] | [10-20 words: full sentence benefit] |

Make tasks engaging, practical, and specifically tailored for {program} students at {education-level} level. Ensure each task follows the exact word limits and formatting requirements while being fully compatible with translation to all Indian languages.`,

        translation: `Translate this text to {targetLanguageName}: "{text}"

CRITICAL RULES:
- Translate EVERYTHING to {targetLanguageName} - no English words allowed
- Use native script only
- Translate ALL parts including names like "Sujal" to appropriate {targetLanguageName} equivalent
- No explanations, quotes, or extra text
- Keep same meaning and tone
- No repetition of words
- If it's a task instruction, translate the entire instruction
- If it's an application/benefit text, translate completely

Output only the pure {targetLanguageName} translation.`
    };
    
    // Load saved prompts or use defaults
    loadSavedPrompts();
}

function loadSavedPrompts() {
    const savedTaskPrompt = localStorage.getItem('customTaskPrompt');
    const savedTranslationPrompt = localStorage.getItem('customTranslationPrompt');
    
    if (savedTaskPrompt) {
        document.getElementById('taskGenerationPrompt').value = savedTaskPrompt;
    } else {
        document.getElementById('taskGenerationPrompt').value = defaultPrompts.taskGeneration;
    }
    
    if (savedTranslationPrompt) {
        document.getElementById('translationPromptTemplate').value = savedTranslationPrompt;
    } else {
        document.getElementById('translationPromptTemplate').value = defaultPrompts.translation;
    }
}

// Check API provider availability and update options
async function checkApiProviderAvailability() {
    const apiProviderSelect = DOM.apiProviderSelect;
    if (!apiProviderSelect) return;
    
    // Reset all options
    const options = apiProviderSelect.querySelectorAll('option');
    options.forEach(option => {
        option.textContent = option.textContent.replace(/ ✓| ✗| ⏳/g, '');
    });
    
    // Check each provider
    const providers = [
        { value: 'openrouter', name: 'OpenRouter (Gemini 2.5 Pro)', key: 'openRouterApiKey' },
        { value: 'gemini1', name: 'Gemini API Key 1', key: 'geminiApiKey1' },
        { value: 'gemini2', name: 'Gemini API Key 2', key: 'geminiApiKey2' }
    ];
    
    for (const provider of providers) {
        const option = apiProviderSelect.querySelector(`option[value="${provider.value}"]`);
        if (!option) continue;
        
        // Check if API key is configured
        const savedKey = localStorage.getItem(provider.key);
        const defaultKey = provider.key === 'openRouterApiKey' ? CONFIG.OPENROUTER_API_KEY : 
                          provider.key === 'geminiApiKey1' ? CONFIG.GEMINI_API_KEYS[0] : CONFIG.GEMINI_API_KEYS[1];
        
        const hasCustomKey = savedKey && savedKey !== defaultKey;
        
        if (hasCustomKey) {
            option.textContent = `${provider.name} ✓`;
            option.style.color = '#28a745';
        } else {
            option.textContent = `${provider.name} ✗`;
            option.style.color = '#dc3545';
        }
    }
}

// Update API provider options when prompts modal is opened
function showPromptsModal() {
    DOM.promptsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Check API provider availability
    checkApiProviderAvailability();
}

function hidePromptsModal() {
    DOM.promptsModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function toggleEdit(elementId) {
    const element = document.getElementById(elementId);
    const editBtn = element.parentElement.querySelector('.edit-btn');
    const saveBtn = element.parentElement.querySelector('.save-btn');
    const cancelBtn = element.parentElement.querySelector('.cancel-btn');
    
    element.classList.add('editing');
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
    element.focus();
}

function savePrompt(elementId) {
    const element = document.getElementById(elementId);
    const editBtn = element.parentElement.querySelector('.edit-btn');
    const saveBtn = element.parentElement.querySelector('.save-btn');
    const cancelBtn = element.parentElement.querySelector('.cancel-btn');
    
    // Save to localStorage
    if (elementId === 'taskGenerationPrompt') {
        localStorage.setItem('customTaskPrompt', element.value);
    } else if (elementId === 'translationPromptTemplate') {
        localStorage.setItem('customTranslationPrompt', element.value);
    }
    
    element.classList.remove('editing');
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    
    showSuccess('Prompt saved successfully!');
}

function cancelEdit(elementId) {
    const element = document.getElementById(elementId);
    const editBtn = element.parentElement.querySelector('.edit-btn');
    const saveBtn = element.parentElement.querySelector('.save-btn');
    const cancelBtn = element.parentElement.querySelector('.cancel-btn');
    
    // Restore original value
    if (elementId === 'taskGenerationPrompt') {
        const saved = localStorage.getItem('customTaskPrompt') || defaultPrompts.taskGeneration;
        element.value = saved;
    } else if (elementId === 'translationPromptTemplate') {
        const saved = localStorage.getItem('customTranslationPrompt') || defaultPrompts.translation;
        element.value = saved;
    }
    
    element.classList.remove('editing');
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}

function resetToDefaultPrompts() {
    if (confirm('Are you sure you want to reset to default prompts? This will clear all custom changes.')) {
        localStorage.removeItem('customTaskPrompt');
        localStorage.removeItem('customTranslationPrompt');
        
        document.getElementById('taskGenerationPrompt').value = defaultPrompts.taskGeneration;
        document.getElementById('translationPromptTemplate').value = defaultPrompts.translation;
        
        showSuccess('Prompts reset to defaults!');
    }
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value || element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('Prompt copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        element.select();
        document.execCommand('copy');
        showSuccess('Prompt copied to clipboard!');
    });
}

// Override the createEmployabilityPrompt function to use custom prompts
function createEmployabilityPrompt(data) {
    const customPrompt = document.getElementById('taskGenerationPrompt').value || defaultPrompts.taskGeneration;
    
    // Replace placeholders with actual data
    return customPrompt
        .replace(/{taskCount}/g, data['task-count'])
        .replace(/{name}/g, data.name)
        .replace(/{education-level}/g, data['education-level'])
        .replace(/{education-year}/g, data['education-year'])
        .replace(/{semester}/g, data.semester)
        .replace(/{program}/g, data.program)
        .replace(/{main-skill}/g, data['main-skill']);
}

// Override the translateText function to use custom translation prompt
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
            'bn': 'Bengali', 
            'te': 'Telugu',
            'ta': 'Tamil',
            'mr': 'Marathi',
            'ml': 'Malayalam',
            'kn': 'Kannada'
        };

        const targetLanguageName = languageNames[targetLanguage];
        const customTranslationPrompt = document.getElementById('translationPromptTemplate').value || defaultPrompts.translation;
        
        const translationPrompt = customTranslationPrompt
            .replace(/{targetLanguageName}/g, targetLanguageName)
            .replace(/{text}/g, text);

        let translatedText = await makeGeminiAPICall(translationPrompt, {
            maxOutputTokens: 200,
            temperature: 0.3,
            topP: 0.8
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

// API Key Management Functions
function loadSavedApiKeys() {
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey');
    const savedGeminiKey1 = localStorage.getItem('geminiApiKey1');
    const savedGeminiKey2 = localStorage.getItem('geminiApiKey2');

    if (savedOpenRouterKey) {
        document.getElementById('openrouterApiKey').value = savedOpenRouterKey;
    }
    if (savedGeminiKey1) {
        document.getElementById('geminiApiKey1').value = savedGeminiKey1;
    }
    if (savedGeminiKey2) {
        document.getElementById('geminiApiKey2').value = savedGeminiKey2;
    }
}

function saveApiKeys() {
    const openRouterKey = document.getElementById('openrouterApiKey').value.trim();
    const geminiKey1 = document.getElementById('geminiApiKey1').value.trim();
    const geminiKey2 = document.getElementById('geminiApiKey2').value.trim();

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

    // Update CONFIG with new keys
    if (openRouterKey) CONFIG.OPENROUTER_API_KEY = openRouterKey;
    if (geminiKey1) CONFIG.GEMINI_API_KEYS[0] = geminiKey1;
    if (geminiKey2) CONFIG.GEMINI_API_KEYS[1] = geminiKey2;

    showSuccess('API keys saved successfully!');
}

function resetApiKeys() {
    if (confirm('Are you sure you want to reset to default API keys? This will clear all custom keys.')) {
        localStorage.removeItem('openRouterApiKey');
        localStorage.removeItem('geminiApiKey1');
        localStorage.removeItem('geminiApiKey2');
        
        document.getElementById('openrouterApiKey').value = '';
        document.getElementById('geminiApiKey1').value = '';
        document.getElementById('geminiApiKey2').value = '';
        
        showSuccess('API keys reset to defaults!');
    }
}

function clearApiKeys() {
    if (confirm('Are you sure you want to clear all API keys? This will remove all stored keys.')) {
        localStorage.removeItem('openRouterApiKey');
        localStorage.removeItem('geminiApiKey1');
        localStorage.removeItem('geminiApiKey2');
        
        document.getElementById('openrouterApiKey').value = '';
        document.getElementById('geminiApiKey1').value = '';
        document.getElementById('geminiApiKey2').value = '';
        
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);