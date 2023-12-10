/* * * * * * * * * * * * * *
*          DotVis          *
* * * * * * * * * * * * * */

class DotVis {

    constructor(parentElement, combinedTopData, bostonFullData) {

        this.parentElement = parentElement;
        this.combinedTopData = combinedTopData;
        this.bostonFullData = bostonFullData;
        this.displayData = [];

        this.marathonNames = ['Boston', 'Chicago', 'New York', 'London', 'Berlin'];

        this.marathonCountries = {
            'Boston': 'USA',
            'Chicago': 'USA',
            'NewYork': 'USA',
            'London': 'GBR',
            'Berlin': 'DEU'
        }

        this.marathonColors = {
            'Boston': '#e7f8e7',
            'Chicago': '#e1d4e9',
            'NewYork': '#e9d2d2',
            'London': '#e9e8d2',
            'Berlin': '#d4e5f0'
        };

        this.marathonColorsHighlight = {
            'Boston': '#69c25f',
            'Chicago': '#5c35c2',
            'NewYork': '#c23d93',
            'London': '#c29628',
            'Berlin': '#08a9e0'
        };

        // Function to find lowest and highest values of a particular column
        function findMinMax(dataset, columnName) {
            return dataset.reduce((acc, data) => {
                const value = data[columnName];
                acc.min = Math.min(acc.min, value);
                acc.max = Math.max(acc.max, value);
                return acc;
            }, { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });
        }

        // Usage: Find lowest and highest values of the 'value' column
        const column = 'Seconds';
        const { min, max } = findMinMax(combinedTopData, column);

        // console.log(`Lowest ${column}:`, min);
        // console.log(`Highest ${column}:`, max);

        this.fastestTime = min;
        this.slowestTime = 10800;

        this.defaultRadius = 0; //MAKE DYNAMIC
        this.highlightedDemographic = 'none'; //MAKE DYNAMIC
        this.highlightedYear = '2019'; //MAKE DYNAMIC

        this.initVis()
    }

    initVis(){
        let vis = this;

        //console.log('slowest time', vis.slowestTime);
        //console.log('fastest time', vis.fastestTime);

        // margin conventions
        vis.margin = {top: 50, right: 80, bottom: 10, left: 200};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.defaultRadius = vis.height / 110;

        //console.log('vis.height', vis.height)

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Select the date slider HTML element
        let slider = document.getElementById('dotSlider');

        // Initialize and configure the NoUiSlider for time range
        /*
        noUiSlider.create(slider, {
            start: [vis.fastestTime, 10800],
            connect: true,
            step: 120,
            range: {'min': vis.fastestTime, 'max': vis.slowestTime},
            tooltips: [
                {
                    to: value => formatTime(Math.round(value)),
                    from: value => value
                },
                {
                    to: value => formatTime(Math.round(value)),
                    from: value => value
                }
            ],
            //direction: 'rtl'
        });

        // Add an event listener to detect changes in the slider values
        slider.noUiSlider.on('update', function (values, handle) {
            vis.slowestTime = parseInt(values[1]);
            vis.fastestTime = parseInt(values[0]);

            vis.wrangleData();
        });*/

        //vis.fastestTime = vis.fastestTime;
        //vis.slowestTime = 10800;

        // Initialize and configure the NoUiSlider for year selection
        noUiSlider.create(slider, {
            start: [2019],
            step: 1,
            range: {'min': [2014], 'max': [2023]},
            pips: {
                mode: 'steps',
                density: 10,
                filter: () => 1,
                format: {
                    to: value => {
                        // Darken the pips by applying a class or inline style
                        return `<span style="color: black">${value}</span>`;
                    }
                }
            }
        });

        // tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr('class', "dot-tooltip")
            .attr('id', 'dotTooltip')

        //add label for marathon
        vis.marathonNames.forEach((marathon, index) => {
            vis.svg.append('text')
                .attr('class', 'marathon-label')
                .attr('x', 0)
                .attr('y', index * vis.height / 5 + vis.height / 10 + 5)
                .attr('text-anchor', 'end')
                .style('font-size', '30px')
                .style('font-weight', 'bold')
                .style('fill', vis.marathonColorsHighlight[marathon.replace(/\s/g, '')])
                .style('fill-opacity', '0.8')
                .style('z-index', '-1')
                .text(marathon.toUpperCase());
        });


        vis.x = d3.scaleLinear()
            .domain([vis.fastestTime, vis.slowestTime])
            .range([0, vis.width]);

        // Setting up and appending x-axis
        let xAxis = d3.axisTop(vis.x)
            .tickValues(d3.range(7500, vis.slowestTime, 300)) // Tick values every 10 minutes starting from 2:00 (7200 seconds)
            .tickFormat((d) => {
                const date = new Date(null);
                date.setSeconds(d);
                const hour = date.getUTCHours();
                const formattedHour = hour < 10 ? `${hour}` : hour;
                return `${formattedHour}:${d3.timeFormat('%M')(date)}`;
            })
            .tickSizeInner(-vis.height)
            .tickSizeOuter(0);

        vis.svg.select('.x-axis').remove();

        vis.svg.append('g')
            .attr('class', 'x-axis')
            .call(xAxis)
            .attr('transform', `translate(0, 0)`)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'start')
            .attr('dx', '0.3em')
            .attr('dy', '-0.3em') // Adjust the y-coordinate to move labels to the top
            .style('font-size', '16px')
            .style('fill-opacity', '0.7');

