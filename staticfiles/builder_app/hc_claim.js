document.addEventListener('DOMContentLoaded', function() {
function showHcClaimModal(costingsX) {
    var tableRows = costingsX.map(function(costing, index) {
        var numerator = Number(costing.contract_budget) * Number(costing.already_claimed);
        var denominator = Number(costing.uncommitted) + Number(costing.committed);
        var generated_claim = denominator === 0 ? 0.00 : numerator / denominator;
        return `
        <tr>
            <td>
                ${costing.item}
                <input type="hidden" value="${costing.id}" class="costing-id">
            </td>
            <td>${denominator.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${Number(costing.already_claimed).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td id="generated${index}">${isNaN(generated_claim) ? 'N/A' : generated_claim.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td><input type="number" id="input${index}" step="0.01" max="9999999999" style="width: 100%;"></td>
            <td id="output${index}">${isNaN(generated_claim) ? 'N/A' : generated_claim.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        `;
    }).join('');
        // Add total row calculation here
        var totalWorkingBudget = costingsX.reduce(function(sum, costing) {
            return sum + Number(costing.uncommitted) + Number(costing.committed);
        }, 0);
    
        var totalAlreadyClaimed = costingsX.reduce(function(sum, costing) {
            return sum + Number(costing.already_claimed);
        }, 0);
    
        var totalGeneratedClaim = costingsX.reduce(function(sum, costing) {
            var denominator = Number(costing.uncommitted) + Number(costing.committed);
            var generated_claim = denominator === 0 ? 0.00 : (Number(costing.contract_budget) * Number(costing.already_claimed)) / denominator;
            return sum + (isNaN(generated_claim) ? 0 : generated_claim);
        }, 0);
    
        var totalAdjustment = costingsX.reduce(function(sum, costing, index) {
            var inputElement = document.getElementById(`input${index}`);
            var adjustment = inputElement ? Number(inputElement.value) : 0;
            return sum + (isNaN(adjustment) ? 0 : adjustment);
        }, 0);
    
        var totalOutput = totalGeneratedClaim + totalAdjustment;
    
        tableRows += `
        <tr>
            <td>Total</td>
            <td>${totalWorkingBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${totalAlreadyClaimed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td id="totalGenerated">${totalGeneratedClaim.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td id="totalAdjustment">${totalAdjustment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td id="totalOutput">${totalOutput.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        `;

    var modalHtml = `
    <div class="modal fade" id="hcClaimModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">HC Claim</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table>
                            <tr>
                                <th>Item</th>
                                <th>Working Budget</th>
                                <th>Already Claimed</th>
                                <th>Generated claim</th>
                                <th>Adjustment</th>
                                <th>Total</th>
                            </tr>
                            ${tableRows}
                        </table>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="button" class="btn btn-primary" id="saveButton">Save</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Append the modal to the body
    $('body').append(modalHtml);

    // Show the modal
    $('#hcClaimModal').modal('show');

    // Remove the modal when it's hidden
    $('#hcClaimModal').on('hidden.bs.modal', function () {
      $(this).remove();
    });

    // Add event listeners to update the fourth column when the input field changes
    costingsX.forEach(function(_, index) {
        document.getElementById(`input${index}`).addEventListener('input', function() {
            var inputValue = Number(this.value);
            var generatedClaim = Number(document.getElementById(`generated${index}`).textContent.replace(/,/g, ''));
            var outputValue = inputValue + generatedClaim;

            document.getElementById(`output${index}`).textContent = outputValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

            // Update total values
            totalAdjustment += inputValue;
            totalOutput += outputValue;

            document.getElementById('totalAdjustment').textContent = totalAdjustment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById('totalOutput').textContent = totalOutput.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        });
    });
    document.getElementById('saveButton').addEventListener('click', function() {
        var data = gatherData();
        postData('/contract_admin/commit_hc_claim/', { data: data })
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

//make the super array
var hc_claimed_array = JSON.parse(hc_claimed);
var costingsX = costings.map(function(costing) {
    var matchingHcClaimed = hc_claimed_array.find(function(claim) {
        return claim.id === costing.id;
    });
    return {
        ...costing,
        already_claimed: matchingHcClaimed ? matchingHcClaimed.amount : 0.00
    };
});

$(document).on('click', '#hcMakeClaim', function(){
    console.log(Array.isArray(hc_claimed_array)); // This will output either true (if hc_claimed_array is an array) or false (if it is not)
    // console.log(hc_claimed_array);
    console.log(hc_claimed_array);
    console.log("here comes costingsX");
    console.log(costingsX);
    showHcClaimModal(costingsX);
});

var data = gatherData();
// Check if data is valid
if (data.someField === "" || isNaN(Number(data.someField))) {
    console.error('Invalid data:', data);
} else {
    postData('/contract_admin/commit_hc_claim/', { data: data })
    .then(data => console.log(data))
    .catch((error) => {
        console.error('Error:', error);
    });
}

function postData(url = '', data = {}) {
    return fetch(url, {
        method: 'POST', // Make sure this is 'POST'
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
}

});