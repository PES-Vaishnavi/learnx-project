// 1. ALL imports must be at the very top
import { Buffer } from 'buffer';
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 2. NOW you can do your global assignments
window.Buffer = Buffer;
window.process = process;
window.global = window;

// 3. Finally, render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();