var total_claims_array=[];

document.addEventListener('DOMContentLoaded', function() {

    // Create the modal
    var modal = document.createElement('div');
    modal.innerHTML = `
    <div id="myModal" style="display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
        <div style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%;">
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="height: 20px; position: sticky; top: 0;">
                        <th style="position: sticky; top: 20px;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <button id="closeModalBtn">Close</button>
        </div>
    </div>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Get the modal
    var myModal = document.getElementById("myModal");

    // Show the modal when the button is clicked
    document.getElementById("committedClaimBtn").addEventListener('click', function() {
        myModal.style.display = "block";
    });

    // Close the modal when the close button is clicked
    document.getElementById("closeModalBtn").addEventListener('click', function() {
        myModal.style.display = "none";
    });

    // New Claim Button PDF upload
    document.getElementById('newClaimBtn').addEventListener('click', function() {
        document.getElementById('newClaimPdfInput').click();
    });

    // Handler for file input change event
    document.getElementById('newClaimPdfInput').addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var pdfData = e.target.result;
                // Call the allocateClaimModal function
                allocateClaimModal(pdfData);
            };
            reader.readAsDataURL(file);
        }
    });

// Function to update still_to_allocate
function updateStA() {
    var totalCost = parseFloat(document.getElementById('totalCost').value);
    totalCost = isNaN(totalCost) ? 0 : totalCost;
    var sta_value;
    var current_allocation = 0;
    var amounts = document.getElementsByClassName('amount');
    for (var i = 0; i < amounts.length; i++) {
        var value = parseFloat(amounts[i].value.replace(/,/g, ''));
        value = isNaN(value) ? 0 : value;
        current_allocation += value;
    }
    sta_value = totalCost - current_allocation;
    document.getElementById('stillToAllocateValue').innerHTML = sta_value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    updateLineTotalClaims();
}

function updateLineTotalClaims() {
    var table = document.getElementById('lineItemsTable');
    console.log("here comes the total claims array");
    console.log(total_claims_array);
    for (var i = 2, row; i < table.rows.length - 1; i++) {
        row = table.rows[i];
        var thisClaim = row.cells[3] && row.cells[3].children[0] ? parseFloat(row.cells[3].children[0].value) || 0 : 0;
        var totalClaimsArrayValue = parseFloat(total_claims_array[i-2]) || 0;
        console.log('Row index:', i, 'Total claims array value:', totalClaimsArrayValue, 'This claim:', thisClaim);
        // Check if row.cells[2] exists before trying to set its textContent
        if (row.cells[2]) {
            console.log('Before update:', row.cells[2].textContent);
            row.cells[2].textContent = (totalClaimsArrayValue + thisClaim).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            console.log('After update:', row.cells[2].textContent);
        }
    }
}

function allocateClaimModal(pdfFilename, quote_id, supplier, totalCost, allocations, updating = false) {
    var pdfUrl;
    console.log("Test Point 1");
    console.log(committed_allocations);
    // let bh_test = committed_allocations.filter(allocation => allocation.pk % 2 === 0);
    // console.log(bh_test);
    // Create options for the select element
    var supplierOptions = committedQuotes.map(function(quote) {
        // Ensure the supplier property exists
        if (quote.fields && quote.fields.supplier) {
            return `<option value="${quote.fields.supplier}">${quote.fields.supplier}</option>`;
        }
    }).join('\n');
    if (arguments.length === 1) {
        // If only one argument is passed, it's pdfData
        pdfUrl = pdfFilename;  // In this case, pdfFilename is actually pdfData
        quote_id=""
        supplier = "";
        totalCost = 0.00;
        allocations = [];
    } else {
        // If four arguments are passed, it's pdfFilename, supplier, totalCost, allocations
        pdfUrl = '/media/' + pdfFilename.replace('pdfs/', '');
    }
    var combinedModalHTML = `
        <div id="combinedModal" style="display: flex;">
        <div class="pdf-viewer" style="width: 40%;">
            <iframe src="${pdfUrl}" class="pdf-frame"></iframe>
        </div>
        <div class="cost-details" style="width: 60%;">
            <h2>Commit Costs</h2>
            <div class="input-field">
                <label for="claim_supplier">Supplier:</label>
                <select id="claim_supplier">
                    <option value="">Select a supplier</option>
                    ${supplierOptions}
                </select>
            </div>
            <div class="input-field">
                <label for="totalCost">Total Cost:</label>
                <input type="number" id="totalCost" step="0.01" placeholder="0.00" class="total-cost-input" value="${totalCost}">
            </div>
            <h3>Line Items123</h3>
            <table id="lineItemsTable" style="table-layout: fixed;">
            <thead>
                <tr>
                    <th rowspan="2" style="width: 22%;">Item</th>
                    <th colspan="3" style="width: 26%;">Quote 1</th>
                </tr>
                <tr>
                    <th style="width: 10%;">Quote Amount</th>
                    <th style="width: 15%;">Total Claims</th>
                    <th style="width: 10%;">This Claim</th>
                </tr>
            </thead>
            <tbody id="lineItemsBody">
                <!-- Rows will be added here -->
            </tbody>
        </table>
        <button id="addRowButton">+ not working yet</button>
            <button id="closeBtn">Close</button>
            <button id="claimBtn" style="float: right; display: ${updating ? 'none' : 'inline-block'};">Claim</button>
            <button id="updateBtn" style="float: right; display: ${updating ? 'inline-block' : 'none'};">Update</button>
            </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', combinedModalHTML);
    // var allocationsArray = JSON.parse(unescapedString.trim());    
    var allocationsArray = committed_allocations;
    var quotesArray = committedQuotes;  // Assuming this is your array of quotes
    console.log(typeof allocationsArray);  // Should log 'object'
    console.log(typeof quotesArray);  // Should log 'object'
    console.log(Array.isArray(allocationsArray));  // Should log true
    console.log(Array.isArray(quotesArray));  // Should log true
    document.getElementById('claim_supplier').addEventListener('change', function() {
        console.log("Test Point 2");
        var selectedSupplier = this.value;
        // Filter the allocations for the selected supplier
        console.log(allocationsArray);  // Add this line
        console.log(quotesArray);  // Add this line
        var selectedAllocations = allocationsArray.filter(function(allocation) {
            var correspondingQuote = quotesArray.find(quote => quote.pk === allocation.fields.quote);
            return correspondingQuote && correspondingQuote.fields.supplier === selectedSupplier;
        });
        console.log(selectedAllocations);  // Log the output of the filter operation

        if (selectedAllocations.length > 0) {
            // Map the selected allocations to create the table rows
            var tableRows = selectedAllocations.map(function(allocation, index) {
                var amount = Number(allocation.fields.amount);
                var correspondingQuote = quotesArray.find(quote => quote.pk === allocation.fields.quote);
                var quoteValue = correspondingQuote ? correspondingQuote.pk : 'N/A';  // If correspondingQuote is found, quoteValue is set to quote.pk. Otherwise, it's set to 'N/A'
                // Filter the claim_allocations array
                console.log("about to display claim_allocations");
                console.log(claim_allocations);

                var matchingAllocations = claim_allocations.filter(function(alloc) {
                    return alloc.fields.associated_quote == quoteValue && alloc.fields.item == allocation.fields.item;
                });
                // Calculate the sum
                var sum = matchingAllocations.reduce(function(total, alloc) {
                    return total + Number(alloc.fields.amount);
                }, 0);
                var total_claims_cell = sum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                total_claims_array.push(total_claims_cell);
                return `
                <tr>
                    <td>${allocation.fields.item}</td>
                    <td id="amount-${index}">${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td id="sum-${index}">
                        <input type="hidden" class="quoteValue" value="${quoteValue}">
                        ${total_claims_cell}  <!-- Display the calculated sum -->
                    </td>
                    <td>
                        <input type="number" class="amount" id="amount-input-${index}" step="0.01" value="0.00" style="width: 100%; box-sizing: border-box;">
                    </td>
                </tr>
                `;
            }).join('');
            // Append the claim_allocation_data row to tableRows
            tableRows += `
            <tr id="claim_allocation_data">
                <td colspan="3"><strong>Still to Allocate<strong></td>
                <td id="stillToAllocateValue">0.00</td>
            </tr>
            `;
            console.log(total_claims_array);
            // Insert the table rows into the table
            document.getElementById('lineItemsBody').innerHTML = tableRows;
            // Call the updateStA function
            // updateStA();
        }
        // Event listener to update Still to Allocate from totalcost change
        document.getElementById('totalCost').addEventListener('input', updateStA);
        Array.from(document.getElementsByClassName('amount')).forEach(el => el.addEventListener('input', updateStA));
    });

    document.getElementById('closeBtn').addEventListener('click', function() {
        var modal = document.getElementById('combinedModal');
        modal.parentNode.removeChild(modal);
        // Reset the file input
        document.getElementById('newClaimPdfInput').value = '';
    });
    // Add event listener to the 'add row' button
    // document.getElementById('addRowButton').addEventListener('click', function() {
    //     addLineItem();
    //     updateStAValue();
    // });
    // For each allocation, add a row to the table
    // allocations.forEach(function(allocation) {
    //     addLineItem(allocation.fields.item, allocation.fields.amount);
    // });
    // Set the default value of the 'total cost' input to 0.00
    document.getElementById('claimBtn').addEventListener('click', function() {
        console.log('Claim button clicked');
        var data = gatherAllocationsData();
        console.log(data);
        if (!data) return;
        fetch('/contract_admin/commit_claim_data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        }).then(function(response) {
            if (response.ok) {
                alert('Claim committed successfully.');
                location.reload();
            } else {
                alert('An error occurred.');
            }
        });
    });

}

    // var totalCostInput = document.getElementById('totalCost');
    // Add event listener to the 'total cost' input field
    // totalCostInput.addEventListener('input', update_still_to_allocate_value);
    // Set up 'close' button event listener


