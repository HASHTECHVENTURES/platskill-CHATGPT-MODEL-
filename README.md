# PLAT SKILL - Employability Task Generator

A modern web-based application that generates personalized, bite-sized employability tasks for students using AI. Built with vanilla JavaScript, HTML5, and CSS3.

![PLAT SKILL](https://img.shields.io/badge/PLAT-SKILL-blue?style=for-the-badge&logo=graduation-cap)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🌟 Features

### **Core Functionality**
- **Personalized Task Generation**: Creates employability tasks based on student profile
- **Multi-language Support**: English, Hindi, and Marathi with instant translation
- **Excel Export**: Download generated tasks as Excel files
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### **Advanced Customization**
- **Editable Prompts**: Customize task generation and translation prompts
- **API Key Management**: Use your own API keys for privacy and control
- **Real-time Testing**: Test API keys before saving
- **Persistent Storage**: Settings saved in browser localStorage

## 🚀 Quick Start

### **Option 1: Direct File Opening**
1. **Download/Clone** this repository
2. **Open** `index.html` in your web browser
3. **Start using** the application immediately

### **Option 2: Local Server (Recommended)**
```bash
# Navigate to project directory
cd plat-skill-task-generator

# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server
```

Then open: `http://localhost:8000`

## 📋 Form Fields

### **Student Profile**
- **Education Level**: High School, Diploma, Bachelor's, Master's, PhD
- **Education Year**: 1st Year to Final Year
- **Semester**: 1st to 8th Semester

### **Program & Skills**
- **Program/Field**: Computer Science, Engineering, Business, Psychology, Marketing, Finance, Healthcare, Design, Education, Other
- **Main Skill Focus**: Communication, Problem-Solving, Leadership, Collaboration, Emotional Intelligence, Learning Agility, Creativity and Innovation, Growth Mindset, Multifaceted Literacy Skills, Productivity, Decision-Making, Entrepreneurship

### **Task Preferences**
- **Skill Level**: Low (Beginner), Medium (Intermediate), High (Advanced), All Levels
- **Number of Tasks**: 3, 6, 9, or 12 tasks

## 🌐 Supported Languages

| Language | Code | Script |
|----------|------|--------|
| English | en | Latin |
| Hindi | hi | Devanagari |
| Marathi | mr | Devanagari |

## ⚙️ Configuration

### **API Keys Setup**
1. Click **"Show & Edit Prompts"** button
2. Navigate to **"API Keys Management"** section
3. Enter your API keys:
   - **OpenRouter API Key** (Primary): Get from [OpenRouter](https://openrouter.ai/keys)
   - **Gemini API Key 1** (Fallback): Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Gemini API Key 2** (Optional): Backup key for reliability
4. Click **"Test"** to verify each key
5. Click **"Save API Keys"** to persist settings

### **Custom Prompts**
1. Click **"Show & Edit Prompts"** button
2. Edit task generation or translation prompts
3. Use placeholders like `{taskCount}`, `{name}`, `{program}`, etc.
4. Click **"Save"** to apply changes

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
plat-skill-task-generator/
├── index.html          # Main application interface
├── styles.css          # Styling and responsive design
├── script.js           # Core functionality and AI integration
├── README.md           # This documentation
└── .gitignore          # Git ignore rules
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
1. Check browser console for error messages (F12 → Console)
2. Verify API keys are valid and have sufficient credits
3. Ensure all required form fields are filled
4. Try refreshing the page if issues persist

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Updates

- **v1.0**: Initial release with basic task generation
- **v1.1**: Added multi-language support
- **v1.2**: Added prompt customization
- **v1.3**: Added API key management
- **v1.4**: Enhanced UI and error handling

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **OpenRouter** for API access to multiple AI models
- **Font Awesome** for the beautiful icons
- **SheetJS** for Excel export functionality

---

**PLAT SKILL** - Empowering students with bite-sized employability skills for career success! 🚀

Made with ❤️ for the education community.