// Define the dimensions of your visualization
const margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create the SVG container for your visualization and append it to the #visualization div
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);



// Load your data
var file_url = "https://raw.githubusercontent.com/partha1022/narrative_visualization/main/WHO-COVID-19-global-data.csv"
d3.csv(file_url).then(data => {

    d3.json("https://d3js.org/world-110m.v1.json", function(error, world) {
    if (error) throw error;

    var countries = topojson.feature(world, world.objects.countries).features;

    svg.append("g").selectAll("path")
        .data(countries)
        .enter().append("path")
        .attr("d", d3.geoPath().projection(d3.geoNaturalEarth1()))
        .style("fill", function(d) { 
        // Color the countries based on total cases
        var totalCases = covidData[d.id].total_cases;
        return colorScale(totalCases);
        });
    });
    
}).catch(error => {
    console.log(error);
    alert("An error occurred while loading the data.");
});

// Function definitions for updating the visualization based on interaction or new data goes here
