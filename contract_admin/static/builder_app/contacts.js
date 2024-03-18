document.addEventListener('DOMContentLoaded', function() {
function showContactsModal(contacts) {
    var tableRows = contacts.map(function(contact) {
        return `
        <tr>
            <td>${contact.contact_name}</td>
            <td><input type="checkbox" class="selectable-checkbox" ${contact.contact_selectable == 1 ? 'checked' : ''}></td>
            <input type="hidden" value="${contact.contact_id}" class="contact-id">
        </tr>
        `;
    }).join('');

    var tableHTML = `
    <table>
        <thead>
            <tr>
                <th>Contact</th>
                <th>Selectable</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    <button id="addContactButton">+</button>
    `;

    // Assuming you have a modal with an element to hold the table
    var modalHtml = `
    <div class="modal fade" id="contactsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document" style="max-width: 500px;">
            <div class="modal-content" style="border: 3px solid black;">
                <div class="modal-header" style="text-align: center; background: linear-gradient(45deg, #A090D0 0%, #B3E1DD 100%);">
                    <h5 class="modal-title">Contacts</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table>
                            ${tableHTML}
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Append the modal to the body
    $('body').append(modalHtml);

    // Show the modal
    $('#contactsModal').modal('show');

    // Remove the modal when it's hidden
    $('#contactsModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });

    // Add event listener to '+' button
    document.getElementById('addContactButton').addEventListener('click', function() {
        // Code to show modal for creating new supplier goes here
    });
}

$(document).on('click', '#showContactsLink', function(event){
    event.preventDefault();
    showContactsModal(contacts);
});
});