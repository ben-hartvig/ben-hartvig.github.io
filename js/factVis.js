class FactVis {
    constructor(parentElement, facts, popularityVisInstance) {
        this.parentElement = parentElement;
        this.facts = facts;
        this.popularityVisInstance = popularityVisInstance;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.x = d3.scalePoint()
            .range([0, vis.width])
            .domain(vis.facts.map(d => d.year))
            .padding(1);

        vis.svg.append("line")
            .attr("x1", 0)
            .attr("y1", vis.height / 2)
            .attr("x2", vis.width)
            .attr("y2", vis.height / 2)
            .attr("stroke", "rgb(38, 80, 115)");

        vis.yearGroups = vis.svg.selectAll(".year-group")
            .data(vis.facts)
            .enter().append("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${vis.x(d.year)}, ${vis.height / 2})`)
            .on("mouseover", function(event, d) {
                vis.applyHoverEffect(d, 1.3);  // hoveredScale
            })
            .on("mouseout", function(event, d) {
                vis.resetHoverEffect(1);  // regularScale
            })
            .on("click", function(event, d) {
                vis.showFact(d);  // Add the click event to trigger showFact
            });

        vis.yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("r", 20)
            .style("fill", "#8dae86");

        vis.yearGroups.append("text")
            .attr("class", "year-text")
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .text(d => d.year)
            .style("user-select", "none")
            .style("fill", "white")
            .style("font-weight", "bold");

    }
    applyHoverEffect(d, scale) {
        let vis = this;

        // Scale up the hovered group (both circle and text) and change color
        vis.yearGroups.filter(group => group.year === d.year)
            .select(".year-circle")
            .transition()
            .attr("r", 30 * scale)
            .style("fill", "rgb(38, 80, 115)");  // Change color on hover

        vis.yearGroups.filter(group => group.year === d.year)
            .select(".year-text")
            .transition()
            .style("font-size", "19px");

        // Scale down all other groups and reset color
        vis.yearGroups.filter(group => group.year !== d.year)
            .select(".year-circle")
            .transition()
            .attr("r", 15 * (1 / scale))
            .style("fill", "#8dae86");  // Reset color for other circles

        vis.yearGroups.filter(group => group.year !== d.year)
            .select(".year-text")
            .transition()
            .style("font-size", "7px");
    }

    resetHoverEffect(scale) {
        let vis = this;

        vis.yearGroups.select(".year-circle")
            .transition()
            .attr("r", 20)
            .style("fill", "#8dae86");

        // Reset all texts to regular size within each group
        vis.yearGroups.select(".year-text").transition().style("font-size", "13px");
    }

    showFact(d) {
        let vis = this;
        vis.selectedYear = +d.year;
        let baseStartYear = vis.selectedYear - 4;
        let baseEndYear = vis.selectedYear + 4;
        let rangeStart = Math.max(baseStartYear, 1986);
        let rangeEnd = Math.min(baseEndYear, 2019);

        if (rangeEnd - rangeStart < 8) {
            rangeEnd = Math.min(rangeStart + 8, 2019);
        }
        if (rangeEnd - rangeStart < 8) {
            rangeStart = Math.max(rangeEnd - 8, 1986);
        }

        console.log("Range Start:", rangeStart, "Range End:", rangeEnd);
        vis.popularityVisInstance.filterByYearRange(rangeStart, rangeEnd);

        vis.yearGroups.filter(group => group.year === d.year)
            .select(".year-circle").attr("r", 100);

        vis.yearGroups.filter(group => group.year === d.year)
            .transition()
            .attr("transform", `translate(50, ${vis.height / 2})`);

        vis.yearGroups.filter(group => group.year !== d.year)
            .transition().style("opacity", 0);

        vis.yearGroups.filter(group => group.year === d.year)
            .transition()
            .attr("transform", `translate(200, ${vis.height / 2})`)
            .select(".year-circle").attr("r", 100);

        let fileExtension = FactVis.getFileExtension(d.year);
        console.log("Year: " + d.year + ", File Extension: " + fileExtension); // Add this line

        let imageWidth = 300;
        let imageHeight = 300;
        let imageX = 250; // Adjust the X position as needed
        let lineCenterY = vis.height / 2;
        let imageY = lineCenterY - (imageHeight / 2); // Center vertically to the line

        vis.svg.append("image")
            .attr("xlink:href", `img/${d.year}${FactVis.getFileExtension(d.year)}`)
            .attr("x", imageX)
            .attr("y", imageY)
            .attr("width", imageWidth)
            .attr("height", imageHeight)
            .attr("class", "year-image");

        let backButton = vis.svg.append("g")
            .attr("class", "time-back-button")
            .attr("transform", `translate(${vis.width / 2 - 30}, ${vis.height / 2 + 100})`)
            .on("click", function() { vis.resetView(); });

        backButton.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 60)
            .attr("height", 30)
            .attr("rx", 15)
            .attr("class", "time-back-button-rect");

        backButton.append("text")
            .attr("x", 15) // Center text horizontally
            .attr("y", 20) // Center text vertically
            .text("Back")
            .attr("class", "time-back-button-text");

        backButton.on("mouseover", function() {
            d3.select(this).transition().duration(200).attr("transform", `translate(${vis.width / 2 - 30}, ${vis.height / 2 + 100}) scale(1.4)`);
        }).on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("transform", `translate(${vis.width / 2 - 30}, ${vis.height / 2 + 100})`);
        });

        let maxTextBoxWidth = vis.width - (imageX + imageWidth + 20);
        let textBoxWidth = Math.min(maxTextBoxWidth, 650);
        let textBoxX = imageX + imageWidth + 150;
        let textBoxHeight = vis.calculateTextBoxHeight(d.fact);
        let textBoxY = vis.height / 2 - textBoxHeight / 2;
        let initialHeight = 500; // Set an initial height
        let foreignObject = vis.svg.append("foreignObject")
            .attr("x", textBoxX)
            .attr("y", textBoxY)
            .attr("width", textBoxWidth)
            .attr("height", initialHeight)
            .attr("class", "fact-foreign-object");

        let textBoxDiv = foreignObject.append("xhtml:div")
            .style("background-color", "rgb(239, 71, 111)")
            .style("color", "white")
            .style("border", "1px solid black")
            .style("padding", "10px")
            .style("font-size", "14px")
            .style("overflow-y", "auto")
            .html(d.fact);

        // After appending the text, adjust the height based on the actual content
        setTimeout(() => {
            let actualHeight = textBoxDiv.node().getBoundingClientRect().height;
            foreignObject.attr("height", actualHeight);
            let newY = vis.height / 2 - actualHeight / 2;
            foreignObject.attr("y", newY);
        }, 0);

        vis.popularityVisInstance.selectedYear = vis.selectedYear;
        vis.popularityVisInstance.updateVis();
    }

    resetView() {
        let vis = this;

        // Reset all circles and texts to original state
        vis.yearGroups.transition().style("opacity", 1)
            .attr("transform", d => `translate(${vis.x(d.year)}, ${vis.height / 2})`)
            .select(".year-circle").attr("r", 20);

        // Remove the image and back button
        vis.svg.selectAll(".year-image, .time-back-button").remove();
        vis.svg.selectAll(".fact-foreign-object").remove();

        vis.popularityVisInstance.resetToFullRange();

        vis.popularityVisInstance.selectedYear = null; // or a year that will not match any data
        vis.popularityVisInstance.updateVis();

    }
    static getFileExtension(year) {
        console.log("Received year in getFileExtension: ", year); // Debug log
        year = Number(year); // Ensure year is a number

        switch(year) {
            case 2003:
            case 2004:
                return '.gif';
            case 2000:
            case 2008:
            case 2012:
                return '.jpeg';
            default:
                return '.jpg';
        }
    }
    calculateTextBoxHeight(text) {
        let tempDiv = d3.select("body").append("div")
            .attr("class", "tooltip-temp") // Make sure to define this class in your CSS with the required styling
            .style("visibility", "hidden")
            .html(text);

        let height = tempDiv.node().getBoundingClientRect().height;

        tempDiv.remove();

        return height;
    }
}