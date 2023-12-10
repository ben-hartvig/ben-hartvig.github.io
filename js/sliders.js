/// Create popularity vis slider
function CreatePopVisSlider() {
    const slider = document.getElementById('yearRangeSlider');
    noUiSlider.create(slider, {
        start: [1900, 2019],
        connect: true,
        step: 1,
        range: {
            'min': 1900,
            'max': 2020
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return Number(value);
            }
        }
    });

    slider.noUiSlider.on('update', function (values, handle) {
        let startYear = parseInt(values[0]);
        let endYear = parseInt(values[1]);
        popularityVis.filterByYearRange(startYear, endYear);
    });
}

/// Create world map slider
function CreateWorldMapSlider() {
    // World Map Slider
    const mapSlider = document.getElementById('mapYearRangeSlider');
    noUiSlider.create(mapSlider, {
        start: [2014, 2023],
        connect: true,
        step: 1,
        range: {
            'min': 2014,
            'max': 2023
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return Number(value);
            }
        },
        tooltips: [
            {
                to: value => Math.round(value),
                from: value => value
            },
            {
                to: value => Math.round(value),
                from: value => value
            }
        ],
    });

    mapSlider.noUiSlider.on('update', function (values, handle) {
        worldMapVis.minYear = parseInt(values[0]);
        worldMapVis.maxYear = parseInt(values[1]);
        worldMapVis.wrangleData();
    });
}