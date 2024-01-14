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

function displayCombinedModal(pdfFilename, supplier, totalCost, allocations) {
    var pdfUrl = '/media/' + pdfFilename.replace('pdfs/', '');
    var combinedModalHTML = `
        <div id="combinedModal">
        <div class="pdf-viewer">
            <iframe src="${pdfUrl}" class="pdf-frame"></iframe>
        </div>
        <div class="cost-details">
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
            <table id="lineItemsTable">
                <thead>
                    <tr>
                        <th rowspan="2">Item</th>
                        <th colspan="2">Uncommitted</th>
                        <th colspan="2">Committed</th>
                        <th colspan="2">Total</th>
                    </tr>
                    <tr>
                        <th>Old</th>
                        <th>New</th>
                        <th>Total</th>
                        <th>This Invoice</th>
                        <th>Old</th>
                        <th>New</th>
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
            <button id="commitBtn" style="float: right;">Commit</button>
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
    totalCostInput.value = '0.00';
    // Add event listener to the 'total cost' input field
    totalCostInput.addEventListener('input', updateStillToAllocateValue);
    // Set up 'close' button event listener
    document.getElementById('closeBtn').addEventListener('click', function() {
    var modal = document.getElementById('combinedModal');
    modal.parentNode.removeChild(modal);
    // Reset the file input
    document.getElementById('pdfInput').value = '';
});

// Set up 'commit' button event listener
document.getElementById('commitBtn').addEventListener('click', function() {
    console.log('Commit button clicked');
    var totalCost = parseFloat(document.getElementById('totalCost').value);
    totalCost = isNaN(totalCost) ? 0 : totalCost;
    var allocated = 0;
    var supplier = document.getElementById('supplier').value;  // Get the value of the supplier field
    var tableBody = document.getElementById('lineItemsTable').tBodies[0];
    for (var i = 0; i < tableBody.rows.length - 1; i++) {  // Exclude the 'Still to Allocate' row
        var cellValue = parseFloat(tableBody.rows[i].cells[4].firstChild.value.replace(/,/g, ''));
        cellValue = isNaN(cellValue) ? 0 : cellValue;
        allocated += cellValue;
    }
    if (totalCost !== allocated) {
        alert('Total Cost does not equal Total Allocated');
        return;
    }
    if (supplier === '') {  // Check if the supplier field is blank
        alert('Need to input Supplier Name');
        return;
    }
    var pdfData = document.querySelector('.pdf-frame').src;
    var lineItems = Array.from(document.getElementById('lineItemsTable').rows).slice(1, -1).map(function(row) {
        var selectElement = row.cells[0].querySelector('select');
        if (selectElement) {
          var amountInput = row.cells[4].querySelector('input');
          var amount = amountInput ? amountInput.value : '';
          return {
              item: selectElement.value,
              amount: amount
              };
        } else {
            return null;
        }
    }).filter(function(item) {
        return item !== null;
    });

    var data = {
        total_cost: totalCost,
        pdf: pdfData,
        line_items: lineItems,
        supplier:  supplier
    };
    console.log(JSON.stringify(data));
      fetch('/contract_admin/commit_data/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')  // You need to include a function that gets the CSRF token
      },
      body: JSON.stringify(data)
    }).then(function(response) {
        console.log(response);
        if (response.ok) {
            alert('Data has been committed successfully.');
            closeModal();  // Close the modal
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
    select.innerHTML = '<option value="">Select an item</option>';  // Default option
    itemsData.forEach(function(item) {
        select.innerHTML += '<option value="' + item.item + '">' + item.item + '</option>';
    });
    var firstCell = newRow.insertCell(0);
    firstCell.appendChild(select);
    // Create the remaining cells
    for (var i = 1; i < 7; i++) {
        var newCell = newRow.insertCell(i);
        if (i === 2 || i === 4) {
            var input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.style.width = '100%';
            newCell.appendChild(input);
            // Add an event listener to the input field
            input.addEventListener('input', updateStillToAllocateValue);
        } else {
            newCell.innerHTML = '0';  // Default to 0
        }
    }
    // Set the select element's value to the item
    if (item) {
        select.value = item;
    }
    // Set the input elements' values to the amount
    if (amount) {
        newRow.cells[2].children[0].value = amount;
        newRow.cells[4].children[0].value = amount;
    }
      // Add an event listener to the select element
      select.addEventListener('change', function() {
          var selectedItem = itemsData.find(function(item) {
              return item.item === this.value;
          }.bind(this));
          if (selectedItem) {
              newRow.cells[1].innerHTML = parseFloat(selectedItem.uncommitted).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    }
    var stillToAllocateValue = totalCost - allocated;
    document.getElementById('stillToAllocateValue').innerHTML = stillToAllocateValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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