var formatNumber = d3.format(",");
var formatDecimalNumber = d3.format(".2f");

// Define the dimensions of your visualization
const margin = {top: 40, right: 10, bottom: 70, left: 65},
width = 1200 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;


// Load your data
var file_url = "https://raw.githubusercontent.com/partha1022/narrative_visualization/main/COVID_19_TOP_COUNTRIES.csv"


function createScene1() {
    d3.select("#visualization-scene1").select("svg").remove();
    // Define scales
    var xScale = d3.scaleLog().base(10).range([0, width]);
    var yScale = d3.scaleLog().base(10).range([height, 0]);

    // Define the line generator
    var line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.total_cases));

    var tooltip = d3.select("#visualization-scene1").append("div")   
                    .attr("class", "tooltip")               
                    .style("opacity", 0);

    // Create the SVG container
    var svg = d3.select("#visualization-scene1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load your data
    d3.csv(file_url).then(data => {
        // Parse numbers
        data.forEach(d => {
            d.total_cases = +d.total_cases;
            d.total_deaths = +d.total_deaths;
            d.total_deaths_per_million = +d.total_deaths_per_million;
        });

        var dataByCountry = Array.from(
            d3.rollup(
                data,
                v => ({total_cases: d3.max(v, d => d.total_cases), 
                        total_deaths: d3.max(v, d => d.total_deaths),
                        total_deaths_per_million: d3.max(v, d => d.total_deaths_per_million)}),
                d => d.location
            ),
            ([key, value]) => (value.location = key, value)
        );        

        xScale.domain([3000000, d3.max(dataByCountry, d => d.total_cases)]);
        yScale.domain([40000, d3.max(dataByCountry, d => d.total_deaths)]);

        //console.log(dataByCountry)
        
        // Add the points to the SVG
        svg.append("g").selectAll("circle")
        .data(dataByCountry)
        .enter().append("circle")
            .attr("r", 7)
            .attr("cx", d => xScale(d.total_cases))
            .attr("cy", d => yScale(d.total_deaths))
            .style("fill", "steelblue")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
            })
            .on("mousemove", (event, d) => {
                //console.log(d.location)
                //console.log(d.total_deaths_per_million)
                tooltip.html("Country: " + d.location + "<br/>Total Cases: " + formatNumber(d.total_cases)
                    + "<br/>Total Deaths: " + formatNumber(d.total_deaths) + "<br/>Total Deaths/million: " + 
                    formatNumber(d.total_deaths_per_million))
                    .style("left", (event.x+25) + "px")
                    .style("top", (event.y) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add the x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.format("~s")));

        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format("~s")));

        // Define your annotations
        var annotations = [{
            note: {
            label: "Peru: Highest Death/million"
            },
            x: 65,
            y: 155,
            dy: -20,
            dx: 20
        }, 
        {
            note: {
            label: "USA: Highest Cases and Death"
            },
            x: 1060,
            y: -40,
            dy: 20,
            dx: -20
        }]
        
        // Add the annotation
        var makeAnnotations = d3.annotation()
            .annotations(annotations)
        
        svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(makeAnnotations)
        
        // Add labels
        // X Axis
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 20)
            .style("text-anchor", "middle")
            .text("Total Cases");
        
        // Y Axis
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Deaths");
        
        // Add Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Total Cases vs Total Deaths");


    }).catch(error => {
        //console.log(error);
        alert("An error occurred while loading the visualization.");
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Visualization scene 2

function createScene2() {
    // Create the SVG container for your visualization and append it to the #visualization div
    d3.select("#visualization-scene2").select("svg").remove();
    var svg_scene_2 = d3.select("#visualization-scene2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    d3.csv(file_url).then(data => {
        data.forEach(d => {
            d.people_vaccinated = +d.people_vaccinated;
        });

        var dataByCountry = Array.from(
            d3.rollup(
                data,
                v => ({percentage_people_vaccinated: d3.max(v, d => (d.people_vaccinated/d.population * 100))}),
                d => d.location
            ),
            ([key, value]) => (value.location = key, value)
        ); 

        // Sort the data by total cases in descending order
        var topData = dataByCountry.sort((a, b) => a.percentage_people_vaccinated - b.percentage_people_vaccinated);

        //console.log(topData)

        // Define scales
        var xScale = d3.scaleBand()
            .domain(topData.map(d => d.location))
            .range([0, width])
            .padding(0.1);

        var yScale = d3.scaleLinear()
            .domain([35, d3.max(topData, d => +d.percentage_people_vaccinated + 10)])
            .range([height, 0]);

        svg_scene_2.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Percentage of population Vaccinated by Country");

        svg_scene_2.selectAll(".bar")
        .data(topData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.location))
        .attr("y", d => yScale(+d.percentage_people_vaccinated))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(+d.percentage_people_vaccinated))
        .attr("fill", "steelblue")
        .append("title")  // Append a title to each bar
        .text(d => `Population Vaccinated: ${formatDecimalNumber(d.percentage_people_vaccinated)} %`);

        // Add x-axis
        svg_scene_2.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add y-axis
        svg_scene_2.append("g")
            .call(d3.axisLeft(yScale));

        // Chart title
        svg_scene_2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage Polulation Vaccinated");
        
        // Add Average Line
        // Define the y-coordinate for the line
        var lineY = yScale(72.3);

        // Create the line
        svg_scene_2.append("line")
                    .attr("x1", 0)
                    .attr("y1", lineY)
                    .attr("x2", width)
                    .attr("y2", lineY)
                    .attr("stroke", "red")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "4,4");  // Optional: makes the line dashed
        // Add the caption
        svg_scene_2.append("text")
                    .attr("x", 200)  
                    .attr("y", lineY)  
                    .attr("dy", "-0.3em")  // Offset the text slightly above the line
                    .attr("text-anchor", "end")  
                    .style("font-size", "12px") 
                    .style("fill", "red")
                    .text("World Average Vaccination");
                            
    }).catch(error => {
        //console.log(error);
        alert("An error occurred while loading the visualization.");
    });    
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Visualization scene 3
function createScene3() {
    d3.select("#visualization-scene3").select("svg").remove();
    var svg_scene_3 = d3.select("#visualization-scene3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(file_url).then(data => {
        // Setup dropdown values
        var countries = [...new Set(data.map(d => d.location))]
        d3.select("#select-country").selectAll("option")
              .data(countries)
              .enter()
                .append("option")
                .text(d => d);
        
        var visualizations = ["Total Cases", "Total Deaths", "Total Vaccinations", "All Charts"]
        d3.select("#select-viz").selectAll("option")
              .data(visualizations)
              .enter()
                .append("option")
                .text(d => d);

        // When the button is changed, run the updateChart function
        var countrySelect = d3.select("#select-country").on("change",  updateChart);
        var parameterSelect = d3.select("#select-viz").on("change", updateChart);

        var parseTime = d3.timeParse("%m/%d/%Y");
    
        data.forEach(d => {
            //console.log("Before parsing: ", d.date, d.total_cases);
            d.date = parseTime(d.date);
            d.total_cases = +d.total_cases;
            d.total_deaths = +d.total_deaths;
            d.people_vaccinated = +d.people_vaccinated;
            //console.log("After parsing: ", typeof(d.date), typeof(d.total_cases));
        });

        // Function to update the chart
        function updateChart() {     
            // Get the country name and the type of visualization
            var selectedCountry = countrySelect.property("value");
            var selectedViz = parameterSelect.property("value");

            //console.log(selectedCountry);
            //console.log(selectedViz);

            // Filter data based on selected country
            var filteredData = data.filter(d => d.location === selectedCountry);

            //console.log(filteredData)
            
            // Remove existing chart if there is one
            //d3.select("#visualization-scene3").select("svg").selectAll("*").remove();

            if(selectedViz == "Total Cases"){
                displayCasesChart(filteredData, svg_scene_3, selectedCountry);
            } else if(selectedViz == "Total Deaths") {
                DisplayDeathsChart(filteredData, svg_scene_3, selectedCountry);
            } else if(selectedViz == "Total Vaccinations") {
                DisplayVaccinationChart(filteredData, svg_scene_3, selectedCountry);
            } else if(selectedViz == "All Charts") {
                DisplayAllLinesChart(filteredData, svg_scene_3, selectedCountry);
            }

        }

        // Initial chart with the first country and viz
        updateChart();
    
    }).catch(error => {
        //console.log(error);
        alert("An error occurred while loading the visualization.");
    });  


}

