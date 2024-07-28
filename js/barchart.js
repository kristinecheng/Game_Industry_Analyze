const MARGIN2 = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH2 = 800 - MARGIN2.LEFT - MARGIN2.RIGHT;
const HEIGHT2 = 500 - MARGIN2.TOP - MARGIN2.BOTTOM;

const svg2 = d3.select("#barchart-section").append("svg")
  .attr("width", WIDTH2 + MARGIN2.LEFT + MARGIN2.RIGHT)
  .attr("height", HEIGHT2 + MARGIN2.TOP + MARGIN2.BOTTOM);

const g2 = svg2.append("g")
  .attr("transform", `translate(${MARGIN2.LEFT}, ${MARGIN2.TOP})`);

// Scales
const x2 = d3.scaleBand().range([0, WIDTH2]).padding(0.2);
const y2 = d3.scaleLinear().range([HEIGHT2, 0]);

// Axes
const xAxisCall2 = d3.axisBottom(x2);
const yAxisCall2 = d3.axisLeft(y2);

const xAxisGroup2 = g2.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT2})`);

const yAxisGroup2 = g2.append("g")
  .attr("class", "y axis");

// Labels
g2.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH2 / 2)
  .attr("y", HEIGHT2 + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Regions");

g2.append("text")
  .attr("class", "y axis-label")
  .attr("x", -(HEIGHT2 / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Global Sales (Millions)");

// Load and process data
d3.json("data/overview.json").then(function(data) {
  console.log("Data loaded: ", data);

  // Clean data and format it
  const formattedData = data.map(year => {
    return year["games_info"].filter(game => {
      const dataExists = (game.global_sales && game.user_count);
      return dataExists;
    }).map(game => {
      game.global_sales = Number(game.global_sales);
      game.user_count = Number(game.user_count);
      game.na_sales = Number(game.na_sales); // Ensure na_sales is numeric
      game.eu_sales = Number(game.eu_sales); // Ensure eu_sales is numeric
      game.jp_sales = Number(game.jp_sales); // Ensure jp_sales is numeric
      game.other_sales = Number(game.other_sales); // Ensure other_sales is numeric
      return game;
    });
  });

  // Extract unique years
  const years = [...new Set(data.map(d => d.year))];
  const yearSelect = d3.select("#year-select");

  // Populate year selection dropdown
  yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Add event listener for year selection change
  yearSelect.on("change", function() {
    const selectedYear = d3.select(this).property("value");
    console.log("Selected year: ", selectedYear);
    const yearData = formattedData[data.findIndex(d => d.year == selectedYear)];
    console.log("Filtered data: ", yearData);
    update2(yearData);
  });

  // Initialize chart with the first year data
  update2(formattedData[0]);
}).catch(error => {
  console.error("Error loading data: ", error);
});

// Update2 function
function update2(data) {
  console.log("Update data: ", data);

  // Flatten the nested structure to aggregate sales data
  const salesData = [
    { region: "North America", sales: d3.sum(data, d => d.na_sales || 0) },
    { region: "Europe", sales: d3.sum(data, d => d.eu_sales || 0) },
    { region: "Japan", sales: d3.sum(data, d => d.jp_sales || 0) },
    { region: "Other", sales: d3.sum(data, d => d.other_sales || 0) }
  ];

  console.log("Sales data: ", salesData);

  // Update scales
  x2.domain(salesData.map(d => d.region));
  y2.domain([0, d3.max(salesData, d => d.sales)]);

  console.log("x2 domain: ", x2.domain());
  console.log("y2 domain: ", y2.domain());

  // Update axes
  xAxisGroup2.call(xAxisCall2);
  yAxisGroup2.call(yAxisCall2);

  // JOIN new data with old elements
  const rects = g2.selectAll("rect")
    .data(salesData, d => d.region);

  // EXIT old elements not present in new data
  rects.exit().remove();

  // ENTER new elements present in new data
  rects.enter().append("rect")
    .attr("x", d => x2(d.region))
    .attr("width", x2.bandwidth())
    .attr("fill", "steelblue")
    .attr("y", HEIGHT2) // Initial y position at the bottom
    .attr("height", 0) // Initial height of 0
    .merge(rects) // Merging the update selection
    .transition().duration(750)
    .attr("y", d => y2(d.sales))
    .attr("height", d => HEIGHT2 - y2(d.sales));

  // UPDATE existing elements
  rects.transition().duration(750)
    .attr("x", d => x2(d.region))
    .attr("width", x2.bandwidth())
    .attr("y", d => y2(d.sales))
    .attr("height", d => HEIGHT2 - y2(d.sales))
    .attr("fill", "steelblue");
}