function calculateCost(checkedTypes, clientType, deadline, ndaSelected, lteDiscount) {
    const baseCosts = { frontend: 125, backend: 350, ai: 2500, design: 30 };
    let totalCost = checkedTypes.reduce((sum, type) => sum + (baseCosts[type] || 0), 0);
    if (clientType === "company") totalCost *= 1.20;
    if (deadline === "tight") totalCost *= 1.15;
    if (ndaSelected) totalCost *= 1.05;
    if (lteDiscount) totalCost *= 0.85;
    return totalCost;
}


function updateCostDisplay() {
    const checkedTypes = Array.from(document.querySelectorAll('input[name="projectType"]:checked')).map(cb => cb.value);
    const clientType = document.querySelector('input[name="clientType"]:checked').value;
    const deadline = document.querySelector('input[name="deadline"]:checked').value;
    const ndaSelected = document.getElementById('nda').checked;
    const lteDiscount = document.getElementById('lteDiscount').checked;

    const totalCost = calculateCost(checkedTypes, clientType, deadline, ndaSelected, lteDiscount);
    document.getElementById('finalCost').innerText = totalCost.toFixed(2);
}


async function generateEssay(prompt) {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: prompt, parameters: { max_length: 300, temperature: 0.7 } })
        });
        const data = await response.json();
        return data[0]?.generated_text || "Error generating essay.";
    } catch (error) {
        console.error("API Error:", error);
        return "Error generating essay.";
    }
}


async function generateEssayReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();


    const clientName = document.getElementById('clientName').value || "Client";
    const checkedTypes = Array.from(document.querySelectorAll('input[name="projectType"]:checked')).map(cb => cb.value);
    const clientType = document.querySelector('input[name="clientType"]:checked').value;
    const deadline = document.querySelector('input[name="deadline"]:checked').value;
    const ndaSelected = document.getElementById('nda').checked;
    const lteDiscount = document.getElementById('lteDiscount').checked;
    const totalCost = calculateCost(checkedTypes, clientType, deadline, ndaSelected, lteDiscount);


    const prompt = `Write a concise, professional proposal starting with "Dear ${clientName},". The project includes ${checkedTypes.join(", ") || "no services selected"}. It’s for a ${clientType} with a ${deadline} deadline. Include ${ndaSelected ? "an NDA" : "no NDA"} and ${lteDiscount ? "an LTE discount" : "no discount"}. Total cost is $${totalCost.toFixed(2)}. End with a friendly closing and contact info (xxx@gmail.com, 123 456 7890).`;


    let essayText = await generateEssay(prompt);


    if (!essayText.includes("Dear") || essayText.includes("Error")) {
        essayText = `Dear ${clientName},\n\nWe’re excited to present your project quotation. Your project includes ${checkedTypes.join(", ") || "no services selected"}, tailored for a ${clientType} with a ${deadline} timeline. ${ndaSelected ? "An NDA ensures confidentiality" : "No NDA is included"}, and ${lteDiscount ? "you’re receiving our LTE discount" : "no discount applies"}. The total cost is $${totalCost.toFixed(2)}. We’re eager to get started reach out at xxx@gmail.com or 123 456 7890 with any questions!\n\nBest regards,\nMagnimont`;
    }

    let yPos = 20;
    doc.setFontSize(14);
    doc.text("Magnimont", 10, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text("March 30, 2025", 10, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.text(essayText, 10, yPos, { maxWidth: 180 });


    doc.save(`Quotation_Proposal_${clientName}.pdf`);
}


document.getElementById('generateButton').addEventListener('click', generateEssayReport);
document.querySelectorAll('input').forEach(input => input.addEventListener('change', updateCostDisplay));


updateCostDisplay();
