document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    let chartInstance = null;

    // Initialize flatpickr with German localization
    flatpickr("#start-date", {
        dateFormat: "d.m.Y",
        locale: "de"
    });

    flatpickr("#end-date", {
        dateFormat: "d.m.Y",
        locale: "de"
    });

    // Function to get the count of rows (distinct dates) by Vers.-Datum using DataTables API
    function getSendungenData() {
        const sendungenByDate = {};
        const table = $('#table').DataTable();  // Access DataTables API
        const allData = table.rows().data();  // Get all rows, not just visible ones

        // Iterate through each row and count distinct rows by Vers.-Datum
        allData.each(function (row) {
            const versDatum = row[8];  // "Vers.-Datum" column (index 8)
            const parsedDate = versDatum.split('.').reverse().join('-');  // Convert DD.MM.YYYY to YYYY-MM-DD

            // Increment the count for the date
            if (!sendungenByDate[parsedDate]) {
                sendungenByDate[parsedDate] = 0;
            }
            sendungenByDate[parsedDate]++;
        });

        return sendungenByDate;
    }

    // Function to filter data based on start and end dates
    function filterDatesByRange(startDate, endDate) {
        const filteredDates = {};
        const data = getSendungenData();

        for (const date in data) {
            const parsedDate = new Date(date); // The date is already in YYYY-MM-DD format
            if (parsedDate >= startDate && parsedDate <= endDate) {
                filteredDates[date] = data[date];
            }
        }

        return filteredDates;
    }

    // Function to render the chart
    function renderChart(data) {
        const labels = Object.keys(data).map(date => new Date(date).toLocaleDateString('de-DE')); // Convert to DD.MM.YYYY format
        const counts = Object.values(data);

        if (chartInstance) {
            chartInstance.destroy(); // Destroy previous chart instance before creating a new one
        }

        // Create a new chart
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Anzahl der Sendungen',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,  // Enable responsive behavior
                maintainAspectRatio: false,  // Optional, allows chart to resize more freely
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Versand-Datum'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Anzahl der Sendungen'
                        }
                    }
                }
            }
        });
    }


    // Update the chart when the user changes the date range
    function updateChart() {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        let startDate, endDate;

        // Parse start date
        if (startDateValue) {
            startDate = new Date(startDateValue.split('.').reverse().join('-'));
        } else {
            startDate = new Date();  // Default to today’s date
        }

        // Parse end date
        if (endDateValue) {
            endDate = new Date(endDateValue.split('.').reverse().join('-'));
        } else {
            // If no end date is provided, set it to 1 month after the start date
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Log the start and end dates for debugging
        console.log("Filtering with Start Date:", startDate, "End Date:", endDate);

        // Check if start date is later than end date
        if (startDate > endDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }

        // Filter and log filtered data
        const filteredData = filterDatesByRange(startDate, endDate);

        // Render the chart with filtered data
        renderChart(filteredData);
    }

    // Attach event listeners to the date inputs
    startDateInput.addEventListener('change', updateChart);
    endDateInput.addEventListener('change', updateChart);

    // Initialize the chart with all available data by default
    const fullData = getSendungenData();
    renderChart(fullData);
});