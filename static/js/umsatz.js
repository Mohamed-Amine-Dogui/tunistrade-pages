// Declare globally shared variables
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// Initialize flatpickr with German localization
flatpickr("#start-date", {
    dateFormat: "d.m.Y",
    locale: "de"
});

flatpickr("#end-date", {
    dateFormat: "d.m.Y",
    locale: "de"
});

// Define the total line color 
const totalLineColor = 'rgba(54, 162, 235, 1)';  // Color for the total Umsatz line

// Object to store colors for each Art-Nr.
const artColors = {};

// Function to generate random color for each product line
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to assign and return a consistent color for each Art-Nr.
function getColorForArt(artNr) {
    if (!artColors[artNr]) {
        artColors[artNr] = getRandomColor();  // Generate and store a color if it doesn't exist
    }
    return artColors[artNr];  // Return the consistent color for this Art-Nr.
}

// Function to get all distinct dates from the table
function getAllDistinctDates() {
    const distinctDates = new Set();
    const table = $('#table').DataTable();  // Access DataTables API
    const allData = table.rows().data();  // Get all rows

    // Iterate through each row to collect distinct dates
    allData.each(function (row) {
        const versDatum = row[6];  // "Vers.-Datum" column (index 6)
        const parsedDate = versDatum.split('.').reverse().join('-');  // Convert DD.MM.YYYY to YYYY-MM-DD
        distinctDates.add(parsedDate);  // Add date to the set to ensure uniqueness
    });

    return Array.from(distinctDates).sort();  // Return sorted array of distinct dates
}


