// Create winners table
function createWinnersTable(data) {
    const marathons = ['Boston', 'London', 'Chicago', 'Berlin', 'NYC'];

    // Filter data for the years from 1991 to 2018
    const filteredData = data.filter(d => parseInt(d.year) >= 1991 && parseInt(d.year) <= 2017);

    // Group data by year and then by marathon
    const groupedData = d3.group(filteredData, d => d.year);

    // Create table HTML
    let tableHTML = '<table class="table table-smaller"><thead><tr><th>Year</th>';
    marathons.forEach(marathon => {
        tableHTML += `<th>${marathon}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    const countryFlags = {
        'Kenya': '🇰🇪',
        'Ethiopia': '🇪🇹',
        'United States': '🇺🇸',
        'Japan': '🇯🇵',
        'Great Britain': '🇬🇧',
        'Germany': '🇩🇪',
        'Australia': '🇦🇺',
        'Russia': '🇷🇺',
        'Mexico': '🇲🇽',
        'Brazil': '🇧🇷',
        'Spain': '🇪🇸',
        'South Korea': '🇰🇷',
        'United Kingdom': '🇬🇧',
        'Poland': '🇵🇱',
        'China': '🇨🇳',
        'Italy': '🇮🇹',
        'Portugal': '🇵🇹',
        'Soviet Union': '🇷🇺',
        'Belgium': '🇧🇪',
        'Canada': '🇨🇦',
        'Norway': '🇳🇴',
        'South Africa': '🇿🇦',
        'Morocco': '🇲🇦',
        'Finland': '🇫🇮',
        'Eritrea': '🇪🇷',
        'Ireland': '🇮🇪',
        'Switzerland': '🇨🇭',
        'Romania': '🇷🇴',
        'Sweden': '🇸🇪',
        'Latvia': '🇱🇻'
    }

    // Function to convert country code to flag emoji
    function getFlagEmoji(country) {
        return countryFlags[country] || 'N/A'; // 'N/A' if the country code is not found
    }

    function getFlag(country) {
        return getFlagEmoji(country);
    }

    // Iterate through years and marathons to populate the table
    groupedData.forEach((yearData, year) => {
        tableHTML += `<tr><td>${year}</td>`;
        marathons.forEach(marathon => {
            const maleWinner = yearData.find(d => d.marathon === marathon && d.gender === 'Male');
            const femaleWinner = yearData.find(d => d.marathon === marathon && d.gender === 'Female');
            if (maleWinner && femaleWinner) {
                const maleCountry = maleWinner.country;
                const femaleCountry = femaleWinner.country;
                const isKenyaEthiopiaMale = (maleCountry === 'Kenya' || maleCountry === 'Ethiopia');
                const isKenyaEthiopiaFemale = (femaleCountry === 'Kenya' || femaleCountry === 'Ethiopia');

                const maleName = isKenyaEthiopiaMale ? `<span style="font-weight: bold; color: red;">${maleWinner.winner}</span>` : maleWinner.winner;
                const femaleName = isKenyaEthiopiaFemale ? `<span style="font-weight: bold; color: red;">${femaleWinner.winner}</span>` : femaleWinner.winner;

                tableHTML += `<td>${getFlag(maleWinner.country)} ${maleName}<br>${getFlag(femaleWinner.country)} ${femaleName}</td>`;
            } else {
                tableHTML += '<td></td>';
            }
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}