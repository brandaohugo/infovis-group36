let squareSize = 200

function drawText(svg, text) {
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .style("fill", "green")

    svg.append("text")
        .text(text)
        .attr("x", function (d, i) {
            return (squareSize / 2)
        })
        .attr("y", function (d, i) {
            return (squareSize / 2)
        })
        .attr("font-family", "Arial Black")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
}

function drawAirportInfoBox(airport) {
    var info_passengers_svg = d3.select("#origin-flights")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

     var info_connections_svg = d3.select("#origin-connections")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)
     var info_canceled_svg = d3.select("#origin-canceled")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

    drawText(info_passengers_svg, "Total number of passengers")
    drawText(info_connections_svg, "Total number of connections")
    drawText(info_canceled_svg, "Total number of cancellations")

}
