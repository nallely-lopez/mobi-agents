# 🚗 MobiAgents - Urban Mobility Optimization System

> **AI-powered autonomous agents optimizing urban transportation**

[![Monad Hackathon](https://img.shields.io/badge/Monad-Hackathon%202025-purple)](https://monad.xyz)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Live%20Demo-success)](https://nallely-lopez.github.io/mobi-agents/)

**🏆 Monad Hackathon 2025** | **Track:** Agent + World Model Reward

---

## 🚀 Live Demo

### [▶️ Try MobiAgents Now](https://nallely-lopez.github.io/mobi-agents/)

Experience the AI-powered urban mobility system in action:
- 🎮 **Interactive simulation** with real-time agent behavior
- 📊 **Live statistics** and performance metrics
- 🗺️ **Visual city map** with animated routes
- ⚙️ **Configurable controls** for speed and features

### [📹 Watch 2-Minute Demo Video](YOUR_LOOM_VIDEO_LINK_HERE)

---

## 🎯 The Problem

Urban traffic congestion costs **billions annually** and wastes **countless hours** of productivity. Traditional ride-sharing platforms use centralized algorithms that can't adapt in real-time to changing conditions.

## 💡 Our Solution

**MobiAgents** uses **autonomous AI agents** that independently make intelligent decisions to optimize urban mobility through:

- 🧠 **Decentralized Intelligence**: Each driver agent thinks independently
- ⚡ **Real-time Adaptation**: Responds to traffic and demand instantly  
- 🎯 **Smart Matching**: ML-based passenger-driver pairing
- 💰 **Fair Economics**: Dynamic pricing based on supply-demand
- ⭐ **Reputation System**: Quality service rewarded

---

## ✨ Key Features

### 🤖 Intelligent Agent System
- **4 autonomous driver agents** with independent decision-making
- **Energy management**: Agents rest when tired
- **Rating system**: Service quality affects matching priority
- **Multi-factor evaluation**: Distance, traffic, earnings, passenger rating

### 🗺️ Interactive Visualization
- **Real-time city simulation** with animated routes
- **Live performance metrics** and statistics
- **Dynamic traffic system** affecting routing decisions
- **Event logging** showing all system activities

### 📊 Advanced Analytics
- **Performance charts** tracking earnings and trips
- **Efficiency metrics** in real-time
- **Configurable simulation speed** (0.5x - 5x)
- **Historical data tracking**

### 🎮 User Controls
- Start/Pause/Reset simulation
- Toggle route visibility
- Auto-assign rides on/off
- Spawn new passengers dynamically

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | HTML5 Canvas, Vanilla JavaScript |
| **AI Logic** | Custom decision tree algorithms |
| **Blockchain** | Monad Testnet (integration ready) |
| **Architecture** | Event-driven agent-based system |

---

## 🚀 Quick Start

### Online Demo
Simply visit: **[https://nallely-lopez.github.io/mobi-agents/](https://nallely-lopez.github.io/mobi-agents/)**

No installation required! Click "Iniciar" to start the simulation.

### Run Locally

#### Prerequisites
- Node.js v18+ (for backend simulation)
- Modern web browser (for visualization)

#### Installation
```bash
# Clone repository
git clone https://github.com/nallely-lopez/mobi-agents.git
cd mobi-agents

# Install dependencies for backend
cd agents
npm install
```

#### Run Visualization (Frontend)
```bash
cd frontend
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Visit: http://localhost:8000
```

#### Run Backend Simulation
```bash
cd agents

# Basic simulation
node driver-agent.js

# Intelligent agents
node intelligent-agents.js

# Full city simulation
node simulation-v2.js
```

---

## 🧠 How It Works

### Agent Decision-Making Algorithm

Each driver agent evaluates ride requests using a **scoring system**:
```javascript
Score = Distance_Score + Fare_Score + Energy_Score + 
        Passenger_Rating_Score + Traffic_Score

if (Score >= 40) {
    ACCEPT_RIDE
} else {
    REJECT_RIDE
}
```

**Scoring Factors:**
- ✅ **Short distance** (+30 points)
- ✅ **High fare** (+25 points)  
- ✅ **High energy** (+20 points)
- ✅ **Good passenger rating** (+15 points)
- ⚠️ **Heavy traffic** (-15 points)

### Matching System

1. **Passenger requests ride** with destination
2. **All available drivers** evaluate the request
3. **System selects** driver with highest score
4. **Driver navigates** using optimal route
5. **Trip completes**, earnings distributed, ratings updated

---

## 📈 Performance Results

Based on typical simulation runs:

| Metric | Result |
|--------|--------|
| **Success Rate** | 95-100% |
| **Avg Trips/Driver** | 5-8 per session |
| **Avg Earnings/Driver** | $250-500 |
| **Customer Satisfaction** | 4.5+ ⭐ |
| **System Efficiency** | 85-95% |

---

## 🎮 Using the Demo

### Controls
1. **▶️ Iniciar**: Start the simulation
2. **⏸️ Pausar**: Pause the simulation
3. **🔄 Reiniciar**: Reset to initial state

### Features to Try
- **Speed Control**: Adjust simulation speed (0.5x - 5x)
- **Route Toggle**: Show/hide animated routes
- **New Passenger**: Add passengers dynamically
- **Auto-Assign**: Enable/disable automatic ride matching

### What to Watch
- 🚗 Drivers moving to pick up passengers
- 💰 Earnings and trips updating in real-time
- 🚦 Traffic levels changing dynamically
- 📋 Event log showing system activities
- 📈 Performance chart tracking progress

---

## 🔮 Roadmap

### Phase 1: Core (✅ Complete)
- [x] Intelligent agent system
- [x] Interactive visualization
- [x] Smart matching algorithm
- [x] Real-time analytics

### Phase 2: Blockchain Integration (🔄 In Progress)
- [ ] Monad testnet integration
- [ ] MON token payment system
- [ ] Smart contracts for rides
- [ ] On-chain reputation storage

### Phase 3: Advanced Features (📋 Planned)
- [ ] Multi-city expansion
- [ ] NFT driver licenses
- [ ] Token rewards for efficiency
- [ ] DAO governance for pricing
- [ ] Mobile app interface

---

## 🏗️ Project Structure
```
mobi-agents/
├── agents/                    # Backend simulation
│   ├── driver-agent.js       # Basic agents
│   ├── intelligent-agents.js # Smart agents
│   ├── simulation-v2.js      # Full simulation
│   └── package.json
├── frontend/                  # Visualization
│   ├── index.html            # Main interface
│   └── visualization.js      # Canvas rendering & logic
├── docs/                      # Documentation & assets
├── index.html                 # Redirect to frontend
└── README.md                  # This file
```

---

## 🎓 What I Learned

Building MobiAgents taught me:

- **Agent-based systems**: How autonomous agents can solve complex coordination problems
- **Real-time simulation**: Balancing performance with visual feedback
- **Decision algorithms**: Creating intelligent scoring systems
- **Web3 architecture**: Designing for blockchain integration
- **UI/UX for data**: Making complex systems understandable

---

## 🔗 Links

- **🌐 Live Demo**: [https://nallely-lopez.github.io/mobi-agents/](https://nallely-lopez.github.io/mobi-agents/)
- **📹 Video Demo**: [Watch on Loom](YOUR_LOOM_VIDEO_LINK_HERE)
- **💻 Source Code**: [GitHub Repository](https://github.com/nallely-lopez/mobi-agents)
- **🏆 Hackathon**: [Monad Hackathon 2025](https://monad.xyz)

---

## 👩‍💻 About Me

**Nallely López**
- 🎓 Computer Systems Engineering Student (6th semester)
- 🌐 Passionate about Web3, AI, and decentralized systems
- 🏆 Mobil3 Hackathon Participant (Mexico City, Aug 2024)
- 💻 Focus: JavaScript, Blockchain, Intelligent Systems

**Connect:**
- GitHub: [@nallely-lopez](https://github.com/nallely-lopez)
- Project: [MobiAgents](https://github.com/nallely-lopez/mobi-agents)

---

## 📄 License

MIT License © 2025 Nallely López

Built for **Monad Hackathon 2025**

---

## 🙏 Acknowledgments

- **Monad Team** for hosting an amazing hackathon
- **Anthropic's Claude** for development assistance
- **Open source community** for inspiration

---

<div align="center">

### 🚀 [Try the Live Demo](https://nallely-lopez.github.io/mobi-agents/)

**⭐ Star this repo if you find it interesting!**

Built with ❤️ for **smarter cities** and **decentralized mobility**

[View Demo](https://nallely-lopez.github.io/mobi-agents/) • [Watch Video](YOUR_LOOM_VIDEO_LINK_HERE) • [Report Bug](https://github.com/nallely-lopez/mobi-agents/issues)

</div>
