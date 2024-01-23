document.addEventListener('DOMContentLoaded', (event) => {
    var totalsElement = document.getElementById('totals-data');
    var totals = JSON.parse(totalsElement.textContent);

    var A = parseFloat(totals.total_contract_budget);
    var B = parseFloat(totals.total_forecast_budget);
    var C = parseFloat(totals.total_sc_paid);
    var D = parseFloat(totals.total_hc_received);

    var cash_projection = A - B + C - D;

    // Format cash_projection with thousands separators
    var formatted_cash_projection = cash_projection.toLocaleString();

    // Get the HTML element with the id "cash-projection"
    var cashProjectionElement = document.getElementById('cash-projection');

    // Display the result in the HTML element
    cashProjectionElement.textContent = formatted_cash_projection;

    // Add conditional formatting
    if (cash_projection < 0) {
        cashProjectionElement.style.backgroundColor = '#FFCCCC'; // Use a color from the red part of your gradient
    } else if (cash_projection > 0) {
        cashProjectionElement.style.backgroundColor = '#CCFFCC'; // Use a color from the green part of your gradient
    }
});

document.getElementById('arrow').addEventListener('click', function() {
    var table = document.getElementById('metrics-table');
    if (table.style.display === "none") {
        table.style.display = "block";
        this.textContent = "▼";
    } else {
        table.style.display = "none";
        this.textContent = "►"; // Right pointing arrow symbol
    }
});