document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('UmsatzEntwicklung').getContext('2d');
    let chartInstance = null;

    // Function to get the Umsatz data (product-wise Menge * €/Stk.) by Vers.-Datum using DataTables API
    function getUmsatzData() {
        const umsatzByProduct = {};
        const table = $('#table').DataTable();  // Access DataTables API
        const allData = table.rows().data();  // Get all rows, not just visible ones

        // Iterate through each row and calculate the Umsatz (Menge * €/Stk.) per product and date
        allData.each(function (row) {
            const versDatum = row[6];  // "Vers.-Datum" column (index 6)
            const artNr = row[1];  // Art-Nr. column (index 1)
            const menge = parseFloat(row[3]);  // Menge column (index 3)
            const pricePerUnit = parseFloat(row[4]);  // €/Stk. column (index 4)
            const umsatz = menge * pricePerUnit;  // Calculate Umsatz (Menge * €/Stk.)
            const parsedDate = versDatum.split('.').reverse().join('-');  // Convert DD.MM.YYYY to YYYY-MM-DD

            // Initialize the product entry if not already present
            if (!umsatzByProduct[artNr]) {
                umsatzByProduct[artNr] = {};
            }

            // Add the Umsatz to the date
            if (!umsatzByProduct[artNr][parsedDate]) {
                umsatzByProduct[artNr][parsedDate] = 0;
            }

            umsatzByProduct[artNr][parsedDate] += umsatz;  // Sum the Umsatz per date
        });

        return umsatzByProduct;
    }

    // Function to calculate the total Umsatz across all products by date
    function calculateTotalUmsatz(data, allDates) {
        const totalUmsatz = {};

        allDates.forEach(date => {
            totalUmsatz[date] = 0;
            for (const product in data) {
                totalUmsatz[date] += data[product][date] || 0;  // Sum up the Umsatz across all products for each date
            }
        });

        return totalUmsatz;
    }

    // Function to filter data based on start and end dates
    function filterDatesByRange(startDate, endDate) {
        const filteredData = {};
        const data = getUmsatzData();

        // Iterate through each product and filter its data by date range
        for (const product in data) {
            filteredData[product] = {};
            for (const date in data[product]) {
                const parsedDate = new Date(date); // The date is already in YYYY-MM-DD format
                if (parsedDate >= startDate && parsedDate <= endDate) {
                    filteredData[product][date] = data[product][date];
                }
            }
        }

        return filteredData;
    }


    // Function to render the chart with multiple product lines and the total line
    function renderChart(data, allDates) {
        let datasets = [];

        // Generate a dataset for each product
        for (const product in data) {
            const values = allDates.map(date => data[product][date] || 0);  // Use 0 if no data for that date

            // Check if the dataset contains only zero values
            if (values.every(value => value === 0)) {
                continue;  // Skip this dataset if all values are zero
            }

            datasets.push({
                label: `Art-Nr. ${product}`,  // Use the Art-Nr. as the label
                data: values,
                fill: false,
                borderColor: getColorForArt(product),  // Assign consistent color for each product line
                backgroundColor: 'transparent',  // Remove background (no fill, just border)
                borderWidth: 2,  // Thicker border for clearer distinction
                tension: 0.1
            });
        }

        // Calculate the total Umsatz line and add it to the datasets
        const totalUmsatzData = calculateTotalUmsatz(data, allDates);
        const totalValues = allDates.map(date => totalUmsatzData[date] || 0);  // Use 0 if no data for that date

        // Add the total line as the last dataset to ensure it is rendered on top
        datasets.push({
            label: 'Total Umsatz',  // Total Umsatz label
            data: totalValues,
            fill: false,
            borderColor: totalLineColor,  // Specific color for the total line
            backgroundColor: 'transparent',
            borderWidth: 6,  // Slightly thicker for the total line
            tension: 0.1,
            z: 10 // Set the z-index so that this dataset is rendered on top
        });

        if (chartInstance) {
            chartInstance.destroy(); // Destroy previous chart instance before creating a new one
        }

        // Create a new line chart
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allDates.map(date => new Date(date).toLocaleDateString('de-DE')), // Convert to DD.MM.YYYY format
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                            text: 'Umsatz (Menge * €/Stk.)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,  // Use circles instead of rectangular blocks in the legend
                            pointStyle: 'line'    // Ensure only the colored border is shown in the legend
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
            startDate = new Date(Math.min(...getAllDistinctDates().map(date => new Date(date))));  // Earliest date
        }

        // Parse end date
        if (endDateValue) {
            endDate = new Date(endDateValue.split('.').reverse().join('-'));
        } else {
            endDate = new Date(Math.max(...getAllDistinctDates().map(date => new Date(date))));  // Latest date
        }

        // Check if start date is later than end date
        if (startDate > endDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }

        // Get all distinct dates within the selected range
        const filteredData = filterDatesByRange(startDate, endDate);
        const allDates = getAllDistinctDates().filter(date => {
            const parsedDate = new Date(date);
            return parsedDate >= startDate && parsedDate <= endDate;
        });

        // Render the chart with filtered data and all dates in the range
        renderChart(filteredData, allDates);
    }

    // Attach event listeners to the date inputs
    startDateInput.addEventListener('change', updateChart);
    endDateInput.addEventListener('change', updateChart);

    // Initialize the chart with all available data by default
    const allDates = getAllDistinctDates();  // Get all distinct dates
    const fullData = getUmsatzData();
    renderChart(fullData, allDates);  // Render chart with all available data and dates
});


