import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';

// Add Tool type for clarity
interface Tool {
  name: string;
  description: string;
  args: any[];
  response?: string;
  [key: string]: any;
}

const SopChat: React.FC = () => {
  const [scenario, setScenario] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [tools, setTools] = useState<Tool[]>([]); // <-- Add tools state
  const navigate = useNavigate();

  useEffect(() => {
    const scenariosStr = localStorage.getItem('scenarios');
    const dummyToolsStr = localStorage.getItem('dummy_tools');
    if (scenariosStr && dummyToolsStr) {
      try {
        const parsedScenarios = JSON.parse(scenariosStr);
        const parsedDummyTools: Tool[] = JSON.parse(dummyToolsStr);
        setScenarios(parsedScenarios);
        setScenario(parsedScenarios[0] || null);
        // Set initial tools based on first scenario
        if (parsedScenarios[0]) {
          setTools(mergeToolsWithScenario(parsedDummyTools, parsedScenarios[0]));
        }
      } catch {}
    }
  }, []);

  // Helper to merge dummy_tools with scenario responses
  function mergeToolsWithScenario(dummyTools: Tool[], scenario: any): Tool[] {
    if (!scenario || !scenario.tools_response) return dummyTools;
    return dummyTools.map(tool => {
      const match = scenario.tools_response.find((tr: any) => tr.tool_name === tool.name);
      if (match) {
        return { ...tool, response: match.tool_response };
      }
      return tool;
    });
  }

  const handleReset = () => {
    localStorage.removeItem('dummy_tools');
    localStorage.removeItem('scenarios');
    localStorage.removeItem('system_prompt');
    navigate('/sop/setup');
  };

  const handleEditSetup = () => {
    navigate('/sop/setup');
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = scenarios.find(s => s.name === e.target.value);
    setScenario(selected || null);
    // Update tools based on selected scenario
    const dummyToolsStr = localStorage.getItem('dummy_tools');
    if (dummyToolsStr && selected) {
      const parsedDummyTools: Tool[] = JSON.parse(dummyToolsStr);
      setTools(mergeToolsWithScenario(parsedDummyTools, selected));
    }
  };

  if (!scenario) {
    return <div>No scenario selected. <button onClick={handleReset}>Go to Setup</button></div>;
  }

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div style={{padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <strong>Scenario:</strong>
          <select value={scenario.name} onChange={handleScenarioChange} style={{padding: '0.25rem 0.5rem'}}>
            {scenarios.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={handleEditSetup} style={{color: 'green', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}>Edit Setup</button>
          <button onClick={handleReset} style={{color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}>Reset</button>
        </div>
      </div>
      <div style={{flex: 1, minHeight: 0}}>
        <Chat mode="dummy-tool" dummy_tools={tools} />
      </div>
    </div>
  );
};

export default SopChat; 