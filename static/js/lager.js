 // Get the button
 let upButton = document.getElementById("up-button");
    
 // When the user scrolls down 200px from the top of the document, show the button
 window.onscroll = function() {scrollFunction()};

 function scrollFunction() {
     if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
         upButton.style.display = "block";
     } else {
         upButton.style.display = "none";
     }
 }

 // When the user clicks on the button, scroll to the top of the document
 upButton.addEventListener("click", function(event) {
     event.preventDefault();
     document.body.scrollTop = 0; // For Safari
     document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
 });

document.addEventListener('DOMContentLoaded', function () {
    // Initialize DataTables for Bestand Table
    const bestandTable = $('#bestandTable').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/de-DE.json" // German language
        },
        columnDefs: [
            { orderable: false, targets: 0 }, // Disable ordering on the first column (radio buttons)
            { width: "5%", targets: 0 },      // Selection column
            { width: "10%", targets: 1 },     // Art-Nr.
            { width: "15%", targets: 2 },     // Art-Bez.
            { width: "10%", targets: 3 },     // Charge
            { width: "10%", targets: 4 },     // MHD
            { width: "10%", targets: 5 },     // €/Stk.
            { width: "10%", targets: 6 },     // Bestand
            { width: "10%", targets: 7 },     // Reserv-Best.
            { width: "10%", targets: 8 },     // Verfg-Best.
            { width: "10%", targets: 9 },     // Anhang
            { width: "10%", targets: 10 }     // Img
        ],
        order: [[1, 'asc']] // Optional initial ordering
    });

    // Initialize DataTables for Transaktionen Table
    const transactionsTable = $('#transactionsTable').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/de-DE.json" // German language
        },
        columnDefs: [
            { width: "10%", targets: 8 } // Kategorie column
        ],
        order: [[0, 'asc']], // Optional initial ordering
        // Ensure that the Img column renders HTML
        columnDefs: [
            {
                targets: 7, // Img column index (0-based)
                orderable: false,
                searchable: false,
                render: function (data, type, row, meta) {
                    return data; // Render the HTML as is
                }
            }
        ]
    });

    // Function to handle row selection and apply 'selected' class
    function handleRowSelection() {
        $('#bestandTable tbody').on('change', 'input.row-radio', function () {
            // Remove 'selected' class from all rows
            $('#bestandTable tbody tr').removeClass('selected');

            // Add 'selected' class to the selected row
            const selectedRow = $(this).closest('tr');
            selectedRow.addClass('selected');

            // Extract data from the selected row's cells
            const cells = selectedRow.find('td');

            // Assuming the following column indices:
            // [0] Radio, [1] Art-Nr., [2] Art-Bez., [3] Charge, [4] MHD,
            // [5] €/Stk., [6] Bestand, [7] Reserv-Best., [8] Verfg-Best.,
            // [9] Anhang, [10] Img

            const artNr = $(cells[1]).text().trim();
            const artBez = $(cells[2]).text().trim();
            const charge = $(cells[3]).text().trim();
            const mhd = $(cells[4]).text().trim();
            const stkPreis = $(cells[5]).text().trim();
            const anhang = $(cells[9]).text().trim();
            const img = $(cells[10]).text().trim();

            // Autofill Warenausgang Form
            document.getElementById('artNr_aus').value = artNr;
            document.getElementById('artBez_aus').value = artBez;
            document.getElementById('charge_aus').value = charge;
            document.getElementById('mhd_aus').value = mhd;
            document.getElementById('stkPreis_aus').value = stkPreis;

            // Set Anhang and Img in Warenausgang form's read-only inputs
            document.getElementById('fileNameWarenausgang').value = anhang || 'Keine Datei ausgewählt';
            document.getElementById('fileNameImgWarenausgang').value = img || 'Keine Datei ausgewählt';
        });
    }

    // Initialize Row Selection Handler
    handleRowSelection();

    // Function to handle file uploads for both forms
    function handleFileUpload(buttonId, fileInputId, fileNameInputId) {
        const uploadButton = document.getElementById(buttonId);
        const fileInput = document.getElementById(fileInputId);
        const fileNameInput = document.getElementById(fileNameInputId);

        if (uploadButton && fileInput && fileNameInput) {
            // When the upload button is clicked, trigger the hidden file input
            uploadButton.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent default button behavior
                fileInput.click();      // Trigger the hidden file input
            });

            // When a file is selected, display its name in the adjacent input field
            fileInput.addEventListener('change', function () {
                const fileName = this.files.length ? this.files[0].name : 'Keine Datei ausgewählt';
                fileNameInput.value = fileName; // Display selected file name
            });
        }
    }

    // Handle file uploads for Wareneingang Form
    handleFileUpload('uploadWareneingang', 'fileWareneingang', 'fileNameWareneingang');
    handleFileUpload('uploadImgWareneingang', 'fileImgWareneingang', 'fileNameImgWareneingang');

    // Handle file uploads for Warenausgang Form
    handleFileUpload('uploadWarenausgang', 'fileWarenausgang', 'fileNameWarenausgang');
    handleFileUpload('uploadImgWarenausgang', 'fileImgWarenausgang', 'fileNameImgWarenausgang');

    // Handle Wareneingang Form Submission
    const wareneingangForm = document.getElementById('wareneingangForm');
    wareneingangForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const artNr = document.getElementById('artNr').value.trim();
        const artBez = document.getElementById('artBez').value.trim();
        const charge = document.getElementById('charge').value.trim();
        const mhd = document.getElementById('mhd').value.trim();
        const stkPreis = parseFloat(document.getElementById('stkPreis').value.trim());
        const menge = parseInt(document.getElementById('menge').value.trim());
        const kategorieSelect = document.getElementById('kategorie');
        const kategorie = kategorieSelect.options[kategorieSelect.selectedIndex].text.trim();

        // Simple validation
        if (!artNr || !artBez || !charge || isNaN(stkPreis) || isNaN(menge)) {
            alert('Bitte füllen Sie alle erforderlichen Felder korrekt aus.');
            return;
        }

        // Handle Anhang and Img files
        const anhangInput = document.getElementById('fileWareneingang');
        const imgInput = document.getElementById('fileImgWareneingang');
        const anhang = anhangInput.files[0] || null;
        const img = imgInput.files[0] || null;

        // Prepare form data
        const formData = new FormData();
        formData.append('artNr', artNr);
        formData.append('artBez', artBez);
        formData.append('charge', charge);
        formData.append('mhd', mhd);
        formData.append('stkPreis', stkPreis);
        formData.append('menge', menge);
        formData.append('kategorie', kategorie);

        if (anhang) formData.append('anhang', anhang);
        if (img) formData.append('img', img);

        // TODO: Implement form submission via Fetch API when backend is ready
        // For now, just display a success message
        alert('Wareneingang erfolgreich abgeschickt!');

        // Add a new row to the Transaktionen table
        const transArtNr = artNr;
        const transArtBez = artBez;
        const transCharge = charge;
        const transMHD = mhd;
        const transStkPreis = stkPreis;
        const transMenge = menge;
        const transAnhang = anhang ? anhang.name : 'Anhang';

        // Create an image preview if an image was uploaded
        let transImg = 'Img';
        if (img) {
            const imgURL = URL.createObjectURL(img);
            transImg = `<img src="${imgURL}" alt="Bild" width="50" height="50">`;
        }

        const transKategorie = kategorie;

        const newTransRow = [
            transArtNr,
            transArtBez,
            transCharge,
            transMHD,
            transStkPreis,
            transMenge,
            transAnhang,
            transImg,
            transKategorie
        ];

        transactionsTable.row.add(newTransRow).draw(false);

        // Optionally, reset the form
        wareneingangForm.reset();
        document.getElementById('fileNameWareneingang').value = 'Keine Datei ausgewählt';
        document.getElementById('fileNameImgWareneingang').value = 'Keine Datei ausgewählt';
    });

    // Handle Warenausgang Form Submission
    const warenausgangForm = document.getElementById('warenausgangForm');
    warenausgangForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Find the selected row in Bestand table
        const selectedRadio = document.querySelector('input.row-radio:checked');
        if (!selectedRadio) {
            alert('Bitte wählen Sie eine Zeile im Bestand aus.');
            return;
        }

        const selectedRow = selectedRadio.closest('tr');
        const cells = selectedRow.getElementsByTagName('td');

        // Collect Warenausgang form data
        const artNr_aus = document.getElementById('artNr_aus').value.trim();
        const artBez_aus = document.getElementById('artBez_aus').value.trim();
        const charge_aus = document.getElementById('charge_aus').value.trim();
        const mhd_aus = document.getElementById('mhd_aus').value.trim();
        const stkPreis_aus = parseFloat(document.getElementById('stkPreis_aus').value.trim());
        const mengeAus = parseInt(document.getElementById('menge_aus').value.trim());
        const kategorieSelectAus = document.getElementById('kategorie_aus');
        const kategorieAus = kategorieSelectAus.options[kategorieSelectAus.selectedIndex].text.trim();

        // Simple validation
        if (!artNr_aus || !artBez_aus || !charge_aus || isNaN(stkPreis_aus) || isNaN(mengeAus)) {
            alert('Bitte füllen Sie alle erforderlichen Felder korrekt aus.');
            return;
        }

        // Get current Bestand from the selected row
        const currentBestand = parseInt(cells[6].innerText.trim());

        if (mengeAus > currentBestand) {
            alert('Die eingetragene Menge überschreitet den verfügbaren Bestand.');
            return;
        }

        // Handle Anhang and Img files
        const anhangAusgangInput = document.getElementById('fileWarenausgang');
        const imgAusgangInput = document.getElementById('fileImgWarenausgang');
        const anhangAusgang = anhangAusgangInput.files[0] || null;
        const imgAusgang = imgAusgangInput.files[0] || null;

        // Prepare form data
        const formData = new FormData();
        formData.append('artNr_aus', artNr_aus);
        formData.append('artBez_aus', artBez_aus);
        formData.append('charge_aus', charge_aus);
        formData.append('mhd_aus', mhd_aus);
        formData.append('stkPreis_aus', stkPreis_aus);
        formData.append('mengeAus', mengeAus);
        formData.append('kategorieAus', kategorieAus);

        if (anhangAusgang) formData.append('anhangAusgang', anhangAusgang);
        if (imgAusgang) formData.append('imgAusgang', imgAusgang);

        // TODO: Implement form submission via Fetch API when backend is ready
        // For now, just display a success message
        alert('Warenausgang erfolgreich abgeschickt!');

        // Add a new row to the Transaktionen table with negative Menge
        const transArtNrAus = artNr_aus;
        const transArtBezAus = artBez_aus;
        const transChargeAus = charge_aus;
        const transMHDAus = mhd_aus;
        const transStkPreisAus = stkPreis_aus;
        const transMengeAus = -mengeAus; // Negative value for Warenausgang
        const transAnhangAus = anhangAusgang ? anhangAusgang.name : 'Anhang';

        // Create an image preview if an image was uploaded
        let transImgAus = 'Img';
        if (imgAusgang) {
            const imgURLAus = URL.createObjectURL(imgAusgang);
            transImgAus = `<img src="${imgURLAus}" alt="Bild" width="50" height="50">`;
        }

        const transKategorieAus = kategorieAus;

        const newTransRowAus = [
            transArtNrAus,
            transArtBezAus,
            transChargeAus,
            transMHDAus,
            transStkPreisAus,
            transMengeAus,
            transAnhangAus,
            transImgAus,
            transKategorieAus
        ];

        transactionsTable.row.add(newTransRowAus).draw(false);

        // Optionally, update the Bestand table's Bestand value
        cells[6].innerText = currentBestand - mengeAus;

        // Optionally, reset the form
        warenausgangForm.reset();
        document.getElementById('fileNameWarenausgang').value = 'Keine Datei ausgewählt';
        document.getElementById('fileNameImgWarenausgang').value = 'Keine Datei ausgewählt';

        // Remove 'selected' class from the previously selected row
        selectedRow.classList.remove('selected');
    });
});
