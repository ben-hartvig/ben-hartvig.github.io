class MapVis {

    constructor(parentElement, hundredData, geoData, dataType, marathonType, associatedPieChart, minColor, maxColor) {
        this.parentElement = parentElement;
        this.hundredData = hundredData;
        this.geoData = geoData;
        this.dataType = dataType;
        this.marathonType = marathonType;
        this.pieChart = associatedPieChart;

        this.minYear = 2014;
        this.maxYear = 2023;
        this.marathon = 'all';

        this.minColor = minColor;
        this.maxColor = maxColor;
        this.backgroundColor = '#F6F6F6';

        this.marathonArray = ['Boston', 'Chicago', 'London', 'New York'];
        this.genderArray = ['male', 'female'];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        let scaleFactor = Math.min(vis.height / 610, vis.width / 965);

        // Create projection
        vis.projection = d3.geoEquirectangular()
            // .translate([vis.width / 2, vis.height / 2])
            .translate([vis.width / 2, vis.height / 2])
            .scale(scaleFactor * 150);

        // Define geo generator and pass in projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.countries = vis.svg.selectAll("path")
            .data(vis.geoData.features)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .style('stroke', 'grey')
            .style('stroke-opacity', '0.5');

        // Handle legend
        vis.legendHeight = 20;
        vis.legendWidth = 200;

        // Create continuous color scale gradient for legend
        vis.gradient = vis.svg.append("defs")
            .append("linearGradient")
            .attr("id", vis.marathonType + "-color-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        // Create a svg rectangle to display gradient
        vis.gradientRect = vis.svg.append("rect")
            .attr("width", vis.legendWidth)
            .attr("height", vis.legendHeight)
            .style("fill", "url(#" + this.marathonType + "-color-gradient)")
            .attr("x", 10);

        // Update the color bar gradient
        vis.gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", vis.minColor);

        vis.gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", vis.maxColor);

        // Initialize color scale
        vis.colorScale = d3.scaleLinear();

        // Create a scale for the legend axis
        vis.legendScale = d3.scaleLinear()
            .range([0, vis.legendWidth]);

        // Initialize the legend axis
        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale);

        vis.svg.append("g")
            .attr("class", "legend-axis axis")
            .attr("transform", "translate(" + (10) + "," + (vis.legendHeight) + ")");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "largeTooltip")
            .attr('id', 'mapTooltip');


        // Create markers on the map for each marathon location
        const markerSize = 5;
        DrawMarkers(vis, markerSize);

        vis.wrangleData()
    }


    wrangleData() {
        let vis = this;

        vis.displayData = [];

        // Set the number of data points to be included based on what user has selected
        let cutoff = 1;

        if (vis.dataType === 'winner') {
            cutoff = 1;
        }
        else if (vis.dataType === 'topThree') {
            cutoff = 3;
        }
        else if (vis.dataType === 'topHundred') {
            cutoff = 100;
        }
        else if (vis.marathonType === 'all') {
            cutoff = 100;
        }
        else {
            cutoff = 'all';
        }

        // All marathon case
        if (vis.marathonType === 'all') {

            // Create array of active years
            vis.years = [];
            for (var i = 0; i <= vis.maxYear - vis.minYear; i++) {
                vis.years.push(i + vis.minYear);
            }

            // Get the relevant keys
            let relevantKeys = [];
            vis.years.forEach(year => {
                vis.marathonArray.forEach(marathon => {
                    vis.genderArray.forEach(gender => {
                        relevantKeys.push(gender + ' '  + marathon + ' ' + year + ' ' + cutoff);
                    })
                })
            })


            // Sum over each year and marathon
            vis.displayData = vis.hundredData.reduce((acc, current) => {
                let sum = relevantKeys.reduce((keySum, key) => keySum + +current[key], 0);

                acc[current.Country] = sum;
                return acc;
            }, {});
        }

        // Boston Marathon Case
        else if (vis.marathonType === 'boston') {

            // Get the relevant keys
            let relevantKeys = [];
            vis.genderArray.forEach(gender => {
                relevantKeys.push(gender + ' ' + cutoff);
            })

            // Sum over each year and marathon
            vis.displayData = vis.hundredData.reduce((acc, current) => {
                let sum = relevantKeys.reduce((keySum, key) => keySum + +current[key], 0);

                acc[current.Country] = sum;
                return acc;
            }, {});
        };

        vis.updateVis()
    }