document.addEventListener('DOMContentLoaded', function () {
    const mengeCtx = document.getElementById('MengeEntwicklung').getContext('2d');
    let mengeChartInstance = null;

    // Function to get the Menge data (quantity per product) by Vers.-Datum using DataTables API
    function getMengeData() {
        const mengeByProduct = {};
        const table = $('#table').DataTable();  // Access DataTables API
        const allData = table.rows().data();  // Get all rows, not just visible ones

        // Iterate through each row and calculate the Menge per product and date
        allData.each(function (row) {
            const versDatum = row[6];  // "Vers.-Datum" column (index 6)
            const artNr = row[1];  // Art-Nr. column (index 1)
            const menge = parseFloat(row[3]);  // Menge column (index 3)
            const parsedDate = versDatum.split('.').reverse().join('-');  // Convert DD.MM.YYYY to YYYY-MM-DD

            if (!mengeByProduct[artNr]) {
                mengeByProduct[artNr] = {};
            }

            if (!mengeByProduct[artNr][parsedDate]) {
                mengeByProduct[artNr][parsedDate] = 0;
            }

            mengeByProduct[artNr][parsedDate] += menge;  // Sum the Menge per date
        });

        return mengeByProduct;
    }

    // Function to filter Menge data based on start and end dates
    function filterMengeDatesByRange(startDate, endDate) {
        const filteredData = {};
        const data = getMengeData();

        // Iterate through each product and filter its data by date range
        for (const product in data) {
            filteredData[product] = {};
            for (const date in data[product]) {
                const parsedDate = new Date(date);  // The date is already in YYYY-MM-DD format
                if (parsedDate >= startDate && parsedDate <= endDate) {
                    filteredData[product][date] = data[product][date];
                }
            }
        }

        return filteredData;
    }

    // Function to render the Menge chart
    function renderMengeChart(data, allDates) {
        let datasets = [];

        // Generate a dataset for each product
        for (const product in data) {
            const values = allDates.map(date => data[product][date] || 0);  // Use 0 if no data for that date

            // Check if the dataset contains only zero values
            if (values.every(value => value === 0)) {
                continue;  // Skip this dataset if all values are zero
            }

            datasets.push({
                label: `Art-Nr. ${product}`,  // Use the Art-Nr. as the label
                data: values,
                fill: false,
                borderColor: getColorForArt(product),  // Use consistent color for each product
                backgroundColor: 'transparent',  // Remove background (no fill, just border)
                borderWidth: 2,  // Thicker border for clearer distinction
                tension: 0.1
            });
        }

        if (mengeChartInstance) {
            mengeChartInstance.destroy();  // Destroy previous chart instance before creating a new one
        }

        // Create a new line chart for Menge
        mengeChartInstance = new Chart(mengeCtx, {
            type: 'line',
            data: {
                labels: allDates.map(date => new Date(date).toLocaleDateString('de-DE')),  // Convert to DD.MM.YYYY format
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                            text: 'Menge (Stk.)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,  // Use circles instead of rectangular blocks in the legend
                            pointStyle: 'line'    // Ensure only the colored border is shown in the legend
                        }
                    }
                }
            }
        });
    }

    // Function to update the Menge chart when the user changes the date range
    function updateMengeChart() {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        let startDate, endDate;

        // Parse start date
        if (startDateValue) {
            startDate = new Date(startDateValue.split('.').reverse().join('-'));
        } else {
            startDate = new Date(Math.min(...getAllDistinctDates().map(date => new Date(date))));  // Earliest date
        }

        // Parse end date
        if (endDateValue) {
            endDate = new Date(endDateValue.split('.').reverse().join('-'));
        } else {
            endDate = new Date(Math.max(...getAllDistinctDates().map(date => new Date(date))));  // Latest date
        }

        // Check if start date is later than end date
        if (startDate > endDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }

        // Get all distinct dates within the selected range
        const filteredData = filterMengeDatesByRange(startDate, endDate);
        const allDates = getAllDistinctDates().filter(date => {
            const parsedDate = new Date(date);
            return parsedDate >= startDate && parsedDate <= endDate;
        });

        // Render the Menge chart with filtered data and all dates in the range
        renderMengeChart(filteredData, allDates);
    }

    // Attach event listeners to the date inputs
    startDateInput.addEventListener('change', updateMengeChart);
    endDateInput.addEventListener('change', updateMengeChart);

    // Initialize the Menge chart with all available data by default
    const allDates = getAllDistinctDates();  // Get all distinct dates
    const fullMengeData = getMengeData();
    renderMengeChart(fullMengeData, allDates);  // Render chart with all available data and dates
});


