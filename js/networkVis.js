class NetworkVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.selectedMarathon = 'all';

        this.initVis();
    }



    initVis() {
        let vis = this;

        // Set margins and dimensions
        vis.margin = { top: 40, right: 120, bottom: 60, left: 120 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define the size scale, but don't set the domain yet
        vis.sizeScale = d3.scaleSqrt().range([5, 30]);

        // Initialize the simulation
        vis.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("collide", d3.forceCollide(d => vis.sizeScale(d.count || 0) + 6))
            .force("radial", d3.forceRadial(function(d) {
                return d.group === 'Marathon' ? 0 : 150;
            }, vis.width / 2, vis.height / 2).strength(0.8))
            .force("bounds", vis.forceBounds.bind(vis));

        vis.linksGroup = vis.svg.append("g").attr("class", "links-group");
        vis.nodesGroup = vis.svg.append("g").attr("class", "nodes-group");

        vis.wrangleData();
        vis.drawLegend();
    }
    drawLegend() {
        let vis = this;

        // Determine dynamic legend data based on the sizeScale domain
        const legendData = vis.sizeScale.ticks(5);

        // Determine the spacing between circles in the legend
        const spacing = 60;

        // Calculate the total width of the legend
        const legendWidth = legendData.length * spacing;

        // Find the maximum radius to align the circles at their bottom points
        const maxRadius = d3.max(legendData, d => vis.sizeScale(d));

        // Create a group for the legend below the main SVG
        const legendGroup = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right) // Set to full width
            .attr("height", maxRadius * 2 + 40)
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - legendWidth + vis.margin.left}, ${maxRadius})`);

        // Add circles to the legend
        legendGroup.selectAll(".legend-circle")
            .data(legendData)
            .enter()
            .append("circle")
            .attr("class", "legend-circle")
            .attr("cx", (d, i) => i * spacing)
            .attr("cy", d => maxRadius - vis.sizeScale(d))  // Align circles at their bottom points
            .attr("r", d => vis.sizeScale(d))
            .style("fill", "#f6905e")

        // Add labels (numbers for each tick) to the legend
        legendGroup.selectAll(".legend-label")
            .data(legendData)
            .enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", (d, i) => i * spacing)
            .attr("y", maxRadius * 2)  // Position of labels
            .text(d => d)
            .attr("text-anchor", "middle")
            .style("font-size", "10px");

        legendGroup.selectAll(".legend-tick")
            .data(legendData)
            .enter()
            .append("line")
            .attr("class", "legend-tick")
            .attr("x1", (d, i) => i * spacing)
            .attr("y1", maxRadius + 5)  // Position of tick marks
            .attr("x2", (d, i) => i * spacing)
            .attr("y2", maxRadius + 10)  // Length of tick marks
            .attr("stroke", "#888");

        legendGroup.append("line")
            .attr("x1", 0)
            .attr("y1", maxRadius + 5)
            .attr("x2", (legendData.length - 1) * spacing)
            .attr("y2", maxRadius + 5)
            .attr("stroke", "#888") // Greyish color
            .attr("stroke-width", 0.5);

        legendGroup.append("text")
            .attr("class", "legend-label")
            .attr("x", -30) // Positioned to the left of the x-axis line
            .attr("y", maxRadius + 10) // Align with the x-axis
            .text("Top 100 Finishers")
            .attr("text-anchor", "end")
            .style("font-size", "10px");
    }

    // Ensure nodes stay within the bounds of the SVG
    forceBounds() {
        let vis = this;
        vis.nodes.forEach(d => {
            d.x = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.width - vis.sizeScale(d.count || 0), d.x));
            d.y = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.height - vis.sizeScale(d.count || 0), d.y));
        });
    }

    ticked() {
        let vis = this;
        if (vis.linkElements) {
            vis.linkElements
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }
        if (vis.nodeElements) {
            vis.nodeElements
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
        if (vis.textElements) {
            vis.textElements
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y + 3);
        }
    }

    filterByMarathon(selectedMarathon) {
        let vis = this;
        vis.selectedMarathon = selectedMarathon;

        vis.svg.selectAll('.bar').remove();
        vis.svg.selectAll('.bar-label').remove();
        vis.svg.selectAll('.bar-label-group').remove();

        vis.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });

        // Check if the selected marathon is one of the specified marathons
        const showButtonMarathons = ['Boston', 'London', 'Chicago', 'Berlin', 'New York'];

        if (showButtonMarathons.includes(selectedMarathon)) {
            document.getElementById('showTop10Button').style.display = 'block';
            document.getElementById('showTop10Button').onclick = () => vis.highlightTop10Countries();
        } else {
            document.getElementById('showTop10Button').style.display = 'none';
        }

        vis.simulation
            .force("radial", d3.forceRadial(function(d) {
                return d.group === 'Marathon' ? 0 : 150;
            }, vis.width / 2, vis.height / 2).strength(0.8))
            .alpha(1) // Restart the simulation with an alpha value of 1
            .restart();

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let filteredData = this.selectedMarathon === 'all' ? vis.data : vis.data.filter(d => d.Marathon === vis.selectedMarathon);


        filteredData = filteredData.filter(d => d.Country !== null);

        //Create a unique list of marathons
        vis.marathons = Array.from(new Set(filteredData.map(d => d.Marathon)));

        //Create a unique list of countries
        vis.countries = Array.from(new Set(filteredData.map(d => d.Country)));

        //Initialize the nodes array with the marathon nodes
        vis.nodes = vis.marathons.map(marathon => {
            return { id: marathon, group: 'Marathon' };
        });

        vis.countries.forEach(country => {
            vis.nodes.push({
                id: country,
                group: 'Country',
                count: filteredData.filter(d => d.Country === country).length
            });
        });


        const initialPositions = {
            'Boston': { x: vis.width / 2, y: vis.height * 0.05},
            'Chicago': { x: vis.width * 0.1, y: vis.height * 0.4},
            'New York': { x: vis.width * 0.25, y: vis.height * 0.95},
            'London': { x: vis.width * 0.9, y: vis.height * 0.4},
            'Berlin': { x: vis.width * 0.75, y: vis.height * 0.95},
        };

        if (vis.selectedMarathon !== 'all') {
            // Reset positions for all nodes to allow for new layout
            vis.nodes.forEach(node => {
                node.fx = null;
                node.fy = null;
            });

            // Find the selected marathon node and set it to the center
            vis.nodes.forEach(node => {
                if (node.id === vis.selectedMarathon) {
                    node.fx = vis.width / 2;
                    node.fy = vis.height / 2;
                }
            });
        } else {
            // When all marathons are selected, assign initial positions
            vis.nodes.forEach(node => {
                if (node.group === 'Marathon') {
                    node.fx = initialPositions[node.id].x;
                    node.fy = initialPositions[node.id].y;
                } else {
                    // Allow country nodes to be positioned by the force simulation
                    node.fx = null;
                    node.fy = null;
                }
            });
        }
        let maxCount = d3.max(vis.data, d => d.count);

        // Update the domain of the size scale with the new max count value
        vis.sizeScale.domain([0, maxCount]);

        //Create the links between marathon nodes and country nodes
        vis.links = [];
        vis.marathons.forEach(marathon => {
            filteredData.filter(d => d.Marathon === marathon).forEach(entry => {
                vis.links.push({
                    source: marathon,
                    target: entry.Country
                });
            });
        });

        //Removing duplicate links
        vis.links = Array.from(new Map(vis.links.map(link => [JSON.stringify([link.source, link.target]), link])).values());

        //Once the data is prepared, call updateVis
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let marathonColors = {
            'Boston': '#8dae86',
            'Chicago': '#9886ae',
            'New York': '#ae8692',
            'London': '#ae9b86',
            'Berlin': '#81a3b3'
        };

        //Update the size scale domain after processing the data
        vis.sizeScale.domain([0, d3.max(vis.nodes, d => d.count || 0)]);

        vis.linkElements = vis.linksGroup.selectAll(".link")
            .data(vis.links, d => d.source.id + "-" + d.target.id);

        vis.linkElements.exit().remove();

        let enterLinks = vis.linkElements.enter().append("line")
            .attr("class", "link")
            .style("stroke-width", .3)
            .style("stroke", "#9a9a93");

        vis.linkElements = enterLinks.merge(vis.linkElements);

        //Draw the nodes (circles)
        //Here we use a function to determine the radius based on whether the node is a country or a marathon
        vis.nodeElements = vis.nodesGroup.selectAll(".node")
            .data(vis.nodes, d => d.id);

        vis.nodeElements.exit().remove();

        let enterNodes = vis.nodeElements.enter().append("circle")
            .attr("class", "node")
            .attr("r", d => d.group === 'Marathon' ? 15 : vis.sizeScale(d.count))
            .style("fill", d => {
                //Apply different colors to marathon and country nodes
                if (d.group === 'Marathon') {
                    return marathonColors[d.id]; //Specific color for marathon nodes
                } else {
                    return "#f6905e"; //Specific color for country nodes
                }
            })
            .style("stroke", "#26113f")
            .style("stroke-width", d => d.group === 'Marathon' ? 2 : 0.5)


        vis.nodeElements = enterNodes.merge(vis.nodeElements);

        vis.nodeElements.call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

        function dragStarted(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0.1).restart();

            if (d.group === 'Marathon') {
                //Increase the charge strength to push unrelated nodes further away
                vis.simulation.force("charge", d3.forceManyBody().strength(-1600));

                //Apply a strong radial force to pull connected country nodes closer
                vis.simulation.force("radial", d3.forceRadial()
                    .radius(30)
                    .x(d.x)
                    .y(d.y)
                    .strength(node => {
                        return vis.links.some(link =>
                            (link.source === d && link.target === node) ||
                            (link.target === d && link.source === node)
                        ) ? 2.5 : 0.01; //Lower strength for nodes not connected to the dragged marathon
                    })
                );
            }

            //Fix position of dragged node (for marathon nodes)
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            //Constrain the dragged position to within the bounds of the SVG
            d.fx = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.width - vis.sizeScale(d.count || 0), event.x));
            d.fy = Math.max(vis.sizeScale(d.count || 0), Math.min(vis.height - vis.sizeScale(d.count || 0), event.y));

            if (d.group === 'Marathon') {
                // If a marathon node is dragged, update the radial force center to the marathon node's new position
                vis.simulation.force("radial").x(d.fx).y(d.fy);
            }

            //Restart the simulation to apply the positional constraints
            vis.simulation.alphaTarget(0.1).restart();
        }


        function dragEnded(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0).restart();

            if (d.group === 'Marathon') {
                // Reset the charge force strength
                vis.simulation.force("charge", d3.forceManyBody().strength(-400));

                // Remove the radial force
                vis.simulation.force("radial", null);

                // Release country nodes if they are not being dragged
                vis.nodes.forEach(node => {
                    if (node.group === 'Country') {
                        node.fx = null;
                        node.fy = null;
                    }
                });
            }

            // If the node is fixed after dragging, keep its position
            d.fx = d.group === 'Marathon' ? event.x : null;
            d.fy = d.group === 'Marathon' ? event.y : null;

            // Restart the simulation to let nodes settle
            vis.simulation.alpha(1).restart();
        }

        //Labels for the nodes
        vis.textElements = vis.svg.selectAll(".node-text")
            .data(vis.nodes)
            .join("text")
            .attr("class", d => `node-text ${d.group === 'Marathon' ? 'marathon-text' : 'country-text'}`)
            .attr("dx", d => d.group === 'Marathon' ? 20 : 15)
            .attr("dy", 4)
            .text(d => d.id || "Unknown");

        vis.simulation
            .nodes(vis.nodes)
            .on("tick", () => vis.ticked());

        vis.simulation.force("link")
            .links(vis.links);

        vis.simulation.alpha(1).restart();
    }

    highlightTop10Countries() {
        let vis = this;

        let filteredData = vis.data
            .filter(d => d.Marathon === vis.selectedMarathon && d.Country !== null)
            .sort((a, b) => a.Seconds - b.Seconds);

        // Sort countries by the lowest seconds and get the top 10
        let topCountryRunners = {};
        filteredData.forEach(d => {
            // If the country hasn't been added yet, add the runner
            if (!topCountryRunners[d.Country]) {
                topCountryRunners[d.Country] = d;
            }
        });

        let topCountriesData = Object.values(topCountryRunners).slice(0, 10);
        let topCountries = topCountriesData.map(d => d.Country);

        // Set the fixed positions for top countries and marathon node
        let marathonNode = vis.nodes.find(d => d.id === vis.selectedMarathon && d.group === 'Marathon');
        if (marathonNode) {
            marathonNode.fx = 200;
            marathonNode.fy = vis.height / 2; // Slightly offset from the top
        }

        // Calculate vertical spacing for top countries
        let spacing = (vis.height - 100) / (topCountries.length - 1.5);

        vis.nodes.forEach(node => {
            if (node.group === 'Country') {
                if (topCountries.includes(node.id)) {
                    let index = topCountries.indexOf(node.id);
                    node.fx = vis.width / 2;
                    node.fy = 100 + (index * spacing); // Align vertically below the marathon node
                } else {
                    // Release other countries not in top 10
                    node.fx = null;
                    node.fy = null;
                }
            }
        });

        vis.simulation
            .force("radial", d3.forceRadial(function(d) {
                return topCountries.includes(d.id) ? 0 : 150;
            }, marathonNode.fx, marathonNode.fy).strength(0.8))
            .alpha(1)
            .restart();

        // Update the bar rectangles for the top 10 countries
        vis.svg.selectAll('.bar').remove();
        vis.svg.selectAll('.bar-label').remove();
        vis.svg.selectAll('.bar-label-group').remove();

        let barWidthMultiplier = 2.8;

        topCountriesData.forEach((d, i) => {
            let countryNode = vis.nodes.find(node => node.id === d.Country);
            if (countryNode) {
                countryNode.fy = 40 + (i * spacing);

                // Append a rectangle for the bar at the node's new position
                let barWidth = d.Seconds / 100 * barWidthMultiplier;
                let bar = vis.svg.append('rect')
                    .attr('class', 'bar')
                    .attr('x', countryNode.fx + 80)
                    .attr('y', countryNode.fy - 5) // Use the node's new y position
                    .attr('width', 0)
                    .attr('height', 10)
                    .attr('fill', '#88a4a2');

                bar.transition()
                    .duration(1200)
                    .attr('width', barWidth);

                // Create group for text to unify labels
                let textGroup = vis.svg.append('g')
                    .attr('class', 'bar-label-group')
                    .attr('transform', `translate(${countryNode.fx + 80 + barWidth + 10}, ${countryNode.fy + 4})`);

                // Append text for the seconds
                textGroup.append('text')
                    .text(d.Time)
                    .attr('fill', 'black')
                    .style('font-size', '13px')
                    .style('font-weight', 'bold')
                    .style('text-anchor', 'start');

                let secondsWidth = textGroup.node().getBBox().width;

                textGroup.append('text')
                    .attr('x', secondsWidth + 10)
                    .text(d.Last_Name.toUpperCase() + ",")
                    .attr('fill', 'black')
                    .style('font-size', '12px')
                    .style('text-anchor', 'start');

                let lastNameWidth = textGroup.node().getBBox().width - secondsWidth; // Calculate the width after appending last name
                textGroup.append('text')
                    .attr('x', secondsWidth + lastNameWidth + 5)
                    .text(d.First_Name.toUpperCase())
                    .attr('fill', 'black')
                    .style('font-size', '12px')
                    .style('text-anchor', 'start');

                let fullNameWidth = textGroup.node().getBBox().width - secondsWidth - lastNameWidth; // Calculate the width after appending full name
                textGroup.append('text')
                    .attr('x', secondsWidth + lastNameWidth + fullNameWidth + 10) // Add some space after full name
                    .text(d.Year)
                    .attr('fill', 'black')
                    .style('font-size', '10px')
                    .style('text-anchor', 'start');
            }
        });
        vis.simulation.alpha(1).restart();

    }
}