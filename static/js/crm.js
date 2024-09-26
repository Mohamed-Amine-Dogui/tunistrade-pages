// crm.js
document.addEventListener('DOMContentLoaded', function () {

    // Initialize DataTable with German language and store the instance
    const dataTable = new DataTable('#table', {
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.13.7/i18n/de-DE.json"
        }
    });

    console.log('DataTable initialized:', dataTable); // Debugging statement

    const table = document.getElementById('table'); // CRM table element
    const addForm = document.getElementById('crmAddForm'); // Add form element
    const updateForm = document.getElementById('crmUpdateForm'); // Update form element

    // CRM Daten Eingeben File Upload
    const uploadCrmInBtn = document.getElementById('uploadCrmIN');
    const fileCrmInInput = document.getElementById('fileCrmIN');
    const fileCrmInName = document.getElementById('fileNameCrmIN');

    if (uploadCrmInBtn && fileCrmInInput && fileCrmInName) {
        uploadCrmInBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent form submission
            fileCrmInInput.click(); // Trigger file input dialog
        });

        fileCrmInInput.addEventListener('change', function () {
            const fileName = this.files.length ? this.files[0].name : 'Keine Datei ausgewählt';
            fileCrmInName.value = fileName; // Show selected file name
        });
    }

    // CRM Data Ändern File Upload
    const uploadCrmUpdateBtn = document.getElementById('uploadCrmUpdate');
    const fileCrmUpdateInput = document.getElementById('fileCrmUpdate');
    const fileCrmUpdateName = document.getElementById('fileNameCrmUpdate');

    if (uploadCrmUpdateBtn && fileCrmUpdateInput && fileCrmUpdateName) {
        uploadCrmUpdateBtn.addEventListener('click', function (event) {
            event.preventDefault();
            fileCrmUpdateInput.click();
        });

        fileCrmUpdateInput.addEventListener('change', function () {
            const fileName = this.files.length ? this.files[0].name : 'Keine Datei ausgewählt';
            fileCrmUpdateName.value = fileName;
        });
    }

    // Adding a new row
    addForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Validation: Check all required fields except 'Anhang'
        const requiredFields = [
            'partner', 'kategorie', 'adresse', 'steuer_id', 'zahlungsziel',
            'zertifizierungen', 'artNr', 'telefonnummer', 'email', 'webseite',
            'ansprechpartner', 'rabattvereinbarungen', 'logistikinformationen',
            'vertragsbeginn', 'vertragsende', 'vertragsbedingungen',
            'verlängerungsdatum', 'versandmethode', 'lagerstandorte',
            'lieferanweisungen', 'notizen'
        ];

        let missingFields = [];
        const fieldNames = {
            'partner': 'Partner', 'kategorie': 'Kategorie', 'adresse': 'Adresse',
            'steuer_id': 'Steuer-ID', 'zahlungsziel': 'Zahlungsziel',
            'zertifizierungen': 'Zertifizierungen', 'artNr': 'Art-Nr.',
            'telefonnummer': 'Telefonnummer', 'email': 'Email',
            'webseite': 'Webseite', 'ansprechpartner': 'Ansprechpartner',
            'rabattvereinbarungen': 'Rabattvereinbarungen',
            'logistikinformationen': 'Logistikinformationen',
            'vertragsbeginn': 'Vertragsbeginn', 'vertragsende': 'Vertragsende',
            'vertragsbedingungen': 'Vertragsbedingungen',
            'verlängerungsdatum': 'Verlängerungsdatum',
            'versandmethode': 'Versandmethode', 'lagerstandorte': 'Lagerstandorte',
            'lieferanweisungen': 'Lieferanweisungen', 'notizen': 'Notizen'
        };

        requiredFields.forEach(function (fieldId) {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                missingFields.push(fieldNames[fieldId]);
            }
        });

        if (missingFields.length > 0) {
            alert('Bitte füllen Sie alle erforderlichen Felder aus:\n' + missingFields.join(', '));
            return; // Stop further execution
        }

        // Get form values
        const partner = document.getElementById('partner').value.trim();
        const kategorie = document.getElementById('kategorie').value === '1' ? 'Lieferant' : 'B2B Kunde';
        const adresse = document.getElementById('adresse').value.trim();
        const steuerID = document.getElementById('steuer_id').value.trim();
        const zahlungsziel = document.getElementById('zahlungsziel').value.trim();
        const zertifizierungen = document.getElementById('zertifizierungen').value.trim();
        const artNr = document.getElementById('artNr').value.trim();
        const telefonnummer = document.getElementById('telefonnummer').value.trim();
        const email = document.getElementById('email').value.trim();
        const webseite = document.getElementById('webseite').value.trim();
        const ansprechpartner = document.getElementById('ansprechpartner').value.trim();
        const rabatt = document.getElementById('rabattvereinbarungen').value.trim();
        const logistikinformationen = document.getElementById('logistikinformationen').value.trim();
        const vertragsbeginn = document.getElementById('vertragsbeginn').value.trim();
        const vertragsende = document.getElementById('vertragsende').value.trim();
        const vertragsbedingungen = document.getElementById('vertragsbedingungen').value.trim();
        const verlangerungsdatum = document.getElementById('verlängerungsdatum').value.trim();
        const versandmethode = document.getElementById('versandmethode').value.trim();
        const lagerstandorte = document.getElementById('lagerstandorte').value.trim();
        const lieferanweisungen = document.getElementById('lieferanweisungen').value.trim();
        const notizen = document.getElementById('notizen').value.trim();

        // Get the uploaded file name
        const fileNameCrmIn = document.getElementById('fileNameCrmIN').value.trim();

        // Prepare the data for the new row
        const newRowData = [
            `<button class="btn btn-danger btn-sm delete-row"><i class="bi bi-trash3-fill"></i></button>`, // Delete Button
            `<input type="radio" name="row-select" class="row-radio">`, // Radio Button
            partner,
            kategorie,
            adresse,
            steuerID,
            zahlungsziel,
            zertifizierungen,
            artNr,
            fileNameCrmIn !== 'Keine Datei ausgewählt' ? fileNameCrmIn : 'Anhang',
            telefonnummer,
            email,
            webseite,
            ansprechpartner,
            rabatt,
            logistikinformationen,
            vertragsbeginn,
            vertragsende,
            vertragsbedingungen,
            verlangerungsdatum,
            versandmethode,
            lagerstandorte,
            lieferanweisungen,
            notizen
        ];

        // Add the new row to DataTable using the API
        dataTable.row.add(newRowData).draw();

        // Reset the form and file input after adding the new row
        addForm.reset();
        fileCrmInName.value = 'Keine Datei ausgewählt';

        alert('Neuer Eintrag wurde erfolgreich hinzugefügt!');
    });

    // Define form fields for easy access
    const updateFormFields = {
        partner: document.getElementById('partner_up'),
        kategorie: document.getElementById('kategorie_up'),
        adresse: document.getElementById('adresse_up'),
        steuer_id: document.getElementById('steuer_id_up'),
        zahlungsziel: document.getElementById('zahlungsziel_up'),
        zertifizierungen: document.getElementById('zertifizierungen_up'),
        artNr: document.getElementById('artNr_up'),
        telefonnummer: document.getElementById('telefonnummer_up'),
        email: document.getElementById('email_up'),
        webseite: document.getElementById('webseite_up'),
        ansprechpartner: document.getElementById('ansprechpartner_up'),
        rabattvereinbarungen: document.getElementById('rabattvereinbarungen_up'),
        logistikinformationen: document.getElementById('logistikinformationen_up'),
        vertragsbeginn: document.getElementById('vertragsbeginn_up'),
        vertragsende: document.getElementById('vertragsende_up'),
        vertragsbedingungen: document.getElementById('vertragsbedingungen_up'),
        verlängerungsdatum: document.getElementById('verlängerungsdatum_up'),
        versandmethode: document.getElementById('versandmethode_up'),
        lagerstandorte: document.getElementById('lagerstandorte_up'),
        lieferanweisungen: document.getElementById('lieferanweisungen_up'),
        notizen: document.getElementById('notizen_up')
    };

    // Handle row selection for updating
    table.addEventListener('click', function (event) {
        const radio = event.target.closest('.row-radio');
        if (radio) {
            const row = radio.closest('tr');
            const cells = row.getElementsByTagName('td');

            // Highlight the selected row by adding 'selected' class
            // Remove 'selected' class from all rows
            const allRows = table.getElementsByTagName('tr');
            for (let r of allRows) {
                r.classList.remove('selected');
            }

            // Add 'selected' class to the current row
            row.classList.add('selected');

            // Populate the update form with row data
            updateFormFields.partner.value = cells[2].textContent.trim();
            updateFormFields.kategorie.value = cells[3].textContent.trim() === 'Lieferant' ? '1' : '2';
            updateFormFields.adresse.value = cells[4].textContent.trim();
            updateFormFields.steuer_id.value = cells[5].textContent.trim();
            updateFormFields.zahlungsziel.value = cells[6].textContent.trim();
            updateFormFields.zertifizierungen.value = cells[7].textContent.trim();
            updateFormFields.artNr.value = cells[8].textContent.trim();
            updateFormFields.telefonnummer.value = cells[10].textContent.trim();
            updateFormFields.email.value = cells[11].textContent.trim();
            updateFormFields.webseite.value = cells[12].textContent.trim();
            updateFormFields.ansprechpartner.value = cells[13].textContent.trim();
            updateFormFields.rabattvereinbarungen.value = cells[14].textContent.trim();
            updateFormFields.logistikinformationen.value = cells[15].textContent.trim();
            updateFormFields.vertragsbeginn.value = cells[16].textContent.trim();
            updateFormFields.vertragsende.value = cells[17].textContent.trim();
            updateFormFields.vertragsbedingungen.value = cells[18].textContent.trim();
            updateFormFields.verlängerungsdatum.value = cells[19].textContent.trim();
            updateFormFields.versandmethode.value = cells[20].textContent.trim();
            updateFormFields.lagerstandorte.value = cells[21].textContent.trim();
            updateFormFields.lieferanweisungen.value = cells[22].textContent.trim();
            updateFormFields.notizen.value = cells[23].textContent.trim();
        }
    });

    // Update the selected row on form submission
    updateForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission behavior

        const selectedRadio = document.querySelector('.row-radio:checked'); // Get the selected row's radio button
        if (selectedRadio) {
            const row = selectedRadio.closest('tr'); // Get the row of the selected radio button
            const cells = row.getElementsByTagName('td');

            // Get form values
            const updatedData = [
                cells[0].innerHTML, // Delete Button (retain existing HTML)
                cells[1].innerHTML, // Radio Button (retain existing HTML)
                updateFormFields.partner.value.trim(),
                updateFormFields.kategorie.value === '1' ? 'Lieferant' : 'B2B Kunde',
                updateFormFields.adresse.value.trim(),
                updateFormFields.steuer_id.value.trim(),
                updateFormFields.zahlungsziel.value.trim(),
                updateFormFields.zertifizierungen.value.trim(),
                updateFormFields.artNr.value.trim(),
                document.getElementById('fileNameCrmUpdate').value.trim() !== 'Keine Datei ausgewählt' ? document.getElementById('fileNameCrmUpdate').value.trim() : 'Anhang',
                updateFormFields.telefonnummer.value.trim(),
                updateFormFields.email.value.trim(),
                updateFormFields.webseite.value.trim(),
                updateFormFields.ansprechpartner.value.trim(),
                updateFormFields.rabattvereinbarungen.value.trim(),
                updateFormFields.logistikinformationen.value.trim(),
                updateFormFields.vertragsbeginn.value.trim(),
                updateFormFields.vertragsende.value.trim(),
                updateFormFields.vertragsbedingungen.value.trim(),
                updateFormFields.verlängerungsdatum.value.trim(),
                updateFormFields.versandmethode.value.trim(),
                updateFormFields.lagerstandorte.value.trim(),
                updateFormFields.lieferanweisungen.value.trim(),
                updateFormFields.notizen.value.trim()
            ];

            // Update the DataTable's row data using the API
            dataTable.row(row).data(updatedData);
            dataTable.draw(); // Redraw the table to reflect changes

            // Reset the update form
            updateForm.reset();

            // Remove 'selected' class from all rows
            const allRows = table.getElementsByTagName('tr');
            for (let r of allRows) {
                r.classList.remove('selected');
            }

            alert('Zeile wurde erfolgreich aktualisiert!');
        } else {
            alert('Bitte wählen Sie eine Zeile zum Aktualisieren aus.');
        }
    });

    // Handle row deletion using event delegation
    table.addEventListener('click', function (event) {
        const deleteButton = event.target.closest('.delete-row');
        if (deleteButton) {
            const row = deleteButton.closest('tr'); // Get the row of the delete button
            const cells = row.getElementsByTagName('td');
            const partner = cells[2].textContent.trim(); // Get the partner name for confirmation

            if (confirm(`Möchten Sie den Eintrag für "${partner}" wirklich löschen?`)) {
                // Remove the row from DataTable using the API
                dataTable.row(row).remove(); // Remove the row
                dataTable.draw(); // Redraw the table to reflect changes

                alert('Zeile wurde erfolgreich gelöscht!');
            }
        }
    });
});