        // Style the tick lines (vertical lines)
        vis.svg.selectAll('.x-axis line')
            .style('stroke-dasharray', '3,3') // Applying a dotted line style
            .style('stroke-width', '.5px') // Adjust stroke width as needed
            .style('z-index', '-1');

        // Hide horizontal line of the x-axis
        vis.svg.select('.x-axis').select('.domain').style('display', 'none');

        // Add label for x-axis (finish time)
        vis.svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', 50)
            .attr('y', -20) // Adjust the positioning as needed
            .attr('text-anchor', 'end')
            .style('font-size', '16px')
            .style('fill', 'black')
            .style('fill-opacity', '0.7')
            .style('font-style', 'italic') // Make the label italic
            .text('finish time'); // Add the label text

        // Append a group for the button and text
        let buttonGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2}) scale(2)`) // Scale the group
            .attr("id", "dotStartButton")
            .on("click", function() {
                buttonGroup.style("display", "none"); // Hide the group on click
            });

// Append the rectangle to the group
        buttonGroup.append("rect")
            .attr("x", -60)
            .attr("y", -32)
            .attr("width", 120)
            .attr("height", 60)
            .attr("rx", 10) // Rounding radius
            .attr("ry", 10)
            .attr("fill", "lightgray") // Changed the color to gray
            .attr("class", "startButton");

// Append the triangle symbol for play
        buttonGroup.append("polygon")
            .attr("points", "-10,-10 10,0 -10,10")
            .attr("fill", "black") // Changed the triangle color to black
            .attr("transform", "translate(0, -10)"); // Position the triangle in the center of the rectangle

// Append text to the group
        buttonGroup.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "black") // Changed the text color to black
            .style("font-size", "8px")
            .text("Click to bring in the runners!");

        const initIncrement = (10800 - vis.fastestTime) / 150;
        let increment = initIncrement;
        let currentSlowestTime = vis.fastestTime;

        function callWrangleData() {
            if (currentSlowestTime <= 10800) {
                vis.slowestTime = currentSlowestTime + 1;
                vis.wrangleData();

                // Increment slowest time for the next iteration
                currentSlowestTime += increment;
                increment += initIncrement/2;

                // Call this function again after a small delay
                setTimeout(callWrangleData, 100); // Change the delay time as needed
            }
            else {
                vis.slowestTime = 10800;
                vis.wrangleData();
            }
        }

        // Add an event listener for the button click
        document.getElementById('dotStartButton').addEventListener('click', function() {

            // Add an event listener to detect changes in the slider values
            slider.noUiSlider.on('update', function (values, handle) {
                vis.highlightedYear = parseInt(values[0]);
                vis.wrangleData();
            });

            // Add an event listener to detect changes in the attribute selector
            d3.select("#attribute-selector").on("change", function() {
                vis.highlightedDemographic = d3.select(this).property("value").toUpperCase();
                vis.updateVis();
            });

            // Add an event listener to detect changes in the year selector
            /*d3.select("#year-selector").on("change", function() {
                vis.highlightedYear = d3.select(this).property("value");
                vis.wrangleData();
            });*/

            callWrangleData();
        });
    }

    wrangleData(){
        let vis = this;

        console.log('vis.highlightedYear', vis.highlightedYear)

        let filteredData = vis.combinedTopData.filter(d => d.Year === vis.highlightedYear.toString());

        //console.log('full boston 2019 data', vis.bostonFullData);

        console.log('slowest time', vis.slowestTime);
        console.log('fastest time', vis.fastestTime);

        // sort runners by time
        /*vis.displayData = vis.bostonFullData
            .sort((a, b) => a.Seconds - b.Seconds)
            .filter(d => {
                const currentSeconds = parseInt(d.Seconds);
                const withinRange = currentSeconds >= vis.fastestTime && currentSeconds <= vis.slowestTime;
                return withinRange;
            });*/

        //let groupedData = d3.group(filteredData, (d) => d.Marathon)  // nest function allows to group the calculation per level of a factor

        //vis.displayData = groupedData;
        vis.displayData = filteredData;

        //console.log('Fastest Time:', vis.fastestTime, 'Slowest Time:', vis.slowestTime);
        //console.log('Display Data:', vis.displayData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        // Creating x scale for each marathon
        /*const xScales = {};
        marathonNames.forEach((marathon, index) => {
            const marathonData = vis.displayData.filter((d) => d.Marathon === marathon);
            xScales[marathon] = d3.scaleLinear()
                .domain(vis.fastestTime, vis.slowestTime)
                .range([0, vis.width]);
        });*/

        vis.svg.selectAll('.no-data-label').remove();



        //add text box explaining the absence of data in 2020
        if (vis.highlightedYear === 2020) {
            console.log('DISPLAYING NO DATA LABEL')
            vis.svg.append('text')
                .attr('class', 'no-data-label')
                .attr('x', vis.width / 2)
                .attr('y', vis.height / 5 - 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '24px')
                .style('font-weight', 'bold')
                .style('fill', 'black')
                .style('fill-opacity', '0.5')
                .text('Due to the COVID-19 pandemic, the 2020 Boston, Chicago, and Berlin marathons were cancelled.');
            vis.svg.append('text')
                .attr('class', 'no-data-label')
                .attr('x', vis.width / 2)
                .attr('y', vis.height / 5 + 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '24px')
                .style('font-weight', 'bold')
                .style('fill', 'black')
                .style('fill-opacity', '0.5')
                .text('New York hosted a virtual marathon, and London was held only for a small elite field.');
        }

        vis.x = d3.scaleLinear()
            .domain([vis.fastestTime, vis.slowestTime])
            .range([0, vis.width]);

        //vis.svg.selectAll('.marathon-label').remove();

        // Creating dot plots for each marathon
        vis.marathonNames.forEach((marathon, index) => {

            const beeswarm = vis.beeswarmForce()
                .x((d) => vis.x(d.Seconds))
                .y((d) => index * vis.height / 5 + vis.height / 10) // Adjust y position
                .r((d) => vis.defaultRadius
                    /*{
                        const isHighlighted = d.Country === vis.highlightedDemographic;
                        return isHighlighted ? vis.defaultRadius * 2 : vis.defaultRadius;
                    }*/
                );

            marathon = marathon.replace(/\s/g, '')

            const marathonData = vis.displayData.filter((d) => d.Marathon.replace(/\s/g, '') === marathon);
            const circles = vis.svg.selectAll(`.${marathon}-circles`).data(beeswarm(marathonData));

            circles.exit().remove();

            circles.enter()
                .append('circle')
                .attr('class', `${marathon}-circles`)
                .attr('r', 0)
                .merge(circles)
                .style('z-index', '100')
                .transition()
                .duration(500)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', (d) => d.r)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.6)
                .attr('fill', (d) => {
                    if (vis.highlightedDemographic === 'HOST') {
                        const marathonCountry = vis.marathonCountries[marathon];
                        const isSameCountry = d.data.Country === marathonCountry;
                        return isSameCountry ? vis.marathonColorsHighlight[marathon] : vis.marathonColors[marathon];
                    } else {
                        const isHighlighted = d.data.Country === vis.highlightedDemographic;
                        return isHighlighted ? vis.marathonColorsHighlight[marathon] : vis.marathonColors[marathon];
                    }
                });

            circles
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('fill', 'orange');

                    //console.log('d', d)

                    function capitalizeName(word) {
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    }

                    //if (d.FirstName && d.LastName) {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                                    <h3>${capitalizeName(d.data.First_Name)} ${capitalizeName(d.data.Last_Name)}<h3>
                                    <h4> BIB Number: ${d.data.BIB}</h4>  
                                    <h4> Country: ${d.data.Country}</h4>           
                                    <h4> Gender: ${d.data.Gender}</h4>                 
                                    <h4> Division: ${d.data.Division}</h4>
                                    <h4> Time: ${d.data.Time}</h4>
                                `);

                    //const [x, y] = d3.pointer(event);

                    //console.log('x', x);
                    //console.log('y', y);

                    //vis.tooltip.style("left", x + 20 + "px").style("top", y + "px");

                    //}
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('fill', (d) => {
                            if (vis.highlightedDemographic === 'HOST') {
                                const marathonCountry = vis.marathonCountries[marathon];
                                const isSameCountry = d.data.Country === marathonCountry;
                                return isSameCountry ? vis.marathonColorsHighlight[marathon] : vis.marathonColors[marathon];
                            } else {
                                const isHighlighted = d.data.Country === vis.highlightedDemographic;
                                return isHighlighted ? vis.marathonColorsHighlight[marathon] : vis.marathonColors[marathon];
                            }
                        });

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                });

        });



    }

    beeswarmForce() {
        let x = d => d[0];
        let y = d => d[1];
        let r = d => d[2];
        let ticks = 75;

        function beeswarm(data){
            const entries = data.map(d => {
                return {
                    x0: typeof x === "function" ? x(d) : x,
                    y0: typeof y === "function" ? y(d) : y,
                    r: typeof r === "function" ? r(d) : r,
                    data: d
                }
            });

            let dotPadding = 3;

            const simulation = d3.forceSimulation(entries)
                .force("x", d3.forceX(d => d.x0))
                .force("y", d3.forceY(d => d.y0))
                .force("collide", d3.forceCollide(d => d.r + dotPadding));

            for (let i = 0; i < ticks; i++) simulation.tick();

            return entries;
        }

        beeswarm.x = f => f ? (x = f, beeswarm) : x;
        beeswarm.y = f => f ? (y = f, beeswarm) : y;
        beeswarm.r = f => f ? (r = f, beeswarm) : r;
        beeswarm.ticks = n => n ? (ticks = n, beeswarm) : ticks;

        return beeswarm;
    }

}