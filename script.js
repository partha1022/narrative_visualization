var formatNumber = d3.format(",");

// Define the dimensions of your visualization
const margin = {top: 40, right: 10, bottom: 60, left: 60},
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

        console.log(dataByCountry)
        
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
                console.log(d.location)
                console.log(d.total_deaths_per_million)
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
            label: "Highest Death Per million: 6,491.797"
            },
            x: 75,
            y: 155,
            dy: -20,
            dx: 20
        }]
        
        // Add the annotation
        var makeAnnotations = d3.annotation()
            .annotations(annotations)
        
        svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(makeAnnotations)
  

    }).catch(error => {
        console.log(error);
        alert("An error occurred while loading the visualization.");
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Visualization scene 2

function createScene2() {
    // Create the SVG container for your visualization and append it to the #visualization div
    d3.select("#visualization-scene2").select("svg").remove();
    svg_scene_2 = d3.select("#visualization-scene2")
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
                v => ({people_vaccinated: d3.max(v, d => d.people_vaccinated)}),
                d => d.location
            ),
            ([key, value]) => (value.location = key, value)
        ); 

        // Sort the data by total cases in descending order
        var topData = dataByCountry.sort((a, b) => a.people_vaccinated - b.people_vaccinated);

        console.log(topData)

        // Define scales
        var xScale = d3.scaleBand()
            .domain(topData.map(d => d.location))
            .range([0, width])
            .padding(0.1);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(topData, d => +d.people_vaccinated) + 100000])
            .range([height, 0]);

        svg_scene_2.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Total vaccinationations by Country");

        svg_scene_2.selectAll(".bar")
        .data(topData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.location))
        .attr("y", d => yScale(+d.people_vaccinated))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(+d.people_vaccinated))
        .attr("fill", "steelblue")
        .append("title")  // Append a title to each bar
        .text(d => `Persons Vaccinated: ${formatNumber(d.people_vaccinated)}`);

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

        
    }).catch(error => {
        console.log(error);
        alert("An error occurred while loading the visualization.");
    });    
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Visualization scene 3
function createScene3() {
    d3.select("#visualization-scene3").select("svg").remove();

    svg_scene_3 = d3.select("#visualization-scene3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    d3.csv(file_url).then(data => {
        var countries = [...new Set(data.map(d => d.location))]
        d3.select("#select-country").selectAll("option")
              .data(countries)
              .enter()
                .append("option")
                .text(d => d);
        
        var visualizations = ["Total Cases", "Total Deaths", "Total Vaccinations", "Patients in ICU", "Patients in hospital"]
        d3.select("#select-viz").selectAll("option")
              .data(visualizations)
              .enter()
                .append("option")
                .text(d => d);

        // When the button is changed, run the updateChart function
        var countrySelect = d3.select("#select-country").on("change",  updateChart);
        var parameterSelect = d3.select("#select-viz").on("change", updateChart);

        // Function to update the chart
        function updateChart() {  
            var xScale = d3.scaleTime().range([0, width]);
            var yScale = d3.scaleLinear().range([height, 0]);
          
            var selectedCountry = countrySelect.property("value");
            var selectedViz = parameterSelect.property("value");
            var selectedParameter = ""
            
            if (selectedViz == "Total Cases") {
                selectedParameter = "total_cases"
            } else if(selectedViz == "Total Deaths") {
                selectedParameter = "total_deaths"
            } else if(selectedViz == "Total Vaccinations") {
                selectedParameter = "people_vaccinated"
            } else if(selectedViz == "Patients in ICU") {
                selectedParameter = "icu_patients"
            } else {
                selectedParameter = "hosp_patients"
            }
            

            console.log(selectedCountry);
            console.log(selectedParameter);

            // Filter data based on selected country
            var filteredData = data.filter(d => d.location === selectedCountry);

            // Remove existing chart if there is one
            d3.select("#visualization-scene3").selectAll("*").remove();

            // Update scales
            xScale.domain(d3.extent(filteredData, d => d.date));
            yScale.domain([0, d3.max(filteredData, d => +d[selectedParameter])]);

            // Create line generator
            var line = d3.line()
                .defined(d => !isNaN(d[selectedParameter]))
                .x(d => xScale(d.date))
                .y(d => yScale(d[selectedParameter]));
            
            console.log(line)

            svg_scene_3.append("path")
                    .datum(filteredData)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);

        }

        // Initial chart with the first country and viz
        updateChart();
    
    }).catch(error => {
        console.log(error);
        alert("An error occurred while loading the visualization.");
    });  


}