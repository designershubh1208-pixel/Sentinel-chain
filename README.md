# 🔗 Sentinel Chain - AI-Powered Smart Contract Auditor

An advanced AI-driven platform for autonomous security auditing of smart contracts. Leverages multiple state-of-the-art LLM providers to detect vulnerabilities, analyze gas optimization, and provide comprehensive security recommendations.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38B2AC?logo=tailwind-css)

---

## 🎯 Features

### Core Auditing
- **Multi-Provider LLM Support**: OpenAI (GPT-4o), Mistral Large, Google Gemini, Cohere, Groq
- **Vulnerability Detection**: Identifies critical, high, medium, low, and info-level security issues
- **Smart Contract Analysis**: Solidity code scanning with precise line-by-line reporting
- **Risk Scoring**: Automated risk assessment with actionable recommendations
- **Gas Optimization**: Analyzes and suggests gas optimization strategies

### Dashboard & Monitoring
- **Real-time Audit Dashboard**: Visualize scan results with interactive charts
- **Audit History**: Complete audit trail with timestamps and results
- **Transaction Monitor**: Track contract interactions and transaction status
- **Circuit Breaker**: Automated smart contract protection and emergency stops
- **Security Firewall**: Advanced access control and rate limiting

### User Experience
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Dark/Light Theme**: Toggle theme support for comfortable usage
- **Real-time Notifications**: Toast notifications for audit events
- **Code Highlighting**: Syntax-highlighted vulnerability locations
- **Settings Panel**: Customizable audit and notification preferences

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **React Syntax Highlighter** - Code display

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration
- **Multiple LLM APIs** - AI provider integrations

---

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x or **yarn** >= 1.22.x
- API keys for at least one LLM provider:
  - OpenAI API Key
  - Mistral API Key
  - Google Gemini API Key
  - Cohere API Key
  - Groq API Key

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/designershubh1208-pixel/Sentinel-chain.git
cd Sentinel-chain
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update API endpoint if needed
# VITE_API_URL=http://localhost:3001
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API keys to .env
# OPENAI_API_KEY=your-key-here
# MISTRAL_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here
# COHERE_API_KEY=your-key-here
# GROQ_API_KEY=your-key-here
# PORT=3001
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Start Frontend Dev Server:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd server
npm start
```

---

## 📁 Project Structure

```
sentinel-chain/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard view
│   │   ├── Scanner.tsx         # Code scanner interface
│   │   ├── AuditHistory.tsx    # Audit results history
│   │   ├── TxMonitor.tsx       # Transaction monitoring
│   │   ├── CircuitBreaker.tsx  # Protection settings
│   │   ├── SettingsPage.tsx    # User preferences
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── LandingPage.tsx     # Welcome screen
│   ├── context/
│   │   └── ThemeContext.tsx    # Dark/light theme
│   ├── utils/
│   │   ├── api.ts              # API client functions
│   │   ├── auditEngine.ts      # Audit logic
│   │   └── cn.ts               # Utility helpers
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── data/
│   │   └── mockData.ts         # Sample data
│   ├── App.tsx                 # Main component
│   └── main.tsx                # Entry point
├── server/
│   ├── providers/
│   │   ├── openai.js           # OpenAI integration
│   │   ├── mistral.js          # Mistral integration
│   │   ├── gemini.js           # Google Gemini integration
│   │   ├── cohere.js           # Cohere integration
│   │   └── groq.js             # Groq integration
│   ├── utils/
│   │   └── prompt.js           # Prompt templates
│   ├── index.js                # Server entry point
│   └── package.json
├── public/
│   └── index.html
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── .gitignore                  # Git ignore rules
└── package.json
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=3001
OPENAI_API_KEY=your-openai-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
COHERE_API_KEY=your-cohere-api-key-here
GROQ_API_KEY=your-groq-api-key-here
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
```

---

## 🔐 Security Features

- **Prompt Injection Protection**: Detects and blocks malicious prompt injection attempts
- **Input Validation**: Validates all smart contract code inputs
- **API Key Management**: Secure credential handling with environment variables
- **Circuit Breaker**: Emergency stop mechanism for vulnerable contracts
- **Access Control**: Role-based firewall rules for contract interactions

---

## 📊 Data Types

### Audit Result
```typescript
interface AuditResult {
  riskScore: number;
  vulnerabilities: Vulnerability[];
  gasAnalysis: {
    estimatedGas: string;
    optimizationSuggestions: string[];
  };
  summary: string;
  recommendation: "deploy" | "deploy_with_firewall" | "block";
  scanTime: number;
  linesScanned: number;
}
```

### Vulnerability
```typescript
interface Vulnerability {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  line: number;
  lineEnd?: number;
  description: string;
  impact: string;
  recommendation: string;
  swcId?: string;
  confidence: number;
}
```

---

## 🔌 API Endpoints

### Health Check
```http
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-04-10T...",
  "providers": {
    "openai": true,
    "mistral": true,
    "gemini": true,
    "cohere": true,
    "groq": true
  }
}
```

### Run Audit
```http
POST /api/audit

Request Body:
{
  "code": "// Solidity code...",
  "contractName": "MyContract",
  "network": "ethereum",
  "provider": "openai"
}

Response:
{
  "success": true,
  "provider": "openai",
  "result": { AuditResult object }
}
```

---

## 🤖 Supported AI Providers

| Provider | Model | Speed | Accuracy | Cost |
|----------|-------|-------|----------|------|
| **OpenAI** | GPT-4o | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$$ |
| **Mistral** | Mistral Large | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $$ |
| **Google Gemini** | Gemini 1.5 Pro | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $$ |
| **Cohere** | Command R+ | ⭐⭐⭐ | ⭐⭐⭐⭐ | $ |
| **Groq** | LLaMA-3.3 70B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $ |

---

## 📋 Usage Example

### 1. Submit Smart Contract for Audit
Navigate to the Scanner page and paste your Solidity code:
```solidity
pragma solidity ^0.8.0;

contract Vulnerable {
    mapping(address => uint) balances;

    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }
}
```

### 2. Select Provider & Network
Choose your preferred AI provider and target network (Ethereum, Polygon, etc.)

### 3. Review Results
- **Vulnerabilities**: Detailed findings with severity levels
- **Risk Score**: Overall contract risk assessment
- **Gas Analysis**: Optimization recommendations
- **Recommendations**: Deploy, deploy with firewall, or block

### 4. Track History
All audits are saved in the Audit History for future reference

---

## 🧪 Testing

### Run Frontend Tests
```bash
npm test
```

### Run Backend Tests
```bash
cd server
npm test
```

---

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 3001
- Check `VITE_API_URL` in `.env.local`
- Verify CORS settings

### LLM Provider Errors
- Verify API keys are correctly set in `.env`
- Check provider quota limits
- Ensure network connectivity

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Restart dev server

---

## 📈 Performance

- **Frontend Bundle Size**: ~180KB (gzipped)
- **API Response Time**: 2-30 seconds (depending on contract size and provider)
- **Max Code Size**: 2MB per request
- **Database**: Audit history stored in browser localStorage

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Submit pull request

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/designershubh1208-pixel/Sentinel-chain/issues)
- **Email**: support@sentinelchain.dev
- **Documentation**: [Full Docs](https://docs.sentinelchain.dev)

---

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Powered by multiple LLM providers
- Inspired by security-first smart contract development

---

## ⚠️ Disclaimer

This tool is designed to assist in smart contract security auditing but should not be considered a replacement for professional security audits. Always conduct thorough manual reviews and testing before deploying contracts to production.

**Last Updated**: April 10, 2026  
**Version**: 1.0.0
