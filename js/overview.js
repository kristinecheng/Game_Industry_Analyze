const MARGIN1 = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH1 = 800 - MARGIN1.LEFT - MARGIN1.RIGHT
const HEIGHT1 = 500 - MARGIN1.TOP - MARGIN1.BOTTOM

const svg1 = d3.select("#overview-section").append("svg")
  .attr("width", WIDTH1 + MARGIN1.LEFT + MARGIN1.RIGHT)
  .attr("height", HEIGHT1 + MARGIN1.TOP + MARGIN1.BOTTOM)

const g1 = svg1.append("g")
  .attr("transform", `translate(${MARGIN1.LEFT}, ${MARGIN1.TOP})`)

let time = 0
let interval
let formattedData

// Tooltip for hover description: 
const tip = d3.tip()
  .attr('class', 'd3-tip')
    .html(d => {
      let text = `<strong>Game:</strong> <span style='color:red;text-transform:capitalize'>${d.game}</span><br>`
      text += `<strong>Publisher:</strong> <span style='color:red;text-transform:capitalize'>${d.company}</span><br>`
      text += `<strong>Game Genre:</strong> <span style='color:red;text-transform:capitalize'>${d.genre}</span><br>`
      text += `<strong>Global Sales:</strong> <span style='color:red'>${(d.global_sales)}</span><br>`
      text += `<strong>User Amount:</strong> <span style='color:red'>${d3.format(".0f")(d.user_count)}</span><br>`
      return text
    })
g1.call(tip)

// Scales
const x1 = d3.scaleLinear()
	.range([0, WIDTH1])
	.domain([0, 10])
const y1 = d3.scaleLinear()
	.range([HEIGHT1, 0])
	.domain([0, 1000])
const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])
const genreColor = d3.scaleOrdinal(d3.schemePastel1)



// Labels
const xLabel1 = g1.append("text")
	.attr("y", HEIGHT1 + 50)
	.attr("x", WIDTH1 / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Global Sales (Millions)")
const yLabel1 = g1.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Users (Thousands)")
const timeLabel = g1.append("text")
	.attr("y", HEIGHT1 - 10)
	.attr("x", WIDTH1 - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1880")

// X Axis
const xAxisCall1 = d3.axisBottom(x1)
	.tickValues([0, 5, 10]);
g1.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT1})`)
	.call(xAxisCall1)

// Y Axis
const yAxisCall1 = d3.axisLeft(y1)
g1.append("g")
	.attr("class", "y axis")
	.call(yAxisCall1)

const genres = ['Sports', 'Platform', 'Racing', 'Role-Playing', 'Puzzle', 'Misc', 'Shooter', 'Simulation', 'Action', 'Fighting', 'Adventure', 'Strategy']
const legend = g1.append("g")
	.attr("transform", `translate(${WIDTH1}, ${HEIGHT1 - 300})`)

genres.forEach((genre, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`)

	legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
		.attr("fill", genreColor(genre))

	legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(genre)
})

d3.json("data/overview.json").then(function(data){
	// clean data
	formattedData = data.map(year => {
		return year["games_info"].filter(game => {
			const dataExists = (game.global_sales && game.user_count)
			return dataExists
		}).map(game => {
			game.global_sales = Number(game.global_sales)
			game.user_count = Number(game.user_count)
			return game
		})
	})
	// first run of the visualization
	update1(formattedData[0])
})
drawAnnotation();

function step() {
	// at the end of our data, loop back
	time = (time < 214) ? time + 1 : 0
	update1(formattedData[time])
}

$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 100)
		}
		else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		time = 0
		update1(formattedData[0])
	})

  $("#genre-select")
	.on("change", () => {
		update1(formattedData[time])
	})

$("#date-slider").slider({
	min: 1880,
	max: 2016,
	step: 1,
	slide: (event, ui) => {
		time = ui.value - 1880
		update1(formattedData[time])
	}
})

function drawAnnotation() {
	var annotation1 = svg1.append('g');
	annotation1.append('text')
	  .attr('x', 110)
	  .attr('y', 360)
	  .classed('annotation', true)
  }

  function update1(data) {
    // standard transition time for the visualization
    const t = d3.transition()
      .duration(100)
  
    const genre = $("#genre-select").val()
  
    const filteredData = data.filter(d => {
        if (genre === "all") return true
        else {
          return d.genre == genre
        }
    })
  
    // JOIN new data with old elements.
    const circles = g1.selectAll("circle")
      .data(filteredData, d => d.game)
  
    // EXIT old elements not present in new data.
    circles.exit().remove()
  
    // ENTER new elements present in new data.
    circles.enter().append("circle")
      .attr("fill", d => genreColor(d.genre))
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .merge(circles)
      .transition(t)
        .attr("cy", d => y1(d.user_count))
        .attr("cx", d => x1(d.global_sales))
        .attr("r", d => Math.sqrt(area(d.global_sales) / Math.PI))
  
    // update the time label
    timeLabel.text(String(time + 1880))
  
    $("#year")[0].innerHTML = String(time + 1880)
    $("#date-slider").slider("value", Number(time + 1880))
  }
  