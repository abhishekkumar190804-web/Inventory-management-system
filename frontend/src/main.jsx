import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181818',
            color: '#e5e5e5',
            border: '1px solid #2a2a2a',
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
