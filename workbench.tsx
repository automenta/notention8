import React from 'react';
import ReactDOM from 'react-dom/client';
import { Workbench } from './components/Workbench';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Workbench />
  </React.StrictMode>
);
