// Global variables
let worldMapVis,
    bostonWorldMapVis,
    pieChart,
    bostonPieChart,
    myStackedBar,
    myDotVis,
    marathonMapVis,
    networkVis,
    popularityVis,
    factVis;

// Color Palette for Marathons
const BostonColor = '#69c25f';
const LondonColor = '#c29628';
const NewYorkColor = '#c23d93';
const BerlinColor = '#08a9e0';
const ChicagoColor = '#5c35c2';
const TokyoColor = '#c25f5f';

// Color Palette for Sexes
const MaleColor = '#92bae8';
const FemaleColor = '#6e4366';

// Coordinates for Course Map
let cities = {
    Hopkinton: [42.2287, -71.5226],
    Ashland: [42.2580, -71.4634],
    Framingham: [42.2773, -71.4162],
    Natick: [42.2830, -71.3468],
    Wellesley: [42.2968, -71.2924],
    Newton: [42.3370, -71.2092],
    Brookline: [42.3420, -71.1212],
    Boston: [42.3510, -71.0810]
};

// Load data using promises
let promises = [
    d3.csv("data/combined_correct_london.csv"),
    d3.json("data/countries.geojson"),
    d3.csv("data/boston_iso_countries.csv"),
    d3.json("data/boston_marathon.geojson"),
    d3.csv("data/Boston_Field_Size.csv"),
    d3.csv('data/Top_3_Combined.csv'),
    d3.csv('data/iso3.csv'),
    d3.csv('data/boston_counts.csv'),
    d3.csv('data/all_counts.csv'),
    d3.csv('data/facts.csv'),
    d3.csv('data/winners.csv')
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// Initialize the visualizations
function initMainPage(allDataArray) {

    pieChart = new PieChart('pieChartDiv', 'all', 'boston');
    bostonPieChart = new PieChart('bostonPieChartDiv', 'all', 'boston');
    worldMapVis = new MapVis('mapDiv', allDataArray[8], allDataArray[1], 'topHundred', 'all', pieChart, '#FFCCCB', '#C54644');
    bostonWorldMapVis = new MapVis('bostonWorldMapDiv', allDataArray[7], allDataArray[1], 'all', 'boston', bostonPieChart, '#d0daf6', '#162f77');
    myDotVis = new DotVis('dotDiv', allDataArray[0], allDataArray[2]);
    myStackedBar = new StackedBar('stackedBar', allDataArray[5], allDataArray[6], 'stackedBarLegend');
    networkVis = new NetworkVis("network-vis", allDataArray[0]);
    marathonMapVis = new MarathonMapVis('route-map', 'data/boston_marathon.geojson', cities);
    popularityVis = new PopularityVis('popularity-chart', allDataArray[4]);
    factVis = new FactVis('fact-vis', allDataArray[9], popularityVis);

    // Popularity Vis Slider
    CreatePopVisSlider();

    // World Map Slider
    CreateWorldMapSlider();

    // Observe section 2 to update the course map
    observeSection2();

    // Append the table HTML to the #winnersTable div
    document.getElementById('winnersTable').innerHTML = createWinnersTable(allDataArray[10]);
}

// Idk that this is used but I don't wanna break anything lol
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
