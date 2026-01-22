import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { io } from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:5000');

// Example: Listen for messages from the server
socket.on('message', (data) => {
    console.log('Message from server:', data);
});

// Example: Emit an event to the server
socket.emit('update', { message: 'Hello from the client!' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
