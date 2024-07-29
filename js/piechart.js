// Set dimensions and margins for the pie chart
const MARGIN_PIE = { TOP: 20, RIGHT: 20, BOTTOM: 50, LEFT: 20 };
const WIDTH_PIE = 800 - MARGIN_PIE.LEFT - MARGIN_PIE.RIGHT;
const HEIGHT_PIE = 600 - MARGIN_PIE.TOP - MARGIN_PIE.BOTTOM;
const RADIUS = Math.min(WIDTH_PIE, HEIGHT_PIE) / 2;

// Create the SVG container for the pie chart
const svg_pie = d3.select("#piechart-section").append("svg")
  .attr("width", WIDTH_PIE + MARGIN_PIE.LEFT + MARGIN_PIE.RIGHT)
  .attr("height", HEIGHT_PIE + MARGIN_PIE.TOP + MARGIN_PIE.BOTTOM)
  .append("g")
  .attr("transform", `translate(${WIDTH_PIE / 2 + MARGIN_PIE.LEFT}, ${HEIGHT_PIE / 2 + MARGIN_PIE.TOP})`);

// Define the pie chart layout
const pie = d3.pie()
  .value(d => d.user_count)
  .sort(null);

// Define the arc generator
const arc = d3.arc()
  .outerRadius(RADIUS - 10)
  .innerRadius(0);

// Define the label arc generator
const labelArc = d3.arc()
  .outerRadius(RADIUS - 40)
  .innerRadius(RADIUS - 40);

// Define a color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Function to update the pie chart
function updatePieChart(yearData) {
  // Aggregate data by genre
  const genreData = d3.nest()
    .key(d => d.genre)
    .rollup(v => d3.sum(v, d => d.user_count))
    .entries(yearData)
    .map(d => ({ genre: d.key, user_count: d.value }));

  // Create pie chart
  const arcs = pie(genreData);

  // Update slices
  const slices = svg_pie.selectAll(".slice")
    .data(arcs);

  slices.exit().remove();

  slices.enter().append("path")
    .attr("class", "slice")
    .attr("d", arc)
    .attr("fill", d => color(d.data.genre))
    .attr("stroke", "white")
    .attr("stroke-width", "1px")
    .merge(slices)
    .transition().duration(750)
    .attr("d", arc);

  // Update labels
  const labels = svg_pie.selectAll(".label")
    .data(arcs);

  labels.exit().remove();

  labels.enter().append("text")
    .attr("class", "label")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .merge(labels)
    .transition().duration(750)
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .text(d => `${d.data.genre}: ${d3.format(",")(d.data.user_count)}`);

  // Update annotations with percentages
  const annotations = svg_pie.selectAll(".annotation")
    .data(arcs);

  annotations.exit().remove();

  annotations.enter().append("text")
    .attr("class", "annotation")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", "1.5em")
    .style("text-anchor", "middle")
    .merge(annotations)
    .transition().duration(750)
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .text(d => `${d3.format(".1%")(d.data.user_count / d3.sum(genreData, g => g.user_count))}`);
}

// Load and process data
d3.json("data/overview.json").then(function(data) {
  console.log("Data loaded: ", data);

  // Extract unique years
  const years = [...new Set(data.map(d => d.year))];
  const yearSelect = d3.select("#pie-year-select");

  // Populate year selection dropdown
  yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Clean and format data
  const formattedData = data.reduce((acc, year) => {
    acc[year.year] = year["games_info"].filter(game => game.user_count).map(game => ({
      genre: game.genre,
      user_count: Number(game.user_count)
    }));
    return acc;
  }, {});

  // Add event listener for year selection change
  yearSelect.on("change", function() {
    const selectedYear = d3.select(this).property("value");
    console.log("Selected year: ", selectedYear);
    const yearData = formattedData[selectedYear] || [];
    console.log("Filtered data: ", yearData);
    updatePieChart(yearData);
  });

  // Initialize chart with the first year data
  if (years.length > 0) {
    const initialYear = years[0];
    yearSelect.property("value", initialYear);
    updatePieChart(formattedData[initialYear]);
  }
}).catch(error => {
  console.error("Error loading data: ", error);
});
