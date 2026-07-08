import React from 'react';
import ReactDOM from 'react-dom/client';
import TikApp from './TikApp.jsx';
import './index.css';

document.documentElement.lang = 'he';
document.documentElement.dir = 'rtl';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TikApp />
  </React.StrictMode>,
);
