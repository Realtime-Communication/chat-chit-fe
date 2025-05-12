import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';

import IntroScreen from './components/IntroScreen/IntroScreen';
import LayoutDefault from './components/LayoutDefault/LayoutDefault';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';

function App(): JSX.Element {
  return (
    <Routes>
      {/* Standalone Route */}
      <Route path="/" element={<IntroScreen />} />

      {/* Layout Routes */}
      <Route path="/" element={<LayoutDefault />}>
        <Route path="home" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
