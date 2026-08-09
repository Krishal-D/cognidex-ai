import React from 'react';
import { Register } from './pages/register';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/login';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      <Route path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      <Route path="/dashboard/document/:documentId"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      <Route path="/dashboard/document/:documentId/conversation/:conversationId"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      <Route path="/" element={<Landing />} />
    </Routes>

  )

};

export default App;
