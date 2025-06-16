import React, { useState, useMemo } from 'react';
import Chat from './Chat';
import './SopChatSetup.css';

interface Scenario {
  name: string;
  description: string;
  tools_response: { tool_name: string; tool_response: string }[];
}

interface Tool {
  name: string;
  description: string;
  args: any[];
  response: string;
  [key: string]: any;
}

const SopChatSetup: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'setup' | 'systemPrompt'>('setup');

  // State for dummy_tools and scenarios input
  const [dummyToolsInput, setDummyToolsInput] = useState('');
  const [scenariosInput, setScenariosInput] = useState('');
  const [inputsSaved, setInputsSaved] = useState(
    !!localStorage.getItem('dummy_tools') && !!localStorage.getItem('scenarios')
  );
  const [error, setError] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showScenarioSelect, setShowScenarioSelect] = useState(true);

  // System prompt state
  const [systemPrompt, setSystemPrompt] = useState(localStorage.getItem('system_prompt') || '');
  const [systemPromptSaved, setSystemPromptSaved] = useState(false);

  // Ref for system prompt section
  const systemPromptSectionRef = React.useRef<HTMLDivElement>(null);

  // When returning to form, prefill with current values
  const handleEdit = () => {
    setDummyToolsInput(localStorage.getItem('dummy_tools') || '');
    setScenariosInput(localStorage.getItem('scenarios') || '');
    setInputsSaved(false);
    setSelectedScenario(null);
    setShowScenarioSelect(true);
  };

  // Handle reset
  const handleReset = () => {
    localStorage.removeItem('dummy_tools');
    localStorage.removeItem('scenarios');
    setDummyToolsInput('');
    setScenariosInput('');
    setInputsSaved(false);
    setSelectedScenario(null);
    setShowScenarioSelect(true);
  };

  // Handle save for setup
  const handleSave = () => {
    try {
      // Validate JSON
      const dummyTools = JSON.parse(dummyToolsInput);
      const scenarios = JSON.parse(scenariosInput);
      localStorage.setItem('dummy_tools', JSON.stringify(dummyTools));
      localStorage.setItem('scenarios', JSON.stringify(scenarios));
      setInputsSaved(true);
      setError('');
      setSelectedScenario(null);
      setShowScenarioSelect(true);
    } catch (e) {
      setError('Invalid JSON. Please check your input.');
    }
  };

  // Handle save for system prompt
  const handleSystemPromptSave = () => {
    localStorage.setItem('system_prompt', systemPrompt);
    setSystemPromptSaved(true);
    setTimeout(() => setSystemPromptSaved(false), 1500);
  };

  // Handle scenario selection
  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarios: Scenario[] = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const scenario = scenarios.find(s => s.name === e.target.value) || null;
    setSelectedScenario(scenario);
    setShowScenarioSelect(false);
  };

  // Construct tools variable after scenario selection
  const tools = useMemo(() => {
    if (!selectedScenario) return [];
    const dummyTools: Tool[] = JSON.parse(localStorage.getItem('dummy_tools') || '[]');
    return dummyTools.map(tool => {
      const match = selectedScenario.tools_response.find(tr => tr.tool_name === tool.name);
      if (match) {
        return { ...tool, response: match.tool_response };
      }
      return tool;
    });
  }, [selectedScenario]);

  // When Edit System Prompt is clicked, switch tab and scroll to system prompt
  const handleEditSystemPrompt = () => {
    setActiveTab('systemPrompt');
    setTimeout(() => {
      systemPromptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100); // Wait for tab to render
  };

  // Tab UI
  const renderTabs = () => (
    <div className="sop-setup-tabs">
      <button
        className={`sop-setup-tab-btn${activeTab === 'setup' ? ' active' : ''}`}
        onClick={() => setActiveTab('setup')}
      >
        Setup
      </button>
      <button
        className={`sop-setup-tab-btn${activeTab === 'systemPrompt' ? ' active' : ''}`}
        onClick={() => setActiveTab('systemPrompt')}
      >
        System Prompt
      </button>
    </div>
  );

  // If not saved and on setup tab, show input forms
  if (!inputsSaved && activeTab === 'setup') {
    return (
      <div className="sop-setup-container">
        {renderTabs()}
        <h1 className="sop-setup-title">Setup: Enter dummy_tools and scenarios</h1>
        <div className="sop-setup-section">
          <label className="sop-setup-label">dummy_tools JSON:</label>
          <textarea
            rows={8}
            className="sop-setup-textarea"
            value={dummyToolsInput}
            onChange={e => setDummyToolsInput(e.target.value)}
            placeholder='Paste dummy_tools JSON here'
          />
        </div>
        <div className="sop-setup-section">
          <label className="sop-setup-label">scenarios JSON:</label>
          <textarea
            rows={8}
            className="sop-setup-textarea"
            value={scenariosInput}
            onChange={e => setScenariosInput(e.target.value)}
            placeholder='Paste scenarios JSON here'
          />
        </div>
        <button onClick={handleSave} className="sop-setup-save-btn">Save</button>
        {error && <div className="sop-setup-error">{error}</div>}
      </div>
    );
  }

  // If not saved and on system prompt tab, show system prompt form
  if (!inputsSaved && activeTab === 'systemPrompt') {
    return (
      <div className="sop-setup-container">
        {renderTabs()}
        <h1 className="sop-setup-title">System Prompt</h1>
        <div className="sop-system-prompt-section" ref={systemPromptSectionRef}>
          <label className="sop-setup-label">System Prompt:</label>
          <textarea
            rows={6}
            className="sop-system-prompt-textarea"
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder='Enter system prompt here'
          />
          <button onClick={handleSystemPromptSave} className="sop-setup-save-btn">Save System Prompt</button>
          {systemPromptSaved && <div className="sop-setup-error" style={{ color: 'green' }}>System prompt saved!</div>}
        </div>
      </div>
    );
  }

  // If saved but scenario not selected, show scenario selection
  if (inputsSaved && (showScenarioSelect || !selectedScenario)) {
    const scenarios: Scenario[] = JSON.parse(localStorage.getItem('scenarios') || '[]');
    return (
      <div className="sop-setup-container">
        {renderTabs()}
        <h1 className="sop-setup-title">Select a Scenario</h1>
        <div className="sop-setup-section">
          <label className="sop-setup-label">Scenario:</label>
          <select className="sop-setup-textarea" style={{height: 40}} onChange={handleScenarioSelect} defaultValue="">
            <option value="" disabled>Select a scenario...</option>
            {scenarios.map(s => (
              <option key={s.name} value={s.name}>{s.name} - {s.description}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // If saved and scenario selected, show chat and edit/reset/select scenario buttons
  return (
    <div>
      {renderTabs()}
      <h1>SOP Chat App</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={handleEdit} className="sop-setup-save-btn" style={{ width: 'auto', flex: 1 }}>Edit dummy_tools and scenarios</button>
        <button onClick={handleReset} className="sop-setup-save-btn" style={{ width: 'auto', flex: 1, background: '#dc3545' }}>Reset</button>
        <button onClick={() => { setShowScenarioSelect(true); }} className="sop-setup-save-btn" style={{ width: 'auto', flex: 1, background: '#6c757d' }}>Change Scenario</button>
        <button onClick={handleEditSystemPrompt} className="sop-setup-save-btn" style={{ width: 'auto', flex: 1, background: '#ffc107', color: '#333' }}>Edit System Prompt</button>
      </div>
      <div style={{ marginBottom: 16, fontWeight: 'bold', color: '#007bff' }}>
        Scenario: {selectedScenario?.name} - {selectedScenario?.description}
      </div>
      <Chat mode="dummy-tool" dummy_tools={tools} />
    </div>
  );
};

export default SopChatSetup; 