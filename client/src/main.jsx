import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router/index';
import Toast from './components/alerts/Toast';
import { useSse } from './hooks/useSse';

function App() {
  useSse(); // opens sse for whole app

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

