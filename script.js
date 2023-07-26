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
var file_url = "https://raw.githubusercontent.com/partha1022/narrative_visualization/main/COVID_19_TOP_COUNTRIES.csv"
d3.csv(file_url).then(data => {
    
    // Sort the data by total cases in descending order and take the top 10
    var topData = data.sort((a, b) => b.total_cases - a.total_cases).slice(0, 10);

    console.log(topData)
    // Define scales
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(topData, d => d.total_cases)])
        .range([0, width]);

    var yScale = d3.scaleBand()
        .domain(topData.map(d => d.location))
        .range([height, 0])
        .padding(0.1);

    // Draw the bars
    svg.selectAll(".bar")
        .data(topData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.location))
        .attr("width", d => xScale(d.total_cases))
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue");

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    
}).catch(error => {
    console.log(error);
    alert("An error occurred while loading the data.");
});

// Function definitions for updating the visualization based on interaction or new data goes here