function displayCasesChart(filteredData, svg_scene_3, selectedCountry) {
    var xScale = d3.scaleTime().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);
    
    var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.total_cases));
    
    xScale.domain(d3.extent(filteredData, d => d.date));
    yScale.domain([0, d3.max(filteredData, d => d.total_cases)]);  
    
    // Reset the area
    //console.log(svg_scene_3._groups[0])
    svg_scene_3.selectAll("path").remove();
    svg_scene_3.selectAll("g").remove();
    svg_scene_3.selectAll("text").remove();
    svg_scene_3.selectAll("circle").remove();

    // Add the line to the SVG
    svg_scene_3.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);

    // Add the x-axis
    svg_scene_3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

    // Add the y-axis
    svg_scene_3.append("g")
    .call(d3.axisLeft(yScale).tickFormat(d3.format("~s")));

    // X-Axis Label
    svg_scene_3.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");
    
    // Y-Axis Label
    svg_scene_3.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Total Cases");
    
    // Chart title
    svg_scene_3.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(selectedCountry + " Total Cases");

    
}

function DisplayDeathsChart(filteredData, svg_scene_3, selectedCountry){
    var xScale = d3.scaleTime().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);
    
    var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.total_deaths));
                
    xScale.domain(d3.extent(filteredData, d => d.date));
    yScale.domain([0, d3.max(filteredData, d => d.total_deaths)]);  
    
    // Reset the area
    //console.log(svg_scene_3._groups[0])
    svg_scene_3.selectAll("path").remove();
    svg_scene_3.selectAll("g").remove();
    svg_scene_3.selectAll("text").remove();
    svg_scene_3.selectAll("circle").remove();

    // Add the line to the SVG
    svg_scene_3.append("path")
    .datum(filteredData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);

    // Add the x-axis
    svg_scene_3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

    // Add the y-axis
    svg_scene_3.append("g")
                .call(d3.axisLeft(yScale).tickFormat(d3.format("~s")));

    // X-Axis Label
    svg_scene_3.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");
    
    // Y-Axis Label
    svg_scene_3.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Total Deaths");
    
    // Chart title
    svg_scene_3.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(selectedCountry + " Total Deaths");
}