document.addEventListener('DOMContentLoaded', function () {
    const verteilungCtx = document.getElementById('UmsatzVerteilung').getContext('2d');
    let verteilungChartInstance = null;

    // Function to calculate the total Umsatz for each product within a date range
    function calculateUmsatzVerteilungData(startDate, endDate) {
        const umsatzByProduct = {};
        const table = $('#table').DataTable();  // Access DataTables API
        const allData = table.rows().data();  // Get all rows, not just visible ones

        // Iterate through each row and calculate the Umsatz per product within the date range
        allData.each(function (row) {
            const versDatum = row[6];  // "Vers.-Datum" column (index 6)
            const artNr = row[1];  // Art-Nr. column (index 1)
            const menge = parseFloat(row[3]);  // Menge column (index 3)
            const pricePerUnit = parseFloat(row[4]);  // €/Stk. column (index 4)
            const umsatz = menge * pricePerUnit;  // Calculate Umsatz (Menge * €/Stk.)
            const parsedDate = new Date(versDatum.split('.').reverse().join('-'));  // Convert DD.MM.YYYY to Date

            // Only include rows within the selected date range
            if (parsedDate >= startDate && parsedDate <= endDate) {
                if (!umsatzByProduct[artNr]) {
                    umsatzByProduct[artNr] = 0;
                }
                umsatzByProduct[artNr] += umsatz;  // Sum the Umsatz per product
            }
        });

        return umsatzByProduct;
    }

    // Function to convert Umsatz values into percentages
    function convertToPercentages(umsatzByProduct) {
        const totalUmsatz = Object.values(umsatzByProduct).reduce((sum, umsatz) => sum + umsatz, 0);  // Calculate total Umsatz
        const percentages = {};

        for (const product in umsatzByProduct) {
            percentages[product] = ((umsatzByProduct[product] / totalUmsatz) * 100).toFixed(2);  // Convert to percentage
        }

        return percentages;
    }

    // Function to render the UmsatzVerteilung pie chart
    function renderVerteilungChart(data) {
        const labels = Object.keys(data).map(artNr => `Art-Nr. ${artNr}`);  // Product labels
        const values = Object.values(data);  // Umsatz percentages
        const colors = Object.keys(data).map(artNr => getColorForArt(artNr));  // Colors for each product

        if (verteilungChartInstance) {
            verteilungChartInstance.destroy();  // Destroy previous chart instance before creating a new one
        }

        // Create the pie chart for UmsatzVerteilung
        verteilungChartInstance = new Chart(verteilungCtx, {
            type: 'pie',
            data: {
                labels: labels,  // Product labels
                datasets: [{
                    data: values,  // Umsatz percentages
                    backgroundColor: colors,  // Assign consistent colors for each product
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,  // Use circles instead of rectangular blocks in the legend
                            pointStyle: 'circle'
                        }
                    }
                }
            },
            plugins: [{
                beforeDraw: function (chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    ctx.restore();
                    var fontSize = (height / 114).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";

                    chart.data.datasets.forEach(function (dataset) {
                        for (let i = 0; i < dataset.data.length; i++) {
                            const model = chart.getDatasetMeta(0).data[i].tooltipPosition();
                            const value = dataset.data[i];
                            if (value > 0) {
                                ctx.fillStyle = '#fff';
                                const percentage = `${parseFloat(value).toFixed(1)}%`;  // Display as XX.X%
                                ctx.fillText(percentage, model.x, model.y);
                            }
                        }
                    });
                    ctx.save();
                }
            }]
        });
    }


    // Function to update the UmsatzVerteilung chart when the user changes the date range
    function updateVerteilungChart() {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        let startDate, endDate;

        // Parse start date
        if (startDateValue) {
            startDate = new Date(startDateValue.split('.').reverse().join('-'));
        } else {
            startDate = new Date(Math.min(...getAllDistinctDates().map(date => new Date(date))));  // Earliest date
        }

        // Parse end date
        if (endDateValue) {
            endDate = new Date(endDateValue.split('.').reverse().join('-'));
        } else {
            endDate = new Date(Math.max(...getAllDistinctDates().map(date => new Date(date))));  // Latest date
        }

        // Check if start date is later than end date
        if (startDate > endDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }

        // Calculate the Umsatz distribution in percentage
        const umsatzByProduct = calculateUmsatzVerteilungData(startDate, endDate);
        const umsatzPercentages = convertToPercentages(umsatzByProduct);

        // Render the pie chart with calculated percentage data
        renderVerteilungChart(umsatzPercentages);
    }

    // Attach event listeners to the date inputs
    startDateInput.addEventListener('change', updateVerteilungChart);
    endDateInput.addEventListener('change', updateVerteilungChart);

    // Initialize the chart with all available data by default
    const allDates = getAllDistinctDates();  // Get all distinct dates
    const fullUmsatzData = calculateUmsatzVerteilungData(new Date(Math.min(...allDates.map(date => new Date(date)))), new Date(Math.max(...allDates.map(date => new Date(date)))));
    const fullUmsatzPercentages = convertToPercentages(fullUmsatzData);

    renderVerteilungChart(fullUmsatzPercentages);  // Render chart with all available data
});

