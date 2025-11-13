// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsExports from './amplify-config'; 
import App from './App';

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);