function gatherAllocationsData() {
    // Get all rows in the table except for the last one
    var rows = Array.from(document.querySelectorAll('#lineItemsTable tr:not(:last-child)'));
    // Map the rows to objects containing the item, amount
    var allocations = rows.map(function(row) {
        var cells = row.querySelectorAll('td');
        if (!cells[0]) return null;
        var item = cells[0].textContent;
        var amount = Number(cells[3].querySelector('.amount').value);
        var associated_quote = cells[2].querySelector('.quoteValue').value;
        return { item: item, amount: amount, associated_quote: associated_quote };
    }).filter(Boolean);  // This will remove null values from the array
    // Calculate the total allocated amount
    var totalAllocated = allocations.reduce(function(total, allocation) {
        return total + allocation.amount;
    }, 0);

    // Get the total cost
    var totalCost = Number(document.getElementById('totalCost').value);

    // Check if the total cost equals the total allocated
    if (totalCost !== totalAllocated) {
        alert('Total Cost does not equal Total Allocated');
        return null;
    }
    // Get the supplier name
    var supplier = document.getElementById('claim_supplier').value;  // Adjust this to match your actual HTML structure
    // Check if the supplier name is empty
    if (supplier === '') {
        alert('Need to input Supplier Name');
        return null;
    }

    // Get the PDF data
    var pdfData = document.querySelector('.pdf-frame').src;  // Adjust this to match your actual HTML structure

    return { total_cost: totalCost, pdf: pdfData, allocations: allocations };
}


});