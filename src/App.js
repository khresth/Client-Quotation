import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Updated pricing system with new tiers - v2.0

const baseCosts = {
  webDevelopmentStarter: 499,
  webDevelopmentProfessional: 1499,
  mobileAppsStarter: 999,
  mobileAppsProfessional: 2999,
  uiuxDesignStarter: 349,
  uiuxDesignProfessional: 999,
  ecommerceStarter: 699,
  ecommerceProfessional: 1999,
  apiDevelopmentStarter: 399,
  apiDevelopmentProfessional: 1199,
  marketingAutomationStarter: 299,
  marketingAutomationProfessional: 799,
  customSoftwareStarter: 1499,
  customSoftwareProfessional: 4999,
  performanceOptimizationStarter: 199,
  performanceOptimizationProfessional: 599,
  aiSolutionsStarter: 599,
  aiSolutionsProfessional: 2499,
  seoDigitalMarketingStarter: 149,
  seoDigitalMarketingProfessional: 499
};

const projectTypes = [
  { id: 'webDevelopmentStarter', label: 'Web Development (Starter)', price: 499 },
  { id: 'webDevelopmentProfessional', label: 'Web Development (Professional)', price: 1499 },
  { id: 'mobileAppsStarter', label: 'Mobile Apps (Starter)', price: 999 },
  { id: 'mobileAppsProfessional', label: 'Mobile Apps (Professional)', price: 2999 },
  { id: 'uiuxDesignStarter', label: 'UI/UX Design (Starter)', price: 349 },
  { id: 'uiuxDesignProfessional', label: 'UI/UX Design (Professional)', price: 999 },
  { id: 'ecommerceStarter', label: 'E-Commerce (Starter)', price: 699 },
  { id: 'ecommerceProfessional', label: 'E-Commerce (Professional)', price: 1999 },
  { id: 'apiDevelopmentStarter', label: 'API Development (Starter)', price: 399 },
  { id: 'apiDevelopmentProfessional', label: 'API Development (Professional)', price: 1199 },
  { id: 'marketingAutomationStarter', label: 'Marketing Automation (Starter)', price: 299 },
  { id: 'marketingAutomationProfessional', label: 'Marketing Automation (Professional)', price: 799 },
  { id: 'customSoftwareStarter', label: 'Custom Software (Starter)', price: 1499 },
  { id: 'customSoftwareProfessional', label: 'Custom Software (Professional)', price: 4999 },
  { id: 'performanceOptimizationStarter', label: 'Performance Optimization (Starter)', price: 199 },
  { id: 'performanceOptimizationProfessional', label: 'Performance Optimization (Professional)', price: 599 },
  { id: 'aiSolutionsStarter', label: 'AI Solutions (Starter)', price: 599 },
  { id: 'aiSolutionsProfessional', label: 'AI Solutions (Professional)', price: 2499 },
  { id: 'seoDigitalMarketingStarter', label: 'SEO & Digital Marketing (Starter)', price: 149 },
  { id: 'seoDigitalMarketingProfessional', label: 'SEO & Digital Marketing (Professional)', price: 499 }
];

function App() {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [clientType, setClientType] = useState('individual');
  const [deadline, setDeadline] = useState('normal');
  const [ndaSelected, setNdaSelected] = useState(false);
  const [lteDiscount, setLteDiscount] = useState(false);
  const [clientName, setClientName] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enterpriseCustom, setEnterpriseCustom] = useState(false);

  const calculateCost = useCallback(() => {
    if (enterpriseCustom) {
      return 0; // Custom pricing for enterprise
    }
    
    let cost = selectedProjects.reduce((sum, projectId) => sum + (baseCosts[projectId] || 0), 0);
    
    if (clientType === 'company') cost *= 1.20;
    if (deadline === 'tight') cost *= 1.15;
    if (ndaSelected) cost *= 1.05;
    if (lteDiscount) cost *= 0.85;
    
    return cost;
  }, [selectedProjects, clientType, deadline, ndaSelected, lteDiscount, enterpriseCustom]);

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
            <legend className="legend">Service Tier</legend>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="tier"
                  value="starter"
                  checked={selectedTier === 'starter'}
                  onChange={(e) => setSelectedTier(e.target.value)}
                />
                Starter Tier
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tier"
                  value="professional"
                  checked={selectedTier === 'professional'}
                  onChange={(e) => setSelectedTier(e.target.value)}
                />
                Professional Tier
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tier"
                  value="enterprise"
                  checked={selectedTier === 'enterprise'}
                  onChange={(e) => {
                    setSelectedTier(e.target.value);
                    setEnterpriseCustom(true);
                    setSelectedProjects([]);
                  }}
                />
                Enterprise (Custom Pricing)
              </label>
            </div>
          </fieldset>

          {!enterpriseCustom && (
            <>
              <fieldset className="fieldset">
                <legend className="legend">Web Development</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'webDevelopmentStarter' : 'webDevelopmentProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'webDevelopmentStarter' : 'webDevelopmentProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 499 : 1499}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">Mobile Apps</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'mobileAppsStarter' : 'mobileAppsProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'mobileAppsStarter' : 'mobileAppsProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 999 : 2999}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">UI/UX Design</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'uiuxDesignStarter' : 'uiuxDesignProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'uiuxDesignStarter' : 'uiuxDesignProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 349 : 999}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">E-Commerce</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'ecommerceStarter' : 'ecommerceProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'ecommerceStarter' : 'ecommerceProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 699 : 1999}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">API Development</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'apiDevelopmentStarter' : 'apiDevelopmentProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'apiDevelopmentStarter' : 'apiDevelopmentProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 399 : 1199}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">Marketing Automation</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'marketingAutomationStarter' : 'marketingAutomationProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'marketingAutomationStarter' : 'marketingAutomationProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 299 : 799}/mo</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">Custom Software</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'customSoftwareStarter' : 'customSoftwareProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'customSoftwareStarter' : 'customSoftwareProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 1499 : 4999}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">Performance Optimization</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'performanceOptimizationStarter' : 'performanceOptimizationProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'performanceOptimizationStarter' : 'performanceOptimizationProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 199 : 599}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">AI Solutions</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'aiSolutionsStarter' : 'aiSolutionsProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'aiSolutionsStarter' : 'aiSolutionsProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 599 : 2499}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="legend">SEO & Digital Marketing</legend>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(selectedTier === 'starter' ? 'seoDigitalMarketingStarter' : 'seoDigitalMarketingProfessional')}
                      onChange={() => handleProjectToggle(selectedTier === 'starter' ? 'seoDigitalMarketingStarter' : 'seoDigitalMarketingProfessional')}
                    />
                    {selectedTier === 'starter' ? 'Starter' : 'Professional'} <span className="price-tag">${selectedTier === 'starter' ? 149 : 499}/mo</span>
                  </label>
                </div>
              </fieldset>
            </>
          )}

          {enterpriseCustom && (
            <fieldset className="fieldset full-width">
              <legend className="legend">Enterprise Custom Solutions</legend>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'oklch(0.985 0 0)', marginBottom: '15px' }}>
                  Enterprise solutions are custom-tailored to your specific needs.
                </p>
                <p style={{ color: 'oklch(0.708 0 0)' }}>
                  Please contact us for a personalized quote based on your requirements.
                </p>
              </div>
            </fieldset>
          )}
          
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
          {enterpriseCustom ? (
            <>
              <div className="cost-label">Enterprise Pricing</div>
              <div className="cost-display">Custom Quote</div>
            </>
          ) : (
            <>
              <div className="cost-label">Total Cost</div>
              <div className="cost-display">${totalCost.toFixed(2)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
