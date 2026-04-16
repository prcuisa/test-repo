import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';

import 'react-datepicker/dist/react-datepicker.css';
import './styles/tailwind.css';
import './scss/style.scss';

// Suppress react-intl-tel-input defaultProps warning
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps will be removed from function components')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
