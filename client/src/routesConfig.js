import React from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; // remove if you don't have this

const routes = [
  { path: '/login', element: <Login /> },
  // If ProtectedRoute doesn't exist yet, use element: <Dashboard /> instead
  { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
];

export default routes;