//
    updateVis() {
        let vis = this;

        // Update color scale
        vis.colorScale
            .range([vis.minColor, vis.maxColor])
            .domain([1, d3.max(Object.values(vis.displayData))]);

        // Update legend scale domain
        vis.legendScale.domain([1, d3.max(Object.values(vis.displayData))]);

        // Update the legend axis ticks
        let totalTicks = 2;
        if (d3.max(Object.values(vis.displayData)) < totalTicks) {
            totalTicks = d3.max(Object.values(vis.displayData));
        }

        vis.legendAxis
            .tickValues([vis.legendScale.domain()[0], vis.legendScale.domain()[1]]);

        // Display the axis
        vis.svg.select(".legend-axis")
            .transition()
            .duration(800)
            .call(vis.legendAxis);

        // Update the color gradient for the legend
        d3.select('#color-gradient').selectAll("stop")
            .data([vis.minColor, vis.maxColor])
            .attr("style", function (d, i) {
                return "stop-color:" + d;
            });

        // Update the colors
        vis.countries
            // Update states color based on number of winners
            .attr("fill", d => {
                // let match = vis.displayData.find(obj => obj === d.properties.ISO_A3);
                let match = vis.displayData[d.properties.ISO_A3];
                if (match) {
                    return vis.colorScale(match);
                }
                // Handle case where there is not data
                else {
                    return vis.backgroundColor;
                }
            })

            //// Tooltip ////

            // Handle mouseover
            .on('mouseover', function(event, d){
                let match = vis.displayData[d.properties.ISO_A3];

                // Handle case where there is no data
                if (isNaN(match)) {
                    match = 0;
                }

                // Get plaintext name
                let countryName = d.properties.ADMIN;

                d3.select(this)
                    .classed('highlighted', true); // Change color/other features for higlighting


                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>${countryName}</h4>
                                Finishers: ${d3.format(',')(match)}
                            </div>`
                    )
                    .style("opacity", .9);
            })

            // Handle mouseout
            .on('mouseout', function(event, d){
                d3.select(this)
                    .classed('highlighted', false); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

            // Handle click
            .on("click", function(event, d) {
                vis.pieChart.countryData = vis.hundredData.find(obj => obj.Country === d.properties.ISO_A3);
                vis.pieChart.countryName = d.properties.ADMIN;
                vis.pieChart.dataType = vis.dataType;
                vis.pieChart.minYear = vis.minYear;
                vis.pieChart.maxYear = vis.maxYear;
                vis.pieChart.marathonType = vis.marathonType;
                document.getElementById('pieChartTitle').innerText = d.properties.ADMIN;
                vis.pieChart.wrangleData();
            });

    }
}

function DrawMarkers(vis, markerSize) {
    // Draw marker for Boston
    const bostonCoords = [-71.0589, 42.3601];
    const bostonMarker = vis.svg.append("g").attr("class", "markers-group");
    bostonMarker.append("circle")
        .attr("cx", vis.projection(bostonCoords)[0])
        .attr("cy", vis.projection(bostonCoords)[1])
        .attr("r", markerSize)
        .attr("class", "worldMapMarker")
        .style("fill", BostonColor)
        .on('mouseover', function(event, d){
            d3.select(this)
                .style('fill', '#FD941C'); // Change color/other features for higlighting

            // Format and style the tooltip itself
            vis.tooltip
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`<div>
                                <h4>Boston, Massachusetts</h4>
                                <p>Home of the Boston Marathon</p>
                            </div>`
                )
                .style("opacity", .9);
        })
        .on('mouseout', function(event, d){
            d3.select(this)
                .style('fill', BostonColor); // Change color back to original

            // Move and hide the tooltip
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        });

    // If applicable, draw markers for other cities
    if (vis.marathonType === 'all') {

        // New York Marker
        const nyCoords = [-74.0060, 40.7128];
        const nyMarker = vis.svg.append("g").attr("class", "markers-group");
        nyMarker.append("circle")
            .attr("cx", vis.projection(nyCoords)[0])
            .attr("cy", vis.projection(nyCoords)[1])
            .attr("r", markerSize)
            .attr("class", "worldMapMarker")
            .style("fill", NewYorkColor)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .style('fill', '#FD941C'); // Change color/other features for higlighting

                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>New York, New York</h4>
                                <p>Home of the New York Marathon</p>
                            </div>`
                    )
                    .style("opacity", .9);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', NewYorkColor); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // London Marker
        const londonCoords = [-0.1276, 51.5072];
        const londonMarker = vis.svg.append("g").attr("class", "markers-group");
        londonMarker.append("circle")
            .attr("cx", vis.projection(londonCoords)[0])
            .attr("cy", vis.projection(londonCoords)[1])
            .attr("r", markerSize)
            .attr("class", "worldMapMarker")
            .style("fill", LondonColor).on('mouseover', function(event, d){
            d3.select(this)
                .style('fill', '#FD941C'); // Change color/other features for higlighting

            // Format and style the tooltip itself
            vis.tooltip
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`<div>
                                <h4>London, England</h4>
                                <p>Home of the London Marathon</p>
                            </div>`
                )
                .style("opacity", .9);
        })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', LondonColor); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Chicago Marker
        const chicagoCoords = [-87.6298, 41.8781];
        const chicagoMarker = vis.svg.append("g").attr("class", "markers-group");
        chicagoMarker.append("circle")
            .attr("cx", vis.projection(chicagoCoords)[0])
            .attr("cy", vis.projection(chicagoCoords)[1])
            .attr("r", markerSize)
            .attr("class", "worldMapMarker")
            .style("fill", ChicagoColor)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .style('fill', '#FD941C'); // Change color/other features for higlighting

                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>Chicago, Illinois</h4>
                                <p>Home of the Chicago Marathon</p>
                            </div>`
                    )
                    .style("opacity", .9);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', ChicagoColor); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Berlin Marker
        const berlinCoords = [13.4050, 52.5200];
        const berlinMarker = vis.svg.append("g").attr("class", "markers-group");
        berlinMarker.append("circle")
            .attr("cx", vis.projection(berlinCoords)[0])
            .attr("cy", vis.projection(berlinCoords)[1])
            .attr("r", markerSize)
            .attr("class", "worldMapMarker")
            .style("fill", BerlinColor)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .style('fill', '#FD941C'); // Change color/other features for higlighting

                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>Berlin, Germany</h4>
                                <p>Home of the Berlin Marathon</p>
                            </div>`
                    )
                    .style("opacity", .9);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', BerlinColor); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Tokyo Marker
        const tokyoCoords = [139.6503, 35.6762];
        const tokyoMarker = vis.svg.append("g").attr("class", "markers-group");
        tokyoMarker.append("circle")
            .attr("cx", vis.projection(tokyoCoords)[0])
            .attr("cy", vis.projection(tokyoCoords)[1])
            .attr("r", markerSize)
            .attr("class", "worldMapMarker")
            .style("fill", TokyoColor)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .style('fill', '#FD941C'); // Change color/other features for higlighting

                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                <h4>Tokyo, Japan</h4>
                                <p>Home of the Tokyo Marathon</p>
                            </div>`
                    )
                    .style("opacity", .9);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('fill', TokyoColor); // Change color back to original

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }
}