import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EquipmentList from './components/EquipmentList';
import EquipmentForm from './components/EquipmentForm';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import Reports from './components/Reports';
import TeamManagement from './components/TeamManagement';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">GearGuard</h1>
            <div className="nav-links">
              <Link to="/">Equipment</Link>
              <Link to="/kanban">Kanban Board</Link>
              <Link to="/calendar">Calendar</Link>
              <Link to="/teams">Teams</Link>
              <Link to="/reports">Reports</Link>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<EquipmentList />} />
            <Route path="/equipment/new" element={<EquipmentForm />} />
            <Route path="/equipment/:id" element={<EquipmentForm />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/teams" element={<TeamManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

