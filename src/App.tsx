import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Chat';
import SopChatSetup from './SopChatSetup';
import SopSetup from './SopSetup';
import SopChat from './SopChat';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Chat App</h1>
            <Chat mode="chat" />
          </div>
        } />
        <Route path="/sop/setup" element={<SopSetup />} />
        <Route path="/sop/chat" element={<SopChat />} />
        <Route path="/sop" element={<SopSetup />} />
      </Routes>
    </Router>
  );
};

export default App;
