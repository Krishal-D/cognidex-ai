import React from 'react';
import { Register } from './pages/register';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/login';

const App: React.FC = () => {
  return (

    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />

    </Routes>

  )

};

export default App;