document.addEventListener('DOMContentLoaded', function () {
    const verteilungCtx = document.getElementById('MengeVerteilung').getContext('2d');
    let mengeVerteilungChartInstance = null;

    // Function to get the Menge data (product-wise Menge per product) using DataTables API
    function getMengeVerteilungData() {
        const mengeByProduct = {};
        const table = $('#table').DataTable();  // Access DataTables API
        const allData = table.rows().data();  // Get all rows, not just visible ones

        // Iterate through each row and calculate the Menge per product
        allData.each(function (row) {
            const artNr = row[1];  // Art-Nr. column (index 1)
            const menge = parseFloat(row[3]);  // Menge column (index 3)

            // Initialize the product entry if not already present
            if (!mengeByProduct[artNr]) {
                mengeByProduct[artNr] = 0;
            }

            mengeByProduct[artNr] += menge;  // Sum the Menge per product
        });

        return mengeByProduct;
    }

    // Function to calculate the percentage distribution of Menge for each product
    function calculateMengePercentage(data) {
        const totalMenge = Object.values(data).reduce((sum, value) => sum + value, 0);  // Calculate total Menge
        const percentageData = {};

        // Calculate the percentage for each product and round to one decimal place
        for (const product in data) {
            percentageData[product] = ((data[product] / totalMenge) * 100).toFixed(1);
        }

        return percentageData;
    }

    // Function to render the MengeVerteilung pie chart
    function renderMengeVerteilungChart(data) {
        const labels = Object.keys(data).map(artNr => `Art-Nr. ${artNr}`);  // Product labels
        const values = Object.values(data);  // Menge percentages
        const colors = Object.keys(data).map(artNr => getColorForArt(artNr));  // Colors for each product

        if (mengeVerteilungChartInstance) {
            mengeVerteilungChartInstance.destroy();  // Destroy previous chart instance before creating a new one
        }

        // Create the pie chart for MengeVerteilung
        mengeVerteilungChartInstance = new Chart(verteilungCtx, {
            type: 'pie',
            data: {
                labels: labels,  // Product labels
                datasets: [{
                    data: values,  // Menge percentages
                    backgroundColor: colors,  // Assign consistent colors for each product
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,  // Use circles instead of rectangular blocks in the legend
                            pointStyle: 'circle'
                        }
                    }
                }
            },
            plugins: [{
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    ctx.restore();
                    var fontSize = (height / 114).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";

                    chart.data.datasets.forEach(function(dataset) {
                        for (let i = 0; i < dataset.data.length; i++) {
                            const model = chart.getDatasetMeta(0).data[i].tooltipPosition();
                            const value = dataset.data[i];
                            if (value > 0) {
                                ctx.fillStyle = '#fff';
                                const percentage = `${parseFloat(value).toFixed(1)}%`;  // Display as XX.X%
                                ctx.fillText(percentage, model.x, model.y);
                            }
                        }
                    });
                    ctx.save();
                }
            }]
        });
    }

    // Function to update the MengeVerteilung chart when the user changes the date range
    function updateMengeVerteilungChart() {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        let startDate, endDate;

        // Parse start date
        if (startDateValue) {
            startDate = new Date(startDateValue.split('.').reverse().join('-'));
        } else {
            startDate = new Date(Math.min(...getAllDistinctDates().map(date => new Date(date))));  // Earliest date
        }

        // Parse end date
        if (endDateValue) {
            endDate = new Date(endDateValue.split('.').reverse().join('-'));
        } else {
            endDate = new Date(Math.max(...getAllDistinctDates().map(date => new Date(date))));  // Latest date
        }

        // Check if start date is later than end date
        if (startDate > endDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }

        // Get the Menge data and filter by date range
        const filteredMengeData = getMengeVerteilungData();  // Retrieve the filtered Menge data
        const percentageData = calculateMengePercentage(filteredMengeData);  // Calculate percentage distribution

        // Render the chart with the calculated percentage data
        renderMengeVerteilungChart(percentageData);
    }

    // Attach event listeners to the date inputs for the MengeVerteilung chart
    startDateInput.addEventListener('change', updateMengeVerteilungChart);
    endDateInput.addEventListener('change', updateMengeVerteilungChart);

    // Initialize the chart with all available data by default
    const fullMengeData = getMengeVerteilungData();
    const percentageData = calculateMengePercentage(fullMengeData);  // Calculate percentage distribution
    renderMengeVerteilungChart(percentageData);  // Render chart with full data by default
});
