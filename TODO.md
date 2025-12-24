# Macro Calculator - Project Tasks

## Phase 1: Project Setup

### Task 1.1: Backend Setup (NestJS) ✅
- [x] Initialize NestJS project in `/server` directory
- [x] Configure TypeScript settings
- [x] Install required dependencies (TypeORM, PostgreSQL driver, class-validator, etc.)
- [x] Set up environment configuration (.env)
- [x] Configure CORS for frontend communication

### Task 1.2: Database Setup (PostgreSQL) ✅
- [x] Create database schema design
- [x] Set up TypeORM configuration
- [x] Create database entities (User, Workout, MacroResult, etc.)
- [x] Set up migrations (using synchronize for dev)

### Task 1.3: Frontend Setup (ReactJS) ✅
- [x] Initialize React project in `/ui` directory (Vite + TypeScript)
- [x] Install required dependencies (axios, react-router-dom, Tailwind CSS, lucide-react)
- [x] Set up project structure (components, pages, services, hooks, types, utils)
- [x] Configure API proxy for backend connection

---

## Phase 2: Backend Development

### Task 2.1: User Input Module ✅
- [x] Create DTOs for user input validation (age, gender, weight, height, goal)
- [x] Create user input controller and service
- [x] Implement input validation logic

### Task 2.2: Workout Schedule Module ✅
- [x] Create Workout entity with fields (day, type, duration/hours)
- [x] Create workout DTO and validation
- [x] Integrated into MacroCalculator service

### Task 2.3: Macro Calculation Engine ✅
- [x] Implement BMR (Basal Metabolic Rate) calculation (Mifflin-St Jeor)
- [x] Implement TDEE (Total Daily Energy Expenditure) calculation
- [x] Implement macro distribution based on goals (weight loss, maintenance, muscle gain)
- [x] Handle special day calculations (rest days vs workout days)

### Task 2.4: PDF Generation ✅
- [x] Install PDF generation library (PDFKit)
- [x] Create PDF template for macro results
- [x] Implement PDF generation endpoint (GET /api/pdf/:id)
- [x] Add download functionality

### Task 2.5: API Endpoints ✅
- [x] POST /api/calculate - Calculate macros based on user input
- [x] GET /api/macros/:id - Get saved macro results
- [x] GET /api/pdf/:id - Generate and download PDF
- [x] (Workout schedule integrated into calculate endpoint)

---

## Phase 3: Frontend Development

### Task 3.1: User Input Form ✅
- [x] Create form component for user data input
- [x] Age input field
- [x] Biological gender selector (Male/Female)
- [x] Weight input (with unit selector kg/lbs)
- [x] Height input (with unit selector cm/ft)
- [x] Goal selector (Weight Loss, Maintenance, Muscle Gain)
- [x] Form validation with visual feedback
- [x] Step indicator component
- [x] Custom hooks for calculator state

### Task 3.2: Workout Calendar Component ✅
- [x] Create interactive calendar view
- [x] Allow users to select workout days
- [x] Workout type selector for each day (Cardio, Strength, HIIT, Rest, Yoga, Sports, Other)
- [x] Hours/duration input with slider (0.5-4h)
- [x] Visual indicators with icons and colors for different workout types
- [x] Summary stats (workout days, total hours)

### Task 3.3: Results Display
- [ ] Create results page/component
- [ ] Display calculated macros (Protein, Carbs, Fats)
- [ ] Display total Kcal
- [ ] Display special day variations (if applicable)
- [ ] Weekly/daily breakdown view

### Task 3.4: PDF Download Feature
- [ ] Add download button on results page
- [ ] Integrate with backend PDF endpoint
- [ ] Handle loading states and errors

### Task 3.5: UI/UX Polish
- [ ] Responsive design for mobile/tablet/desktop
- [ ] Loading states and animations
- [ ] Error handling and user feedback
- [ ] Modern, clean design aesthetic

---

## Phase 4: Integration & Testing

### Task 4.1: API Integration
- [ ] Connect frontend forms to backend API
- [ ] Implement error handling for API calls
- [ ] Add loading states

### Task 4.2: Testing
- [ ] Backend unit tests
- [ ] Frontend component tests
- [ ] E2E testing
- [ ] API endpoint testing

### Task 4.3: Final Polish
- [ ] Code cleanup and documentation
- [ ] Performance optimization
- [ ] Security review
- [ ] Deployment preparation

---

## Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Project Setup | ✅ Completed | All setup tasks done |
| Phase 2: Backend Development | ✅ Completed | All backend tasks done |
| Phase 3: Frontend Development | ⏳ Pending | |
| Phase 4: Integration & Testing | ⏳ Pending | |

---

**Legend:**
- ⏳ Pending
- 🔄 In Progress
- ✅ Completed
- ❌ Blocked

