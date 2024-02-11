import React, { useEffect, useState } from 'react';
import './index.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/index';
import Login from './components/Login/Auth';
import LayoutDefault from './components/LayoutDefault/LayoutDefault';

function App() {
  return (
    <Routes>
        <Route path="/" element={<LayoutDefault/>}>
          <Route path="home" element={<Home/>}/>
          <Route path="login" element={<Login/>}/>
        </Route>
    </Routes>
    
  );
}

export default App;