 
$(document).ready(function(){
    $('#editModal{{ complete_on_site.id }}').on('show.bs.modal', function (event) {
      var link = $(event.relatedTarget) // Link that triggered the modal
      var item = link.data('item') // Extract info from data-* attributes
      var complete_on_site = link.data('complete-on-site') // Extract complete_on_site from data-* attributes
      var working_budget = link.data('working-budget').replace(/,/g, '');  // Remove commas before parsing
      var modal = $(this)
      modal.find('.modal-title').text(item)
      modal.find('.complete-on-site-input').val(complete_on_site)
      modal.find('.original-complete-on-site').text(complete_on_site)
      modal.find('.working-budget-fixed').text(working_budget);  // Display the 'Working Budget' in the modal
  
      // Calculate the initial value of 'completed-percent-live'
      var completed_percent_live = parseFloat(complete_on_site)/parseFloat(working_budget) ;
      modal.find('.completed-percent-live').text(completed_percent_live);
  
      // Add an event listener for the 'input' event on the 'complete-on-site-input' field
      modal.find('.complete-on-site-input').on('input', function() {
        // When the user changes the value of the input field, recalculate 'completed-percent-live'
        var new_complete_on_site = $(this).val();
        var new_completed_percent_live = parseFloat(new_complete_on_site)/parseFloat(working_budget);
        modal.find('.completed-percent-live').text(new_completed_percent_live.toFixed(2) + '%');
      });
    })
  })
  
  $(document).ready(function(){
    $('.save-costs-specific').click(function(){
      var modal = $(this).closest('.modal');
      var item = modal.find('.modal-title').text();
      var complete_on_site = modal.find('.complete-on-site-input').val();
      $.ajax({
        url: 'contract_admin/update_complete_on_site/',  // Update this to the correct URL
        type: 'POST',
        data: {
          'item': item,
          'complete_on_site': complete_on_site,
          'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(response){
          if(response.status == 'success'){
            modal.modal('hide');  // Close the modal
            location.reload();  // Refresh the page
          } else {
            // Handle error here
          }
        }
      });
    });
  });
  
    $(document).ready(function() {
        $('#id_csv_file').on('change', function() {
            var form = $('#upload-form')[0];
            var formData = new FormData(form);
            $.ajax({
                url: '/contract_admin/upload_csv/',  // replace with your actual endpoint
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    alert('CSV file uploaded successfully');
                    location.reload();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                  alert(jqXHR.responseJSON.message);
                  location.reload();
                }
            });
        });
    });
  
  $(document).ready(function() {
    $('#uploadButton').on('click', function() {
        $('#csvFile').click();
    });
  
    $('#csvFile').on('change', function() {
        var formData = new FormData();
        formData.append('csv_file', this.files[0]);
  
        $.ajax({
            url: '/contract_admin/upload_categories/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('CSV file uploaded successfully');
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseJSON.message);
                location.reload();
            }
        });
    });
  });
  
  
  //send uncommitted costs to DB
  $('.save-costs').click(function() {
      var costingId = $(this).data('id');  // Get the costing id from the data-id attribute
      var newUncommittedValue = $('#uncommittedInput' + costingId).val();  // Get the new uncommitted value from the input field
  
      // Send an AJAX request to the server
      $.ajax({
          url: '/contract_admin/update-costing/',
          type: 'POST',
          data: {
              'costing_id': costingId,
              'uncommitted': newUncommittedValue
          },
          success: function(response) {
              // Close the modal
              $('#editModal' + costingId).modal('hide');
  
              // Refresh the page
              location.reload();
          }
      });
  });

// Create a new div element
var newDiv = document.createElement("div");

// Set the innerHTML of the div
newDiv.innerHTML = `
<div class="modal fade" id="committedQuotesModal" tabindex="-1" role="dialog" aria-labelledby="committedQuotesModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="committedQuotesModalLabel">Committed Quotes</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <table id="committedQuotesTable" class="table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Supplier</th>
              <th>Total Cost</th>
              <th rowspan="2" class="delete-cell-header delete-column">Delete</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows will be inserted here -->
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;
// Append the new div to the body
document.body.appendChild(newDiv);
// Add event listener to the button
document.getElementById('committedQuotesBtn').addEventListener('click', function() {
    $('#committedQuotesModal').modal('show');
});
// Get the table body
var tableBody = document.querySelector("#committedQuotesTable tbody");
// Loop through each committed quote
$(document).ready(function() {
    $('.modal-footer .btn-secondary').on('click', function() {
        location.reload();
    });
});

committedQuotes.forEach(function(quote) {
    // Format total_cost with thousands separator
    var quote_id = quote.pk;
    var totalCostFormatted = parseFloat(quote.fields.total_cost).toLocaleString();
    var supplier = quote.fields.supplier;
    // Create a new table row for each quote
    var newRow = document.createElement("tr");
    newRow.innerHTML = `<td><a href="#" class="quote-link">${quote.pk}</a></td><td>${supplier}</td><td>${totalCostFormatted}</td><td class="delete-column"><button class="btn btn-danger delete-btn">X</button></td>`;
    // Append the table row to the table body
    tableBody.appendChild(newRow);
        // Add event listener to the delete button
        newRow.children[3].children[0].addEventListener('click', function(event) {
        event.preventDefault();
        var confirmed = window.confirm('Are you sure you want to delete this quote?');
        if (confirmed) {
            // Send delete request to the server
            fetch('contract_admin/delete_quote/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: quote.pk,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Remove the row from the table
                    newRow.remove();
                } else {
                    window.alert('Failed to delete quote: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
    // Add event listener to the 'Quote #' cell
    newRow.children[0].addEventListener('click', function() {
    // Get the quote data
    var quote = committedQuotes.find(q => q.pk == this.textContent);
    var allocations = committed_allocations.filter(a => a.fields.quote === quote.pk);
    var totalCost = parseFloat(totalCostFormatted.replace(/,/g, ''));
    // Open the modal
    $('#committedQuotesModal').modal('hide');
    // Pass the PDF data and supplier to the displayCombinedModal function
    displayCombinedModal(quote.fields.pdf, quote_id, supplier, totalCost, allocations, true);
    });
});

function populateModal(quoteNumber) {
    console.log(committed_allocations);
    // Retrieve the corresponding Committed_quotes and Committed_allocations data
    var quote = committedQuotes.find(q => q.pk === quoteNumber);
    var allocations = committed_allocations.filter(a => a.fields.quote === quoteNumber);
    // Populate the modal fields with this data
    document.getElementById('supplierInput').value = quote.fields.supplier;
    document.getElementById('totalCostInput').value = quote.fields.total_cost;
    allocations.forEach(function(allocation) {
        addLineItem(allocation.fields.item, allocation.fields.amount);
    });
    // Open the modaly
    $('#combinedModal').modal('show');
}