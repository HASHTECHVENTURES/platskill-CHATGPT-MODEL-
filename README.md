# PLAT SKILL - Employability Task Generator

A web-based application that generates personalized employability tasks for students using AI. The system supports multiple Indian languages and provides complete customization of prompts and API keys.

## 🌟 Features

### **Core Functionality**
- **Personalized Task Generation**: Creates employability tasks based on student profile
- **Multi-language Support**: 8 Indian languages (Hindi, Bengali, Telugu, Tamil, Marathi, Malayalam, Kannada)
- **Excel Export**: Download generated tasks as Excel files
- **Responsive Design**: Works on desktop and mobile devices

### **Advanced Customization**
- **Editable Prompts**: Customize task generation and translation prompts
- **API Key Management**: Use your own API keys for privacy and control
- **Real-time Testing**: Test API keys before saving
- **Persistent Storage**: Settings saved in browser localStorage

## 🚀 Quick Start

1. **Open the Application**: Open `index.html` in your web browser
2. **Fill the Form**: Enter student details and preferences
3. **Generate Tasks**: Click "Generate Employability Tasks"
4. **Customize (Optional)**: Click "Show Prompts" to customize AI prompts and API keys

## ⚙️ Configuration

### **API Keys Setup**
1. Click "Show Prompts" button
2. Navigate to "API Keys Management" section
3. Enter your API keys:
   - **OpenRouter API Key** (Primary): Get from [OpenRouter](https://openrouter.ai/keys)
   - **Gemini API Key 1** (Fallback): Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Gemini API Key 2** (Optional): Backup key for reliability
4. Click "Test" to verify each key
5. Click "Save API Keys" to persist settings

### **Custom Prompts**
1. Click "Show Prompts" button
2. Edit task generation or translation prompts
3. Use placeholders like `{taskCount}`, `{name}`, `{program}`, etc.
4. Click "Save" to apply changes

## 📋 Form Fields

### **Student Profile**
- **Full Name**: Student's complete name
- **Education Level**: High School, Diploma, Bachelor's, Master's, PhD
- **Education Year**: 1st Year to Final Year
- **Semester**: 1st to 8th Semester

### **Program & Skills**
- **Program/Field**: Computer Science, Engineering, Business, etc.
- **Main Skill Focus**: Communication, Problem-solving, Leadership, etc.

### **Task Preferences**
- **Skill Level**: Low (Beginner), Medium (Intermediate), High (Advanced), All Levels
- **Number of Tasks**: 3, 6, 9, or 12 tasks

## 🌐 Supported Languages

| Language | Code | Script |
|----------|------|--------|
| English | en | Latin |
| Hindi | hi | Devanagari |
| Bengali | bn | Bengali |
| Telugu | te | Telugu |
| Tamil | ta | Tamil |
| Marathi | mr | Devanagari |
| Malayalam | ml | Malayalam |
| Kannada | kn | Kannada |

## 🔧 Technical Details

### **AI Models Used**
- **Primary**: OpenRouter (Gemini 2.5 Pro)
- **Fallback**: Google Gemini API (Gemini 2.0 Flash)

### **API Configuration**
- **Temperature**: 0.7 (Task Generation), 0.3 (Translation)
- **Max Tokens**: 2048 (Tasks), 200 (Translation)
- **Top P**: 0.95 (Tasks), 0.8 (Translation)

### **Browser Storage**
- **localStorage Keys**:
  - `customTaskPrompt`: Custom task generation prompt
  - `customTranslationPrompt`: Custom translation prompt
  - `openRouterApiKey`: OpenRouter API key
  - `geminiApiKey1`: Primary Gemini API key
  - `geminiApiKey2`: Secondary Gemini API key

## 📁 File Structure

```
├── index.html          # Main application interface
├── styles.css          # Styling and responsive design
├── script.js           # Core functionality and AI integration
└── README.md           # This documentation
```

## 🎯 Use Cases

- **Educational Institutions**: Generate employability tasks for students
- **Career Counselors**: Create personalized skill development activities
- **Students**: Self-assessment and skill improvement
- **HR Professionals**: Employee development and training

## 🔒 Privacy & Security

- **Client-side Processing**: All data processed in your browser
- **No Server Required**: Works completely offline after initial load
- **API Key Privacy**: Your API keys stored locally only
- **No Data Collection**: No student data sent to external servers

## 🛠️ Customization

### **Adding New Skills**
Edit the `skillMapping` object in `script.js` to add new skill categories.

### **Adding New Languages**
1. Add language code to `SUPPORTED_LANGUAGES` in `script.js`
2. Add language option to the select dropdown in `index.html`
3. Update translation prompt template if needed

### **Modifying Task Format**
Edit the task generation prompt template to change output format and requirements.

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify API keys are valid and have sufficient credits
3. Ensure all required form fields are filled
4. Try refreshing the page if issues persist

## 🔄 Updates

- **v1.0**: Initial release with basic task generation
- **v1.1**: Added multi-language support
- **v1.2**: Added prompt customization
- **v1.3**: Added API key management
- **v1.4**: Enhanced UI and error handling

---

**PLAT SKILL** - Empowering students with bite-sized employability skills for career success! 🚀