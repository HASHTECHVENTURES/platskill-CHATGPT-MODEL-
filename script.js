// PLAT SKILL Employability Task Generator
// Configuration
const CONFIG = {
    // OpenAI API Configuration
    API_KEY: '',  // Will be loaded from localStorage
    API_URL: 'https://api.openai.com/v1/chat/completions',
    
    // Available OpenAI Models
    AVAILABLE_MODELS: {
        'gpt-5': 'GPT-5 (Most Advanced)',
        'gpt-5-mini': 'GPT-5 Mini (Balanced Performance)',
        'gpt-5-nano': 'GPT-5 Nano (Ultra Fast)',
        'gpt-4o': 'GPT-4o (Latest)',
        'gpt-4o-mini': 'GPT-4o Mini (Fast & Cost-effective)',
        'gpt-4-turbo': 'GPT-4 Turbo (High Performance)',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo (Balanced)'
    },
    
    // Default model
    DEFAULT_MODEL: 'gpt-5',
    
    REQUIRED_FIELDS: ['education-level', 'education-year', 'semester', 'main-skill', 'skill-level', 'task-count']
};

// Load saved API key and model on startup
function loadConfigFromStorage() {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedModel = localStorage.getItem('selectedModel');
    
    if (savedApiKey) {
        CONFIG.API_KEY = savedApiKey;
    }
    
    if (savedModel && CONFIG.AVAILABLE_MODELS[savedModel]) {
        CONFIG.DEFAULT_MODEL = savedModel;
    }
}





// DOM Elements
const DOM = {
    form: null,
    loadingDiv: null,
    resultsDiv: null,
    tasksTableBody: null,
    newTasksBtn: null,
    downloadExcelBtn: null,
    downloadSelectedExcelBtn: null,
    selectAllCheckbox: null,
    selectionCounter: null,
    
    // API Configuration elements
    apiKeyInput: null,
    modelSelect: null,
    testApiKeyBtn: null,
    saveApiConfigBtn: null,
    resetApiConfigBtn: null,
    apiStatus: null,





    
    init() {
        this.form = document.getElementById('taskForm');
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        this.tasksTableBody = document.getElementById('tasksTableBody');
        this.newTasksBtn = document.getElementById('newTasks');
        this.downloadExcelBtn = document.getElementById('downloadExcel');
        this.downloadSelectedExcelBtn = document.getElementById('downloadSelectedExcel');
        this.selectAllCheckbox = document.getElementById('selectAllTasks');
        this.selectionCounter = document.getElementById('selectionCounter');
        
        // API Configuration elements
        this.apiKeyInput = document.getElementById('api-key');
        this.modelSelect = document.getElementById('model-select');
        this.testApiKeyBtn = document.getElementById('test-api-key');
        this.saveApiConfigBtn = document.getElementById('save-api-config');
        this.resetApiConfigBtn = document.getElementById('reset-api-config');
        this.apiStatus = document.getElementById('api-status');




        


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
    DOM.downloadSelectedExcelBtn?.addEventListener('click', downloadSelectedExcel);
    
    // API Configuration event listeners
    DOM.testApiKeyBtn?.addEventListener('click', testApiKey);
    DOM.saveApiConfigBtn?.addEventListener('click', saveApiKeys);
    DOM.resetApiConfigBtn?.addEventListener('click', resetApiKeys);


    // Initialize API keys
    loadSavedApiKeys();
    
    // Initialize model selection
    initializeModelSelection();
    
    // Initialize prompt editor
    initializePromptEditor();

}

// Initialize model selection dropdown
function initializeModelSelection() {
    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) return;
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    // Add options for each available model
    Object.entries(CONFIG.AVAILABLE_MODELS).forEach(([modelId, modelName]) => {
        const option = document.createElement('option');
        option.value = modelId;
        option.textContent = modelName;
        if (modelId === CONFIG.DEFAULT_MODEL) {
            option.selected = true;
        }
        modelSelect.appendChild(option);
    });
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

// OpenAI API call function
async function makeAPICall(prompt, config = {}) {
    const defaultConfig = {};
    
    const finalConfig = { ...defaultConfig, ...config };
    const selectedModel = config.model || CONFIG.DEFAULT_MODEL;
    
    if (!CONFIG.API_KEY) {
        throw new Error('API key not found. Please add your OpenAI API key in settings.');
    }
    
    try {
        console.log(`Making API call with OpenAI ${selectedModel}...`);
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from API');
        }

        console.log('API call successful');
        return data.choices[0].message.content.trim();
        
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}



// Generate employability tasks
async function generateEmployabilityTasks(studentData) {
    try {
        const prompt = createEmployabilityPrompt(studentData);
        
        const generatedText = await makeAPICall(prompt, {
            model: CONFIG.DEFAULT_MODEL
        });
        
        return parseEmployabilityTasks(generatedText, studentData);
        
    } catch (error) {
        console.error('Error calling API:', error);
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
    
    // Show tasks in English
        populateTasksTable(data.tasks);
    
    DOM.resultsDiv.classList.remove('hidden');
    DOM.resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// Populate tasks table
function populateTasksTable(tasks) {
    DOM.tasksTableBody.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="task-checkbox" data-task-index="${index}">
            </td>
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
    
    // Initialize row selection functionality
    initializeRowSelection();
}







// Download Selected CSV (only selected tasks)
function downloadExcel() {
    // This function now redirects to downloadSelectedExcel for consistency
    downloadSelectedExcel();
}

// Download Selected CSV
function downloadSelectedExcel() {
    try {
        const table = document.getElementById('tasksTable');
        if (!table) {
            displayError('No tasks table found');
            return;
        }

        // Get selected rows (excluding header)
        const selectedRows = Array.from(table.querySelectorAll('tbody tr')).filter(row => {
            const checkbox = row.querySelector('.task-checkbox');
            return checkbox && checkbox.checked;
        });

        if (selectedRows.length === 0) {
            displayError('Please select at least one task to download');
            return;
        }

        // Create CSV content with header
        const headerRow = table.querySelector('thead tr');
        const headerCells = Array.from(headerRow.querySelectorAll('th'));
        const headerContent = headerCells.map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',');
        
        // Add selected data rows
        const dataContent = selectedRows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            return cells.map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',');
        }).join('\n');
        
        const csvContent = headerContent + '\n' + dataContent;
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Employability_Tasks_Selected_${selectedRows.length}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess(`Selected ${selectedRows.length} tasks downloaded successfully!`);
    } catch (error) {
        console.error('Error downloading selected CSV:', error);
        displayError('Failed to download selected CSV file');
    }
}

