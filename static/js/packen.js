document.addEventListener('DOMContentLoaded', function () {
    // Variables
    const sendNrInput = document.getElementById('SendNr');
    const submitButton = document.querySelector('button[type="submit"]');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const table = $('#table').DataTable(); // Initialize DataTable instance

    // Function to check if a row is selected
    function isRowSelected() {
        return [...checkboxes].some(checkbox => checkbox.checked);
    }

    // Function to display an error popup
    function showError(message) {
        alert(message); // You can replace this with a more advanced modal or popup system if needed
    }

    // Function to generate a unique Rechnungsnummer based on the current timestamp
    function generateRechnungsnummer() {
        const now = new Date();
        const timestamp = now.getTime(); // Get timestamp in milliseconds
        return 'RN-' + timestamp; // Example: 'RN-1631778259000'
    }

    // Function to send selected rows to the backend
    async function sendRowsToBackend(rows) {
        try {
            const response = await fetch('/api/send-bestellungen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rows)
            });

            if (!response.ok) {
                throw new Error('Fehler beim Senden der Daten.');
            }

            const result = await response.json();
            console.log('Daten erfolgreich an den Backend gesendet:', result);
        } catch (error) {
            showError(error.message);
        }
    }

    // Submit Button Event Listener
    submitButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission

        const sendNrValue = sendNrInput.value.trim();

        // Check if a row is selected
        if (!isRowSelected()) {
            showError('Bitte wählen Sie mindestens eine Zeile aus.');
            return;
        }

        // Check if Send-Nr is provided
        if (!sendNrValue) {
            showError('Bitte geben Sie die Sendungsnummer ein.');
            return;
        }

        // Collect selected rows data and remove from the table
        const selectedRowsData = [];
        checkboxes.forEach(function (checkbox, index) {
            if (checkbox.checked) {
                // Find the selected row in the DataTable
                const row = checkbox.closest('tr');
                const rowData = table.row(row).data(); // Fetch DataTable row data
                
                // Generate a unique Rechnungsnummer for each row
                const rechNr = generateRechnungsnummer();

                // Push the row data to the array, including the generated Rechnungsnummer
                selectedRowsData.push({
                    bestNr: rowData[1],
                    name: rowData[2],
                    adresseStr: rowData[3],
                    plz: rowData[4],
                    ort: rowData[5],
                    land: rowData[6],
                    email: rowData[7],
                    artNr: rowData[8],
                    artBez: rowData[9],
                    charge: rowData[10],
                    menge: rowData[11],
                    preisStk: rowData[12],
                    bezMeth: rowData[13],
                    sendNr: sendNrValue,
                    rechNr: rechNr // Include Rechnungsnummer in the row data
                });

                // Remove the row from DataTable
                table.row(row).remove().draw(); // Remove and redraw the table
            }
        });

        // Send the selected rows to the backend (when ready)
        // sendRowsToBackend(selectedRowsData);

        // Clear the Send-Nr. input after injection
        sendNrInput.value = '';

        // Uncheck all the checkboxes after submission
        checkboxes.forEach(checkbox => checkbox.checked = false);

        // Use the console log to view the data you would have sent to the backend
        console.log('Selected rows data with Rechnungsnummer:', selectedRowsData);
    });
});
