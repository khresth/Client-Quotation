import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const baseCosts = {
  frontend: 125,
  backend: 350,
  api: 100,
  ai: 2500,
  ml: 150,
  bot: 100,
  design: 30,
  documentary: 50,
  maintenanceMonthly: 25,
  maintenanceYearly: 200,
  hosting: 100,
  security: 30
};

const projectTypes = [
  { id: 'frontend', label: 'Frontend', price: 125 },
  { id: 'backend', label: 'Backend', price: 350 },
  { id: 'api', label: 'API/3rd Party', price: 100 },
  { id: 'ai', label: 'AI LLM', price: 2500 },
  { id: 'ml', label: 'Machine Learning', price: 150 },
  { id: 'bot', label: 'Bot', price: 100 },
  { id: 'design', label: 'Design Template', price: 30 },
  { id: 'documentary', label: 'Documentary', price: 50 },
  { id: 'maintenanceMonthly', label: 'Maintenance (Monthly)', price: 25 },
  { id: 'maintenanceYearly', label: 'Maintenance (Yearly)', price: 200 },
  { id: 'hosting', label: 'Hosting', price: 100 },
  { id: 'security', label: 'Encryption/Watermark/Copy Paste Prevention', price: 30 }
];

function App() {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [clientType, setClientType] = useState('individual');
  const [deadline, setDeadline] = useState('normal');
  const [ndaSelected, setNdaSelected] = useState(false);
  const [lteDiscount, setLteDiscount] = useState(false);
  const [clientName, setClientName] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateCost = useCallback(() => {
    let cost = selectedProjects.reduce((sum, projectId) => sum + (baseCosts[projectId] || 0), 0);
    
    if (clientType === 'company') cost *= 1.20;
    if (deadline === 'tight') cost *= 1.15;
    if (ndaSelected) cost *= 1.05;
    if (lteDiscount) cost *= 0.85;
    
    return cost;
  }, [selectedProjects, clientType, deadline, ndaSelected, lteDiscount]);

  useEffect(() => {
    setTotalCost(calculateCost());
  }, [calculateCost]);

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const generateEssay = async (prompt) => {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputs: prompt, 
          parameters: { max_length: 300, temperature: 0.7 } 
        })
      });
      const data = await response.json();
      return data[0]?.generated_text || "Error generating essay.";
    } catch (error) {
      console.error("API Error:", error);
      return "Error generating essay.";
    }
  };

  const generateProposal = async () => {
    setIsGenerating(true);
    
    // Dynamically import jsPDF only on client side
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const selectedLabels = selectedProjects.map(id => 
      projectTypes.find(p => p.id === id)?.label || id
    );
    
    const prompt = `Write a concise, professional proposal starting with "Dear ${clientName || 'Client'},". The project includes ${selectedLabels.join(", ") || "no services selected"}. It's for a ${clientType} with a ${deadline} deadline. Include ${ndaSelected ? "an NDA" : "no NDA"} and ${lteDiscount ? "an LTE discount" : "no discount"}. Total cost is $${totalCost.toFixed(2)}. End with a friendly closing and contact info (xxx@gmail.com, 123 456 7890).`;
    
    let essayText = await generateEssay(prompt);
    
    if (!essayText.includes("Dear") || essayText.includes("Error")) {
      essayText = `Dear ${clientName || 'Client'},\n\nWe're excited to present your project quotation. Your project includes ${selectedLabels.join(", ") || "no services selected"}, tailored for a ${clientType} with a ${deadline} timeline. ${ndaSelected ? "An NDA ensures confidentiality" : "No NDA is included"}, and ${lteDiscount ? "you're receiving our LTE discount" : "no discount applies"}. The total cost is $${totalCost.toFixed(2)}. We're eager to get started - reach out at xxx@gmail.com or 123 456 7890 with any questions!\n\nBest regards,\nMagnimont`;
    }
    
    let yPos = 20;
    doc.setFontSize(14);
    doc.text("Magnimont", 10, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), 10, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(essayText, 10, yPos, { maxWidth: 180 });
    
    doc.save(`Quotation_Proposal_${clientName || 'Client'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="app">
      <div className="container fade-in">
        <header className="header">
          <h1 className="logo">Magnimont</h1>
          <p className="subtitle">Software for Ventures</p>
          <p className="tagline">Transforming Ideas Into Digital Reality</p>
        </header>
        
        <div className="form-grid">
          <fieldset className="fieldset">
            <legend className="legend">Project Type</legend>
            <div className="checkbox-group">
              {projectTypes.map(project => (
                <label key={project.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                  />
                  {project.label} <span className="price-tag">${project.price}</span>
                </label>
              ))}
            </div>
          </fieldset>
          
          <fieldset className="fieldset">
            <legend className="legend">Client Type</legend>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="clientType"
                  value="individual"
                  checked={clientType === 'individual'}
                  onChange={(e) => setClientType(e.target.value)}
                />
                Individual
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="clientType"
                  value="company"
                  checked={clientType === 'company'}
                  onChange={(e) => setClientType(e.target.value)}
                />
                Company <span className="price-tag">(+20%)</span>
              </label>
            </div>
          </fieldset>
          
          <fieldset className="fieldset">
            <legend className="legend">Deadline</legend>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="deadline"
                  value="normal"
                  checked={deadline === 'normal'}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                Normal
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="deadline"
                  value="tight"
                  checked={deadline === 'tight'}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                Tight <span className="price-tag">(+15%)</span>
              </label>
            </div>
          </fieldset>
          
          <fieldset className="fieldset">
            <legend className="legend">Additional Options</legend>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ndaSelected}
                  onChange={(e) => setNdaSelected(e.target.checked)}
                />
                NDA <span className="price-tag">(+5%)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={lteDiscount}
                  onChange={(e) => setLteDiscount(e.target.checked)}
                />
                LTE Discount <span className="price-tag">(-15%)</span>
              </label>
            </div>
          </fieldset>
          
          <fieldset className="fieldset full-width">
            <legend className="legend">Client Name</legend>
            <input
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </fieldset>
        </div>
        
        <button 
          className="generate-button"
          onClick={generateProposal}
          disabled={isGenerating}
        >
          {isGenerating ? <span className="loading"></span> : 'Generate Proposal'}
        </button>
        
        <div className="result-section fade-in">
          <div className="cost-label">Total Cost</div>
          <div className="cost-display">${totalCost.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