function DisplayVaccinationChart(filteredData, svg_scene_3, selectedCountry) {
    var xScale = d3.scaleTime().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);
    
    var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.people_vaccinated));
                
    xScale.domain(d3.extent(filteredData, d => d.date));
    yScale.domain([0, d3.max(filteredData, d => d.people_vaccinated)]);  

    // Reset the area
    //console.log(svg_scene_3._groups[0])
    svg_scene_3.selectAll("path").remove();
    svg_scene_3.selectAll("g").remove();
    svg_scene_3.selectAll("text").remove();
    svg_scene_3.selectAll("circle").remove();

    // Add the line to the SVG
    svg_scene_3.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);

    // Add the x-axis
    svg_scene_3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

    // Add the y-axis
    svg_scene_3.append("g")
                .call(d3.axisLeft(yScale).tickFormat(d3.format("~s")));

    // X-Axis Label
    svg_scene_3.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");
    
    // Y-Axis Label
    svg_scene_3.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Total People Vaccinated");
    
    // Chart title
    svg_scene_3.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(selectedCountry + " Total People Vaccinated");    
}

function DisplayAllLinesChart(filteredData, svg_scene_3, selectedCountry) {
    //console.log("inside all charts")
    var xScale = d3.scaleTime().range([0, width]);
    var yScale = d3.scaleLog().base(2).range([height, 0]);

    var cases_line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.total_cases + 1));
            
    var death_line = d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.total_deaths+1));
    
    var vaccinated_line = d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.people_vaccinated+1));

    xScale.domain(d3.extent(filteredData, d => d.date));
    yScale.domain([1, d3.max(filteredData, d => d.people_vaccinated)]);  

    svg_scene_3.selectAll("path").remove();
    svg_scene_3.selectAll("g").remove();
    svg_scene_3.selectAll("text").remove();
    svg_scene_3.selectAll("circle").remove();

    // Add the line to the SVG
    svg_scene_3.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", cases_line);
    
    svg_scene_3.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", death_line);
    
    svg_scene_3.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", vaccinated_line);

    // Add the x-axis
    svg_scene_3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

    // Add the y-axis
    svg_scene_3.append("g")
                .call(d3.axisLeft(yScale).tickFormat(d3.format("~s")).ticks(10));

    // X-Axis Label
    svg_scene_3.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");
    
    // Y-Axis Label
    svg_scene_3.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Population");
    
    // Chart title
    svg_scene_3.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(selectedCountry + " All Charts");

    // Add legends
    svg_scene_3.append("circle")
                .attr("cx", width - 110)
                .attr("cy", 190)
                .attr("r", 6)
                .style("fill", "steelblue")

    svg_scene_3.append("circle")
                .attr("cx", width - 110)
                .attr("cy",220)
                .attr("r", 6)
                .style("fill", "red")

    svg_scene_3.append("circle")
                .attr("cx", width - 110)
                .attr("cy",250)
                .attr("r", 6)
                .style("fill", "green")

    svg_scene_3.append("text")
                .attr("x", width - 95)
                .attr("y", 190)
                .text("Total Cases")
                .style("font-size", "15px")
                .attr("alignment-baseline","middle")

    svg_scene_3.append("text")
                .attr("x", width - 95)
                .attr("y", 220)
                .text("Total Deaths")
                .style("font-size", "15px")
                .attr("alignment-baseline","middle")

    svg_scene_3.append("text")
                .attr("x", width - 95)
                .attr("y", 250)
                .text("Total Vaccinated")
                .style("font-size", "15px")
                .attr("alignment-baseline","middle")

}