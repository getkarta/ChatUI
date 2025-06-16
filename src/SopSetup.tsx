import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SopChatSetup.css';

const SopSetup: React.FC = () => {
  const [dummyToolsInput, setDummyToolsInput] = useState(localStorage.getItem('dummy_tools') || '');
  const [scenariosInput, setScenariosInput] = useState(localStorage.getItem('scenarios') || '');
  const [systemPrompt, setSystemPrompt] = useState(localStorage.getItem('system_prompt') || '');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSave = () => {
    try {
      JSON.parse(dummyToolsInput);
      JSON.parse(scenariosInput);
      localStorage.setItem('dummy_tools', dummyToolsInput);
      localStorage.setItem('scenarios', scenariosInput);
      localStorage.setItem('system_prompt', systemPrompt);
      setError('');
      navigate('/sop/chat');
    } catch (e) {
      setError('Invalid JSON. Please check your input.');
    }
  };

  return (
    <div className="sop-setup-container">
      <h1 className="sop-setup-title">SOP Setup</h1>
      <div className="sop-setup-section">
        <label className="sop-setup-label">System Prompt:</label>
        <textarea
          rows={4}
          className="sop-system-prompt-textarea"
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder='Enter system prompt here'
        />
      </div>
      <div className="sop-setup-section">
        <label className="sop-setup-label">dummy_tools JSON:</label>
        <textarea
          rows={6}
          className="sop-setup-textarea"
          value={dummyToolsInput}
          onChange={e => setDummyToolsInput(e.target.value)}
          placeholder='Paste dummy_tools JSON here'
        />
      </div>
      <div className="sop-setup-section">
        <label className="sop-setup-label">scenarios JSON:</label>
        <textarea
          rows={6}
          className="sop-setup-textarea"
          value={scenariosInput}
          onChange={e => setScenariosInput(e.target.value)}
          placeholder='Paste scenarios JSON here'
        />
      </div>
      <button onClick={handleSave} className="sop-setup-save-btn">Save & Start Chat</button>
      {error && <div className="sop-setup-error">{error}</div>}
    </div>
  );
};

export default SopSetup; 