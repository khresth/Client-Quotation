function calculateQuotation() {
    let baseCosts = {
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
        hosting: 100
    };

    let totalCost = 0;
    document.querySelectorAll('input[name="projectType"]:checked').forEach((checkbox) => {
        totalCost += baseCosts[checkbox.value];
    });

    if (document.querySelector('input[name="clientType"]:checked').value === 'company') {
        totalCost *= 1.20;
    }

    if (document.querySelector('input[name="deadline"]:checked').value === 'tight') {
        totalCost *= 1.15;
    }

    if (document.getElementById('nda').checked) {
        totalCost *= 1.05;
    }
    if (document.getElementById('lteDiscount').checked) {
        totalCost *= 0.85;
    }

    document.getElementById('finalCost').innerText = totalCost.toFixed(2);
}
function printInvoice() {
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
        hosting: 100
    };

    const checkedTypes = document.querySelectorAll('input[name="projectType"]:checked');
    const clientType = document.querySelector('input[name="clientType"]:checked').value;
    const isCompany = clientType === "company";
    const ndaSelected = document.getElementById('nda').checked;
    const deadline = document.querySelector('input[name="deadline"]:checked').value;
    const lteDiscount = document.getElementById('lteDiscount').checked;

    let invoiceContent = "Service        Deadline       LTE Discount    Consultancy     NDA\n";
    invoiceContent += "---------------------------------------------------------------------\n";
    
    let totalCost = 0;

    checkedTypes.forEach((checkbox) => {
        const projectType = checkbox.value;
        let baseCost = baseCosts[projectType];
        totalCost += baseCost;

        const consultancyCost = isCompany ? (baseCost * 0.30).toFixed(2) : "n/a";
        const deadlineCost = deadline === 'tight' ? (baseCost * 0.15).toFixed(2) : 'n/a';
        const lteDiscountAmount = lteDiscount ? (baseCost * 0.15).toFixed(2) : 'n/a';
        const ndaCost = ndaSelected ? (baseCost * 0.05).toFixed(2) : 'n/a';

        invoiceContent += `${projectType.padEnd(16)} ${deadlineCost.padEnd(14)} ${lteDiscountAmount.padEnd(14)} ${consultancyCost.padEnd(16)} ${ndaCost.padEnd(10)}\n`;
    });

    if (isCompany) totalCost *= 1.30;
    if (deadline === 'tight') totalCost *= 1.15;
    if (ndaSelected) totalCost *= 1.05;
    if (lteDiscount) totalCost *= 0.85;

    const upfrontPayment = (totalCost * 0.40).toFixed(2);
    const firstMilestone = (totalCost * 0.10).toFixed(2);
    const secondMilestone = (totalCost * 0.25).toFixed(2);
    const finalPayment = (totalCost * 0.25).toFixed(2);

    invoiceContent += `\nTotal Cost: $${totalCost.toFixed(2)}\n`;
    invoiceContent += `\nPayment Terms:\n`;
    invoiceContent += `40% upfront payment upon signing the contract: $${upfrontPayment}\n`;
    invoiceContent += `10% upon completion of the first milestone: $${firstMilestone}\n`;
    invoiceContent += `25% upon completion of the second milestone: $${secondMilestone}\n`;
    invoiceContent += `25% upon final delivery and client approval: $${finalPayment}\n`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoice.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
