class PieChart {

    constructor(parentElement, dataType, marathonType) {
        this.parentElement = parentElement;
        this.dataType = dataType;
        this.marathonType = marathonType;
        this.countryData = null;
        this.countryName = null;
        this.marathonArray = ['Boston', 'Chicago', 'London', 'New York'];
        this.genderArray = ['male', 'female'];

        this.highlightColor = '#FD941C'; // Set the highlight color for mouseover event

        this.displayData = [];

        this.country = null;
        this.criteria = 'sex';

        this.minYear = 2014;
        this.maxYear = 2023;
        this.marathon = 'all';

        this.marathonArray = ['Boston', 'Chicago', 'London', 'New York'];
        this.genderArray = ['male', 'female'];

        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 5, right: 5, bottom: 0, left: 5};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create group to contain pie chart
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + 40 + ")");

        // Define pie layout
        vis.pie = d3.pie()
            .value(d => d.value);

        // Define pie chart settings
        let outerRadius = Math.min(vis.width, vis.height - 40) / 2;
        let innerRadius = outerRadius/1.5;

        // Define path generator for pie segments
        vis.arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // Fill with empty data
        vis.displayData = [{value: 100, category: null, color: 'lightgrey'}]

        vis.arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData));

        // Append Paths
        vis.arcs.enter()
            .append("path")
            .attr("class", "arc")
            .merge(vis.arcs)
            .attr("d", vis.arc)
            .style("fill", 'lightgrey');

        // Add country text and initialize with use instructions
        vis.pieChartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -outerRadius - 5)
            .attr("id", "pieChartTitle")
            .attr("class", "pieChartTitle")
            .text("Click on a Country");

        // Add text for finish count
        vis.pieChartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("id", "pieChartData")
            .attr("class", "pieChartData");

        // Add text label for under finish count
        vis.pieChartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("id", "pieChartDataLabel");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieChartTooltip')
    }

    wrangleData() {
        let vis = this;
        vis.total = 0;

        // Handle the case where there is no data related to the country
        if (typeof vis.countryData === 'undefined') {
            vis.displayData = [{value: 1, category: 'none', color: 'lightgrey'}];
        }

        // Handle the case where there is data
        else {
            let cutoff = null;

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

            // Create an array of years
            vis.years = [];
            for (var i = 0; i <= vis.maxYear - vis.minYear; i++) {
                vis.years.push(i + vis.minYear);
            }


            // Handle all marathon case
            if (vis.marathonType === 'all') {
                // Display sex information
                if (vis.criteria === 'sex') {
                    let maleKeys = [];
                    vis.years.forEach(year => {
                        vis.marathonArray.forEach(marathon => {
                            maleKeys.push('male '  + marathon + ' ' + year + ' ' + cutoff);
                        })
                    })

                    let femaleKeys = [];
                    vis.years.forEach(year => {
                        vis.marathonArray.forEach(marathon => {
                            femaleKeys.push('female '  + marathon + ' ' + year + ' ' + cutoff);
                        })
                    })

                    let maleCount = maleKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);
                    let femaleCount = femaleKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);
                    vis.total = maleCount + femaleCount;

                    if (maleCount + femaleCount < 1) {
                        vis.displayData = [{value: 1, category: 'none', color: 'lightgrey'}];
                    }
                    else {
                        vis.displayData = [{value: maleCount, category: 'Male', color: MaleColor}, {value: femaleCount, category: 'Female', color: FemaleColor}];
                    }
                }

                // Display marathon information
                else {
                    // Get boston counts
                    let bostonKeys = [];
                    vis.years.forEach(year => {
                        vis.genderArray.forEach(gender => {
                            bostonKeys.push(gender + ' Boston ' + year + ' ' + cutoff);
                        })
                    })
                    let bostonCount = bostonKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);


                    // Get chicago counts
                    let chicagoKeys = [];
                    vis.years.forEach(year => {
                        vis.genderArray.forEach(gender => {
                            chicagoKeys.push(gender + ' Chicago ' + year + ' ' + cutoff);
                        })
                    })
                    let chicagoCount = chicagoKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);

                    // Get london counts
                    let londonKeys = [];
                    vis.years.forEach(year => {
                        vis.genderArray.forEach(gender => {
                            londonKeys.push(gender + ' London ' + year + ' ' + cutoff);
                        })
                    })
                    let londonCount = londonKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);

                    // Get new york counts
                    let nyKeys = [];
                    vis.years.forEach(year => {
                        vis.genderArray.forEach(gender => {
                            nyKeys.push(gender + ' New York ' + year + ' ' + cutoff);
                        })
                    })
                    let nyCount = nyKeys.reduce((acc, key) => acc + +vis.countryData[key], 0);

                    // Store total count
                    vis.total = bostonCount + chicagoCount + londonCount + nyCount;

                    if (vis.total < 1) {
                        vis.displayData = [{value: 1, category: 'none', color: 'lightgrey'}];
                    }
                    else {
                        vis.displayData = [{value: bostonCount, category: 'Boston', color: BostonColor}, {value: chicagoCount, category: 'Chicago', color: ChicagoColor},
                            {value: londonCount, category: 'London', color: LondonColor}, {value: nyCount, category: 'New York', color: NewYorkColor}];
                    }
                }
            }

            // Handle boston 2019 case
            else {
                const maleCount = +vis.countryData['male ' + cutoff]
                const femaleCount = +vis.countryData['female ' + cutoff]
                vis.total = maleCount + femaleCount;

                if (maleCount + femaleCount < 1) {
                    vis.displayData = [{value: 1, category: 'none', color: 'lightgrey'}];
                }
                else {
                    vis.displayData = [{value: maleCount, category: 'Male', color: MaleColor}, {value: femaleCount, category: 'Female', color: FemaleColor}];
                }
            }
        }
        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        // Bind data
        vis.arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData));

        // Append Paths
        vis.arcs.enter()
            .append("path")
            .attr("class", "arc")
            .merge(vis.arcs)
            .on('mouseover', function(event, d){

                // If there is no data being displayed, do nothing on mouseover
                if (d.data.category === 'none') {
                    return;
                };

                // Change to highlight color
                d3.select(this).style("fill", vis.highlightColor);

                // Format and style the tooltip itself
                vis.tooltip
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`<div>
                                ${d.data.category} Finishes: ${d.data.value}
                            </div>`
                    )
                    .style("opacity", .9);
            })

            // Handle mouseout
            .on('mouseout', function(event, d){

                // Revert color on mouseout
                d3.select(this).style("fill", d => d.data.color);

                // Move and hide the tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            // .transition()
            // .duration(800)
            .attr("d", vis.arc)
            .style("fill", d => d.data.color);

        vis.arcs.exit().remove();

        // Update text label
        vis.pieChartGroup.select("#pieChartTitle")
            .text(vis.countryName);


        // This is done here to handle grammar case for 1 finisher
        let finisherText = '';

        if (vis.total === 1) {
            finisherText = 'Finish';
        }
        else {
            finisherText = 'Finishes';
        }

        // Update the number
        vis.pieChartGroup.select("#pieChartData")
            .text(d3.format(",")(vis.total))
            .attr("dy", "0em");

        // Update the label for the number
        vis.pieChartGroup.select("#pieChartDataLabel")
            .text(finisherText)
            .attr("dy", "2em");
    }
}