// Initialize row selection functionality
function initializeRowSelection() {
    // Add event listeners to individual checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskSelection);
    });

    // Add event listener to select all checkbox
    if (DOM.selectAllCheckbox) {
        DOM.selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    // Update selection counter
    updateSelectionCounter();
}

// Handle individual task selection
function handleTaskSelection(event) {
    const checkbox = event.target;
    const row = checkbox.closest('tr');
    
    if (checkbox.checked) {
        row.classList.add('selected');
    } else {
        row.classList.remove('selected');
    }
    
    updateSelectionCounter();
    updateSelectAllState();
}

// Handle select all checkbox
function handleSelectAll(event) {
    const isChecked = event.target.checked;
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    const rows = document.querySelectorAll('tbody tr');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    rows.forEach(row => {
        if (isChecked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
    
    updateSelectionCounter();
}

// Update selection counter
function updateSelectionCounter() {
    if (!DOM.selectionCounter) return;
    
    const selectedCount = document.querySelectorAll('.task-checkbox:checked').length;
    const totalCount = document.querySelectorAll('.task-checkbox').length;
    
    DOM.selectionCounter.textContent = `${selectedCount} selected`;
    
    // Enable/disable download selected button
    if (DOM.downloadSelectedExcelBtn) {
        DOM.downloadSelectedExcelBtn.disabled = selectedCount === 0;
    }
}

// Update select all checkbox state
function updateSelectAllState() {
    if (!DOM.selectAllCheckbox) return;
    
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    const checkedCount = document.querySelectorAll('.task-checkbox:checked').length;
    
    if (checkedCount === 0) {
        DOM.selectAllCheckbox.checked = false;
        DOM.selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === taskCheckboxes.length) {
        DOM.selectAllCheckbox.checked = true;
        DOM.selectAllCheckbox.indeterminate = false;
    } else {
        DOM.selectAllCheckbox.checked = false;
        DOM.selectAllCheckbox.indeterminate = true;
    }
}







// Reset form
function resetForm() {
    DOM.form.reset();
    DOM.resultsDiv.classList.add('hidden');
    DOM.form.style.display = 'block';
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

function showApiStatus(message, type = 'success') {
    if (!DOM.apiStatus) return;
    
    const statusMessage = DOM.apiStatus.querySelector('.status-message');
    if (statusMessage) {
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        statusMessage.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
        DOM.apiStatus.className = `api-status ${type}`;
        DOM.apiStatus.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            DOM.apiStatus.classList.add('hidden');
        }, 3000);
    }
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
    const savedApiKey = localStorage.getItem('apiKey');
    const savedModel = localStorage.getItem('selectedModel');

    if (savedApiKey && DOM.apiKeyInput) {
        DOM.apiKeyInput.value = savedApiKey;
    }
    
    if (savedModel && DOM.modelSelect) {
        DOM.modelSelect.value = savedModel;
    }
}

function saveApiKeys() {
    const apiKey = DOM.apiKeyInput?.value.trim() || '';
    const selectedModel = DOM.modelSelect?.value || CONFIG.DEFAULT_MODEL;

    // Save to localStorage
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        CONFIG.API_KEY = apiKey;
    } else {
        localStorage.removeItem('apiKey');
        CONFIG.API_KEY = '';
    }
    
    // Save model selection
    localStorage.setItem('selectedModel', selectedModel);
    CONFIG.DEFAULT_MODEL = selectedModel;
    
    showApiStatus('API configuration saved successfully!', 'success');
}

function resetApiKeys() {
    if (confirm('Are you sure you want to reset all settings?')) {
        localStorage.removeItem('apiKey');
        localStorage.removeItem('selectedModel');
        if (DOM.apiKeyInput) {
            DOM.apiKeyInput.value = '';
        }
        if (DOM.modelSelect) {
            DOM.modelSelect.value = CONFIG.DEFAULT_MODEL;
        }
        CONFIG.API_KEY = '';
        CONFIG.DEFAULT_MODEL = 'gpt-5';
        showSuccess('Settings reset to defaults!');
    }
}

function clearApiKeys() {
    if (confirm('Are you sure you want to clear all settings?')) {
        localStorage.removeItem('apiKey');
        localStorage.removeItem('selectedModel');
        if (DOM.apiKeyInput) {
            DOM.apiKeyInput.value = '';
        }
        if (DOM.modelSelect) {
            DOM.modelSelect.value = CONFIG.DEFAULT_MODEL;
        }
        CONFIG.API_KEY = '';
        CONFIG.DEFAULT_MODEL = 'gpt-5';
        showSuccess('All settings cleared!');
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

async function testApiKey() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    // Set testing state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    button.classList.add('testing');
    button.disabled = true;
    
    try {
        const apiKey = DOM.apiKeyInput?.value.trim() || '';
        const selectedModel = DOM.modelSelect?.value || CONFIG.DEFAULT_MODEL;
        
                if (!apiKey) {
            throw new Error('No API key provided');
        }
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });
        
        if (response.ok) {
            button.innerHTML = '<i class="fas fa-check"></i> Valid';
            button.classList.remove('testing');
            button.classList.add('success');
            showSuccess(`API key and ${CONFIG.AVAILABLE_MODELS[selectedModel]} model are working!`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('API key test failed:', error);
        button.innerHTML = '<i class="fas fa-times"></i> Invalid';
        button.classList.remove('testing');
        button.classList.add('error');
        displayError(`API test failed: ${error.message}`);
    }
    
    // Reset button after 3 seconds
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('testing', 'success', 'error');
        button.disabled = false;
    }, 3000);
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
* Simple English with clear, professional language.
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
        
        const response = await makeAPICall(prompt, {
            model: CONFIG.DEFAULT_MODEL
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
    const defaultPrompt = `You are an instructional designer creating *{{task-count}}* bite-sized "Level-Up Tasks" for Indian UG or PG students.

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
Use examples relatable to Indian students; keep phrasing clear and professional.

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
            .replace(/\{\{education-level\}\}/g, studentData['education-level'])
            .replace(/\{\{education-year\}\}/g, studentData['education-year'])
            .replace(/\{\{semester\}\}/g, studentData.semester)
            .replace(/\{\{main-skill\}\}/g, studentData['main-skill'])
            .replace(/\{\{skill-level\}\}/g, studentData['skill-level'])
            .replace(/\{\{task-count\}\}/g, studentData['task-count']);

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
        
        const response = await makeAPICall(prompt, {
            model: CONFIG.DEFAULT_MODEL
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
Use examples relatable to Indian students; keep phrasing clear and professional.

END OF INSTRUCTIONS`;

function createEmployabilityPrompt(data) {
    // Check if there's a custom prompt saved
    const customPrompt = localStorage.getItem('customPrompt');
    const promptToUse = customPrompt || FINAL_PROMPT;
    
    return promptToUse
        .replace(/\{\{education-level\}\}/g, data['education-level'])
        .replace(/\{\{education-year\}\}/g, data['education-year'])
        .replace(/\{\{semester\}\}/g, data.semester)
        .replace(/\{\{main-skill\}\}/g, data['main-skill'])
        .replace(/\{\{skill-level\}\}/g, data['skill-level'])
        .replace(/\{\{task-count\}\}/g, data['task-count']);
}
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

