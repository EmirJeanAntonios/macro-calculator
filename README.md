# 🥗 Macro Calculator

A full-stack application for calculating personalized macros based on user input, workout schedule, and fitness goals.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/NestJS-10-red) ![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue) ![Tech Stack](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **Personalized Macro Calculation** - BMR & TDEE using Mifflin-St Jeor equation
- **Goal-Based Adjustments** - Weight loss, maintenance, or muscle gain
- **Workout Calendar** - Interactive weekly schedule with multiple workout types
- **Special Day Macros** - Different macros for workout vs rest days
- **PDF Export** - Download your personalized macro plan
- **Modern UI** - Beautiful responsive design with Tailwind CSS

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | NestJS + TypeORM |
| Database | PostgreSQL |
| PDF | PDFKit |

## 📋 Prerequisites

- Node.js 20+ (recommended) or 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
cd macro-calculator

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../ui
npm install
```

### 2. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE macro_calculator;

# Exit psql
\q
```

### 3. Environment Configuration

The backend `.env` file is already configured with defaults. Update if needed:

```bash
# server/.env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=macro_calculator

FRONTEND_URL=http://localhost:3000
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd ui
npm run dev
```

### 5. Access the App

**With Docker:**
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3002/api

**Without Docker (npm):**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calculate` | Calculate macros from user input |
| GET | `/api/macros/:id` | Get saved macro results |
| GET | `/api/pdf/:id` | Download PDF report |

### Example Request

```json
POST /api/calculate
{
  "userInput": {
    "age": 30,
    "gender": "male",
    "weight": 80,
    "weightUnit": "kg",
    "height": 180,
    "heightUnit": "cm",
    "goal": "muscle_gain"
  },
  "workouts": [
    { "day": "monday", "type": "strength", "hours": 1.5 },
    { "day": "tuesday", "type": "cardio", "hours": 1 },
    { "day": "wednesday", "type": "rest", "hours": 0 },
    { "day": "thursday", "type": "strength", "hours": 1.5 },
    { "day": "friday", "type": "hiit", "hours": 0.5 },
    { "day": "saturday", "type": "sports", "hours": 2 },
    { "day": "sunday", "type": "rest", "hours": 0 }
  ]
}
```

## 🧮 Calculation Methods

### BMR (Basal Metabolic Rate)
Using the **Mifflin-St Jeor Equation**:
- **Men:** BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
- **Women:** BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161

### TDEE (Total Daily Energy Expenditure)
BMR × Activity Multiplier based on workout schedule

### Goal Adjustments
- **Weight Loss:** TDEE × 0.8 (20% deficit)
- **Maintenance:** TDEE × 1.0
- **Muscle Gain:** TDEE × 1.1 (10% surplus)

## 📁 Project Structure

```
macro-calculator/
├── server/                    # NestJS Backend
│   ├── src/
│   │   ├── entities/          # TypeORM entities
│   │   ├── modules/
│   │   │   └── macro-calculator/
│   │   │       ├── dto/       # Data transfer objects
│   │   │       ├── macro-calculator.controller.ts
│   │   │       ├── macro-calculator.service.ts
│   │   │       └── pdf.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
├── ui/                        # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── README.md
└── TODO.md
```

## 🎨 Screenshots

The app features a modern, dark-themed UI with:
- Step-by-step form wizard
- Interactive workout calendar
- Animated calorie ring chart
- Responsive design for all devices

## 🔧 Development

```bash
# Run backend in dev mode (with hot reload)
cd server && npm run start:dev

# Run frontend in dev mode
cd ui && npm run dev

# Build for production
cd server && npm run build
cd ui && npm run build
```

## 📝 License

MIT License - feel free to use this project for learning or personal use.

---

Built with ❤️ using React, NestJS, and PostgreSQL
