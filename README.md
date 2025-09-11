# 🎓 PLAT SKILL - Employability Task Generator

**AI-Powered Task Generation for Career Development**

A modern web application that generates personalized employability tasks using OpenAI's latest GPT models, including GPT-5, GPT-5 Mini, and GPT-5 Nano.

## ✨ Features

### 🤖 **Advanced AI Models**
- **GPT-5** (Most Advanced) - Latest and most capable model
- **GPT-5 Mini** (Balanced Performance) - Optimal balance of speed and capability
- **GPT-5 Nano** (Ultra Fast) - Lightning-fast responses
- **GPT-4o** (Latest) - Previous generation leader
- **GPT-4o Mini** (Fast & Cost-effective) - Budget-friendly option
- **GPT-4 Turbo** (High Performance) - High-performance variant
- **GPT-3.5 Turbo** (Balanced) - Reliable baseline model

### 🎯 **Smart Task Generation**
- **Personalized Tasks** based on education level, year, and semester
- **Skill-Based Focus** with 13+ main skill categories
- **Bloom's Taxonomy Integration** for proper learning progression
- **Customizable Task Count** (3, 6, 9, 12, or 15 tasks)
- **Multiple Skill Levels** (Low, Medium, High, All Levels)

### 🔧 **User-Friendly Interface**
- **Clean, Modern Design** with responsive layout
- **API Configuration Panel** prominently displayed
- **Real-time API Testing** with instant feedback
- **Model Selection Dropdown** with detailed descriptions
- **Secure API Key Storage** (local storage only)
- **No Technical Parameters** - simplified for ease of use

### 📊 **Export & Management**
- **CSV Export** for selected tasks
- **Task Selection** with bulk operations
- **Custom Prompt Editor** for advanced users
- **Prompt Testing** with live results
- **Settings Persistence** across sessions

## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/HASHTECHVENTURES/platskill-CHATGPT-MODEL-.git
cd platskill-CHATGPT-MODEL-
```

### 2. **Set Up API Key**
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open `index.html` in your browser
3. Enter your API key in the "API Configuration" section
4. Select your preferred model (GPT-5 recommended)
5. Click "Test API Key" to verify

### 3. **Generate Tasks**
1. Fill out the student profile form
2. Select your main skill focus
3. Choose skill level and task count
4. Click "Generate Employability Tasks"
5. Export selected tasks as CSV

## 🛠️ Technical Details

### **Architecture**
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: OpenAI Chat Completions API
- **Storage**: Local Storage for settings and API keys
- **Styling**: Custom CSS with Font Awesome icons
- **Responsive**: Mobile-first design approach

### **API Integration**
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token (API key)
- **Models**: All GPT-3.5, GPT-4, and GPT-5 variants
- **Rate Limits**: Handled gracefully with user feedback

### **Security Features**
- **No Hardcoded Keys**: All API keys stored locally
- **Input Validation**: Comprehensive form validation
- **Error Handling**: User-friendly error messages
- **Secure Storage**: API keys never transmitted except to OpenAI

## 📁 Project Structure

```
platskill-CHATGPT-MODEL-/
├── index.html              # Main application interface
├── script.js               # Core application logic
├── styles.css              # Main styling
├── api-config-styles.css   # API configuration styling
├── test-project-api.html   # API testing page
├── package.json            # Project metadata
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore             # Git ignore rules
```

## 🎨 Customization

### **Adding New Models**
1. Update `AVAILABLE_MODELS` in `script.js`
2. Add option to HTML dropdown
3. Test with your API key

### **Custom Prompts**
1. Use the "Customize System Prompt" section
2. Include placeholders: `{{education-level}}`, `{{main-skill}}`, etc.
3. Test your prompt before generating tasks

### **Styling**
- Modify `styles.css` for main styling
- Update `api-config-styles.css` for API section
- All styles are modular and well-commented

## 🔧 Configuration

### **Available Models**
```javascript
AVAILABLE_MODELS: {
    'gpt-5': 'GPT-5 (Most Advanced)',
    'gpt-5-mini': 'GPT-5 Mini (Balanced Performance)',
    'gpt-5-nano': 'GPT-5 Nano (Ultra Fast)',
    'gpt-4o': 'GPT-4o (Latest)',
    'gpt-4o-mini': 'GPT-4o Mini (Fast & Cost-effective)',
    'gpt-4-turbo': 'GPT-4 Turbo (High Performance)',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo (Balanced)'
}
```

### **Default Settings**
- **Default Model**: GPT-5
- **Default Task Count**: 15
- **API Timeout**: Handled by browser
- **Storage**: Local Storage only

## 📋 Skill Categories

The application supports 13+ main skill categories:

1. **Communication** - Verbal and written communication skills
2. **Problem-Solving** - Analytical and critical thinking
3. **Foundational Cognitive Abilities** - Core mental capabilities
4. **Collaboration** - Teamwork and interpersonal skills
5. **Emotional Intelligence** - Self-awareness and empathy
6. **Leadership** - Management and influence skills
7. **Learning Agility** - Adaptability and continuous learning
8. **Creativity and Innovation** - Creative thinking and innovation
9. **Growth Mindset** - Positive attitude toward learning
10. **Multifaceted Literacy Skills** - Digital, financial, media literacy
11. **Productivity** - Efficiency and time management
12. **Decision-Making** - Strategic and tactical decisions
13. **Entrepreneurship** - Business creation and management

## 🎯 Use Cases

### **Educational Institutions**
- Generate tasks for different academic levels
- Create skill-based learning paths
- Support career development programs

### **Corporate Training**
- Employee skill development
- Leadership training programs
- Team building exercises

### **Personal Development**
- Individual skill assessment
- Career planning and development
- Learning goal setting

## 🔒 Privacy & Security

- **No Data Collection**: No personal data is stored or transmitted
- **Local Storage Only**: All settings stored locally in browser
- **API Key Security**: Keys only sent to OpenAI for API calls
- **No Tracking**: No analytics or user tracking
- **Open Source**: Full source code available for review

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Common Issues**

**API Key Not Working**
- Verify your OpenAI API key is valid
- Check your OpenAI account has sufficient credits
- Ensure you have access to the selected model

**Tasks Not Generating**
- Test your API key first
- Check browser console for errors
- Verify all required fields are filled

**Model Not Available**
- Some models may require special access
- Try GPT-3.5 Turbo as a fallback
- Check OpenAI's model availability

### **Getting Help**
- Check the browser console for error messages
- Test your API key using the built-in tester
- Review the OpenAI API documentation

## 🏆 Acknowledgments

- **OpenAI** for providing the GPT models
- **Font Awesome** for the beautiful icons
- **HASHTECHVENTURES** for project development

## 📈 Roadmap

- [ ] **Multi-language Support** - Generate tasks in different languages
- [ ] **Advanced Analytics** - Task completion tracking
- [ ] **Team Collaboration** - Share tasks with teams
- [ ] **Mobile App** - Native mobile application
- [ ] **API Integration** - REST API for external integrations

---

**Made with ❤️ by HASHTECHVENTURES**

*Empowering career development through AI-driven task generation*