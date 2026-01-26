import React from 'react';
import ReactDOM from 'react-dom/client';
import 'tippy.js/dist/tippy.css'; // Import tippy styles for suggestions
import './index.css';
import App from './App';
import { SettingsProvider } from './components/contexts/SettingsContext';
import { NotesProvider } from './components/contexts/NotesContext';
import { ViewProvider } from './components/contexts/ViewContext';
import { ToastProvider } from './components/contexts/ToastContext';
import { SimulatorProvider } from './components/contexts/SimulatorContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <NotesProvider>
        <ToastProvider>
          <ViewProvider>
            <SimulatorProvider>
              <App />
            </SimulatorProvider>
          </ViewProvider>
        </ToastProvider>
      </NotesProvider>
    </SettingsProvider>
  </React.StrictMode>
);
