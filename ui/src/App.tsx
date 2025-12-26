import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WorkoutTypesProvider } from './contexts/WorkoutTypesContext';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <WorkoutTypesProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </Router>
    </WorkoutTypesProvider>
  );
}

export default App;
