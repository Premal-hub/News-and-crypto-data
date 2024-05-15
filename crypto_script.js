// Function to fetch historical price data based on UUID and time period
function fetchHistoricalPriceData(uuid, timePeriod) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://coinranking1.p.rapidapi.com/coin/${uuid}/history?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=${timePeriod}`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e10633c85dmshc176d7da0eb4a4ep12d5afjsnfce4af958ab8',
            'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
        }
    };

    return $.ajax(settings);
}

// Function to display cryptocurrency data
function displayCryptoData(data) {
    const cryptoDataContainer = document.getElementById('cryptoData');

    data.data.coins.forEach(coin => {
        const row = document.createElement('tr');

        const uuidCell = document.createElement('td');
        uuidCell.textContent = coin.uuid;

        const symbolCell = document.createElement('td');
        symbolCell.innerHTML = `<img src="${coin.iconUrl}" alt="${coin.name}" width="50" height="50">`;

        const nameCell = document.createElement('td');
        nameCell.textContent = coin.name;

        const marketCapCell = document.createElement('td');
        marketCapCell.textContent = coin.marketCap;

        const priceCell = document.createElement('td');
        priceCell.textContent = coin.price;

        const listedAtCell = document.createElement('td');
        listedAtCell.textContent = coin.listedAt;

        const changeCell = document.createElement('td');
        changeCell.textContent = coin.change;

        // Apply color based on change
        if (parseFloat(coin.change) > 0) {
            changeCell.classList.add('positive-change');
        } else if (parseFloat(coin.change) < 0) {
            changeCell.classList.add('negative-change');
        }

        const arrowCell = document.createElement('td');
        arrowCell.classList.add('arrow');
        arrowCell.textContent = '▼';

        // Additional space for chart and dropdown
        const additionalInfo = document.createElement('tr');
        additionalInfo.classList.add('additional-info');
        const chartCell = document.createElement('td');
        chartCell.setAttribute('colspan', '7'); // Adjusted colspan to remove the Rank column
        chartCell.classList.add('chart-container');
        additionalInfo.appendChild(chartCell);
        const dropdownCell = document.createElement('td');
        dropdownCell.setAttribute('colspan', '7'); // Adjusted colspan to remove the Rank column
        dropdownCell.classList.add('dropdown');
        additionalInfo.appendChild(dropdownCell);

        // Toggle additional info on arrow click
        arrowCell.addEventListener('click', async function() {
            if (!this.classList.contains('arrow-expanded')) {
                this.parentNode.parentNode.insertBefore(additionalInfo, this.parentNode.nextSibling);

                // Dropdown for time period selection
                const dropdownHTML = `
                    <select class="time-period-dropdown">
                        <option value="3h">3 hours</option>
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                        <option value="30d">30 days</option>
                        <option value="3m">3 months</option>
                        <option value="1y">1 year</option>
                        <option value="3y">3 years</option>
                        <option value="5y">5 years</option>
                    </select>
                    <button class="update-button">Update</button>
                `;
                dropdownCell.innerHTML = dropdownHTML;

                const response = await fetchHistoricalPriceData(coin.uuid, '24h');
                createChart(chartCell, response.data.history);

                this.classList.add('arrow-expanded');
            } else {
                additionalInfo.remove();
                this.classList.remove('arrow-expanded');
            }
        });

        row.appendChild(uuidCell);
        row.appendChild(symbolCell);
        row.appendChild(nameCell);
        row.appendChild(marketCapCell);
        row.appendChild(priceCell);
        row.appendChild(listedAtCell);
        row.appendChild(changeCell);
        row.appendChild(arrowCell);

        cryptoDataContainer.appendChild(row);
    });
}


// Function to create chart
function createChart(container, data) {
    const prices = data.map(item => item.price);
    const blankDates = Array.from({ length: data.length }, () => '');

    const chartOptions = {
        chart: {
            type: 'line',
            height: 300,
            width: '100%',
        },
        series: [{
            name: 'Price',
            data: prices,
        }],
        xaxis: {
            categories: blankDates, // Use blank dates for x-axis
        },
    };

    const chart = new ApexCharts(container, chartOptions);
    chart.render();
}

// Fetch data from API
const settings = {
    async: true,
    crossDomain: true,
    url: 'https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0',
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'e10633c85dmshc176d7da0eb4a4ep12d5afjsnfce4af958ab8',
        'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
    }
};

$.ajax(settings).done(function (response) {
    displayCryptoData(response);
});

// Event listener for dropdown change
$(document).on('change', '.time-period-dropdown', async function() {
    const selectedTimePeriod = $(this).val();
    const chartContainer = $(this).closest('.additional-info').find('.chart-container')[0];
    const uuid = $(this).closest('tr').find('td')[0].textContent;

    const response = await fetchHistoricalPriceData(uuid, selectedTimePeriod);
    chartContainer.innerHTML = ''; // Clear previous chart
    createChart(chartContainer, response.data.history);
});

// Event listener for update button click
$(document).on('click', '.update-button', async function() {
    const selectedTimePeriod = $(this).siblings('.time-period-dropdown').val();
    const chartContainer = $(this).closest('.additional-info').find('.chart-container')[0];
    const uuid = $(this).closest('tr').prev().find('td')[0].textContent;

    const response = await fetchHistoricalPriceData(uuid, selectedTimePeriod);
    chartContainer.innerHTML = ''; // Clear previous chart
    createChart(chartContainer, response.data.history);
});
