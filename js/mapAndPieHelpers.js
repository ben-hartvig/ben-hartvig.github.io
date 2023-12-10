//// Criteria Change Functions ////
// Handle change in all marathon map criteria
function criteriaChange() {
    worldMapVis.dataType = document.getElementById('mapCriteriaSelector').value;
    worldMapVis.wrangleData()
}

// Handle change in boston marathon map criteria
function bostonCriteriaChange() {
    bostonWorldMapVis.dataType = document.getElementById('bostonMapCriteriaSelector').value;
    bostonWorldMapVis.wrangleData()
}

// Handle change in pie chart criteria
function updatePieChart() {
    if (pieChart.criteria === 'sex') {
        pieChart.criteria = 'marathon';
    }
    else {
        pieChart.criteria = 'sex';
    }
    pieChart.wrangleData();
}




//// Checkbox Listeners ////
// All Marathon Listeners

// Male Case
const maleCheckbox = document.getElementById('maleCheckbox')

maleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.genderArray.push('male');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.genderArray.indexOf('male');
        if (index > -1) {
            worldMapVis.genderArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Female Case
const femaleCheckbox = document.getElementById('femaleCheckbox')

femaleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.genderArray.push('female');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.genderArray.indexOf('female');
        if (index > -1) {
            worldMapVis.genderArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Map Vis Marathon Checkbox Listeners
// Boston Case
const bostonCheckbox = document.getElementById('bostonCheckbox')

bostonCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('Boston');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('Boston');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// New York Case
const nyCheckbox = document.getElementById('nyCheckbox')

nyCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('New York');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('New York');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Chicago Case
const chicagoCheckbox = document.getElementById('chicagoCheckbox')

chicagoCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('Chicago');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('Chicago');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// London Case
const londonCheckbox = document.getElementById('londonCheckbox')

londonCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        worldMapVis.marathonArray.push('London');
    } else {

        // Remove male from list of genders shown on map
        const index = worldMapVis.marathonArray.indexOf('London');
        if (index > -1) {
            worldMapVis.marathonArray.splice(index,1);
        }
    }
    worldMapVis.wrangleData();
});

// Boston Listeners

// Male Case
const bostonMaleCheckbox = document.getElementById('bostonMaleCheckbox')

bostonMaleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        bostonWorldMapVis.genderArray.push('male');
    } else {

        // Remove male from list of genders shown on map
        const index = bostonWorldMapVis.genderArray.indexOf('male');
        if (index > -1) {
            bostonWorldMapVis.genderArray.splice(index,1);
        }
    }
    bostonWorldMapVis.wrangleData();
});

// Female Case
const bostonFemaleCheckbox = document.getElementById('bostonFemaleCheckbox')

bostonFemaleCheckbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        // Add male to list of genders shown on map
        bostonWorldMapVis.genderArray.push('female');
    } else {

        // Remove male from list of genders shown on map
        const index = bostonWorldMapVis.genderArray.indexOf('female');
        if (index > -1) {
            bostonWorldMapVis.genderArray.splice(index,1);
        }
    }
    bostonWorldMapVis.wrangleData();
});