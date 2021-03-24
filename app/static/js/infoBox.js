let squareSize = 160
// TODO: Add easter egg for connection rank 1
function drawText(svg, text, info) {
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .style("fill", "white")


    // Text block
    svg.append("text")
        .text(text)
        .attr("x", function (d, i) {
            return (squareSize / 2)
        })
        .attr("y", function (d, i) {
            return (squareSize / 2)
        })
        //font-family: 'Skyfont', sans-serif;
        .attr("font-family", "SkyFont")
        .attr("font-size", "180%")
        .attr("text-anchor", "middle")
        .attr("fill", "black")

    // if (transition) {
    //     svg.append("text")
    //         .attr("y", function (d, i) {
    //             return (squareSize / 2) + 50
    //         })
    //         .attr("x", function (d, i) {
    //             return (squareSize / 2)
    //         })
    //         .attr("text-anchor", "middle")
    //         .attr("font-family", "SkyFont")
    //         .attr("font-size", "30px")
    //         .attr("text-anchor", "middle")
    //         .attr("fill", "black")
    //         .text(info)
    //         .transition()
    //         .duration(5000)
    //         .textTween(function (d) {
    //             console.log(origin_info, info)
    //             return d3.interpolateRound(parseInt(origin_info), parseInt(info));
    //
    //         })
    //         .end();
    // } else {
        // Info block
        svg.append("text")
            .attr("y", function (d, i) {
                return (squareSize / 2) + 50
            })
            .attr("x", function (d, i) {
                return (squareSize / 2)
            })
            .attr("text-anchor", "middle")
            .attr("font-family", "SkyFont")
            .attr("font-size", "300%")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .text(info)
    // }

}

function drawOriginAirportInfoBox(airport) {
    // Remove potentially old svg's first before appending new ones
    d3.select("#origin-flights").select('svg').remove()
    d3.select("#origin-connections").select('svg').remove()
    d3.select("#origin-cancelled").select('svg').remove()

    let info_passengers_svg = d3.select("#origin-flights")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

    let info_connections_svg = d3.select("#origin-connections")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)
    let info_canceled_svg = d3.select("#origin-cancelled")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

    drawText(info_passengers_svg, "Flights", parseInt(airport['num_of_flights']))
    drawText(info_connections_svg, "Destinations", parseInt(airport['num_of_connections']))
    // TODO: Have some way of showing percentage sign here
    drawText(info_canceled_svg, "Cancelled", airport['CANCELLED'])
}

function drawDestinationAirportInfoBox(airport) {
    // Remove potentially old svg's first before appending new ones
    d3.select("#od-flights").select('svg').remove()
    d3.select("#od-ranking").select('svg').remove()
    d3.select("#od-cancelled").select('svg').remove()
    let info_passengers_svg = d3.select("#od-flights")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

    let info_connections_svg = d3.select("#od-ranking")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)
    let info_cancelled_svg = d3.select("#od-cancelled")
        .append("svg")
        .attr("width", squareSize)
        .attr("height", squareSize)

    drawText(info_passengers_svg, "OD Flights", parseInt(airport['flight_volume']))
    drawText(info_connections_svg, "Conn. rank", parseInt(airport['volume_rank']))
    drawText(info_cancelled_svg, "OD Cancelled", parseInt(airport['cancelled']))

}
