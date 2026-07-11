import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';
import '@lablnet/ui/styles.css';

const container = document.getElementById('root');
if (container === null) throw new Error('Root element #root not found');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
