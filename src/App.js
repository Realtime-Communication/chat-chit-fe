import React, { useEffect, useState } from 'react';
import './index.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/index';
import Login from './components/Auth/Login';
import LayoutDefault from './components/LayoutDefault/LayoutDefault';
import IntroScreen from './components/IntroScreen/IntroScreen';
import Register from './components/Auth/Register';

function App() {
  return (
    <Routes>
        <Route path="/" element={<IntroScreen/>}/>
        <Route path="/" element={<LayoutDefault/>}>
          <Route path="home" element={<Home/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
        </Route>
    </Routes>
    
  );
}

export default App;