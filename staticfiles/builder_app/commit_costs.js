var itemsData = JSON.parse(document.getElementById('items-data').textContent);

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('commitCostsBtn').addEventListener('click', function() {
        document.getElementById('pdfInput').click();
    });
    // Handler for file input change event
    document.getElementById('pdfInput').addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var pdfData = e.target.result;
                displayCombinedModal(pdfData);
            };
            reader.readAsDataURL(file);
        }
    });
});

function displayCombinedModal(pdfFilename, quote_id, supplier, totalCost, allocations, updating = false) {
    var pdfUrl;
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
                <label for="supplier">Supplier:</label>
                <input type="text" id="supplier" maxlength="100" placeholder="" value="${supplier}">
            </div>
            <div class="input-field">
                <label for="totalCost">Total Cost:</label>
                <input type="number" id="totalCost" step="0.01" placeholder="0.00" class="total-cost-input" value="${totalCost}">
            </div>
            <h3>Line Items</h3>
            <table id="lineItemsTable" style="table-layout: fixed;">
            <thead>
                <tr>
                    <th rowspan="2" style="width: 19%;">Item</th>
                    <th colspan="2" style="width: 19%;">Uncommitted</th>
                    <th colspan="2" style="width: 19%;">Committed</th>
                    <th rowspan="2" style="width: 19%;">Total</th>
                    <th rowspan="2" style="width: 19%;">Description</th>
                    <th rowspan="2" class="delete-cell-header" style="width: 5%;"></th>
                </tr>
                <tr>
                    <th style="width: 10%;">Old</th>
                    <th style="width: 15%;">New</th>
                    <th style="width: 10%;">Total</th>
                    <th style="width: 15%;">This Invoice</th>
                </tr>
            </thead>
            <tbody>
                <!-- Rows will be added here -->
                <tr id="stillToAllocateRow">
                    <td colspan="6">Still to Allocate</td>
                    <td id="stillToAllocateValue">0.00</td>
                </tr>
            </tbody>
        </table>
        <button id="addRowButton">+</button>
            <button id="closeBtn">Close</button>
            <button id="commitBtn" style="float: right; display: ${updating ? 'none' : 'inline-block'};">Commit</button>
            <button id="updateBtn" style="float: right; display: ${updating ? 'inline-block' : 'none'};">Update</button>
            </div>
    </div>
    `;
    // Create a new div and set its innerHTML to the modal HTML
    var modalDiv = document.createElement('div');
    modalDiv.innerHTML = combinedModalHTML;
    document.body.appendChild(modalDiv);
    // Add event listener to the 'add row' button
    document.getElementById('addRowButton').addEventListener('click', function() {
        addLineItem();
        updateStillToAllocateValue();
    });
    // For each allocation, add a row to the table
    allocations.forEach(function(allocation) {
        addLineItem(allocation.fields.item, allocation.fields.amount);
    });
    // Set the default value of the 'total cost' input to 0.00
    var totalCostInput = document.getElementById('totalCost');
    // Add event listener to the 'total cost' input field
    totalCostInput.addEventListener('input', updateStillToAllocateValue);
    // Set up 'close' button event listener
    document.getElementById('closeBtn').addEventListener('click', function() {
    var modal = document.getElementById('combinedModal');
    modal.parentNode.removeChild(modal);
    // Reset the file input
    document.getElementById('pdfInput').value = '';
});



function gatherData() {
    var totalCost = parseFloat(document.getElementById('totalCost').value);
    totalCost = isNaN(totalCost) ? 0 : totalCost;
    var allocated = 0;
    var supplier = document.getElementById('supplier').value;
    var tableBody = document.getElementById('lineItemsTable').tBodies[0];
    for (var i = 0; i < tableBody.rows.length - 1; i++) {
        var cellValue = parseFloat(tableBody.rows[i].cells[4].firstChild.value.replace(/,/g, ''));
        cellValue = isNaN(cellValue) ? 0 : cellValue;
        allocated += cellValue;
    }
    if (totalCost !== allocated) {
        alert('Total Cost does not equal Total Allocated');
        return null;
    }
    if (supplier === '') {
        alert('Need to input Supplier Name');
        return null;
    }
    // Populate the lineItemsTable with the current allocations
    var allocations = Array.from(lineItemsTable.rows).slice(1, -1).map(function(row) {
        var selectElement = row.cells[0].querySelector('select');
        if (selectElement) {
            var amountInput = row.cells[4].querySelector('input');
            var amount = amountInput ? amountInput.value : '';
            var uncommittedInput = row.cells[2].querySelector('input');
            var uncommitted = uncommittedInput ? uncommittedInput.value : '';
            var descriptionInput = row.cells[6].querySelector('input');   
            var description = descriptionInput ? descriptionInput.value : '';
            console.log("here comes the description");
            console.log(description);
            return {
                item: selectElement.value,
                amount: amount,
                uncommitted: uncommitted, // Include the uncommitted value in the allocation
                description: description
            };
        } else {
            return null;
        }
    }).filter(function(item) {
        return item !== null;
    });
    var data = {
        total_cost: totalCost,
        supplier: supplier,
        allocations: allocations
    };
    if (quote_id) {
        data.quote_id = quote_id;
    }
    return data;
}

document.getElementById('commitBtn').addEventListener('click', function() {
    var data = gatherData();
    console.log(data)
    if (!data) return;
    data.pdf = document.querySelector('.pdf-frame').src;
    fetch('/contract_admin/commit_data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    }).then(function(response) {
        if (response.ok) {
            alert('Costs uploaded successfully.');
            location.reload();
        } else {
            alert('An error occurred.');
        }
    });
});

document.getElementById('updateBtn').addEventListener('click', function() {
    var data = gatherData(quote_id);  // Pass quote_id here
    console.log(data)
    if (!data) return;
    fetch('/contract_admin/update_quote/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    }).then(function(response) {
        if (response.ok) {
            alert('Costs updated successfully.');
            location.reload();
        } else {
            alert('An error occurred.');
        }
    });
});

}

function addLineItem(item, amount) {
    // Get the table body element, create a new row and add cells to it
    var tableBody = document.getElementById('lineItemsTable').tBodies[0];
    var newRow = document.createElement('tr');
    // Create a dropdown list for the first cell
    var select = document.createElement('select');
    select.style.maxWidth = "100%";
    select.innerHTML = '<option value="">Select an item</option>';  // Default option
    itemsData.forEach(function(item) {
        select.innerHTML += '<option value="' + item.item + '">' + item.item + '</option>';
    });
    var firstCell = newRow.insertCell(0);
    firstCell.appendChild(select);
    // Create the remaining cells
    for (var i = 1; i < 8; i++) {
        var newCell = newRow.insertCell(i);
        if (i === 2 || i === 4) {
            var input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.style.width = '100%';
            newCell.appendChild(input);
            // Add an event listener to the input field
            input.addEventListener('input', updateStillToAllocateValue);
        } else if (i === 6) {
            var input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 100;
            input.style.width = '100%';
            newCell.appendChild(input);
        } else {
            newCell.innerHTML = '0';  // Default to 0
        }
    }
    // Create a cell for the delete button
    var deleteCell = newRow.insertCell(7);
    deleteCell.className = 'delete-cell';  // Add a CSS class to the cell
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.addEventListener('click', function() {
        newRow.remove();
    });
    deleteCell.appendChild(deleteButton);
        select.addEventListener('change', function() {
            var selectedItem = itemsData.find(function(item) {
                return item.item === this.value;
            }.bind(this));
            if (selectedItem) {
                var formattedUncommitted = parseFloat(selectedItem.uncommitted).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                newRow.cells[1].innerHTML = formattedUncommitted;
                newRow.cells[2].children[0].value = parseFloat(selectedItem.uncommitted).toFixed(2);
                var sum = parseFloat(newRow.cells[1].innerHTML.replace(/,/g, '')) + parseFloat(newRow.cells[3].innerHTML.replace(/,/g, ''));
                newRow.cells[5].innerHTML = (isNaN(sum) ? '0' : sum.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                updateStillToAllocateValue();
            }
        });
    // Set the select element's value to the item
    if (item) {
        select.value = item;
        // Trigger the change event
        var event = new Event('change');
        select.dispatchEvent(event);
    }
    // Set the input elements' values to the amount
    if (amount) {
        newRow.cells[4].children[0].value = amount;
    }
    // Add an event listener to the select element
    select.addEventListener('change', function() {
        var selectedItem = itemsData.find(function(item) {
            return item.item === this.value;
        }.bind(this));
        if (selectedItem) {
            var formattedUncommitted = parseFloat(selectedItem.uncommitted).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            newRow.cells[1].innerHTML = formattedUncommitted;
            newRow.cells[2].children[0].value = parseFloat(selectedItem.uncommitted).toFixed(2);
            var sum = parseFloat(newRow.cells[1].innerHTML.replace(/,/g, '')) + parseFloat(newRow.cells[3].innerHTML.replace(/,/g, ''));
            newRow.cells[5].innerHTML = (isNaN(sum) ? '0' : sum.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            updateStillToAllocateValue();
        }
    });
    // Get the 'Still to Allocate' row
    var stillToAllocateRow = document.getElementById('stillToAllocateRow');
    // Insert the new row before the 'Still to Allocate' row
    tableBody.insertBefore(newRow, stillToAllocateRow);
}

function updateStillToAllocateValue() {
    var totalCost = parseFloat(document.getElementById('totalCost').value);
    totalCost = isNaN(totalCost) ? 0 : totalCost;
    var allocated = 0;
    var tableBody = document.getElementById('lineItemsTable').tBodies[0];
    for (var i = 0; i < tableBody.rows.length - 1; i++) {  // Exclude the 'Still to Allocate' row
        var cellValue = parseFloat(tableBody.rows[i].cells[4].firstChild.value.replace(/,/g, ''));
        cellValue = isNaN(cellValue) ? 0 : cellValue;
        allocated += cellValue;
        // Add event listeners to cells[2] and cells[4]
        ['input', 'change'].forEach(function(evt) {
            tableBody.rows[i].cells[2].firstChild.addEventListener(evt, updateCellFive);
            tableBody.rows[i].cells[4].firstChild.addEventListener(evt, updateCellFive);
        });
    }
    var stillToAllocateValue = totalCost - allocated;
    document.getElementById('stillToAllocateValue').innerHTML = stillToAllocateValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to update 'total'[5]
function updateCellFive() {
    var row = this.parentNode.parentNode;
    var sum = parseFloat(row.cells[2].firstChild.value || 0) + parseFloat(row.cells[4].firstChild.value || 0);
    row.cells[5].innerHTML = (isNaN(sum) ? '0' : sum.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to close the modal
function closeModal() {
    var modal = document.getElementById('combinedModal');
    modal.parentNode.removeChild(modal);
    // Reset the file input
    document.getElementById('pdfInput').value = '';
}