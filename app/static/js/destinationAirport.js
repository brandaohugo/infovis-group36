var destination_svg = d3.select("#destination-airport")
    .append("svg")
    .attr("id", "destination-svg")
    .attr("viewBox", '0 0 1200 750')
    .style("display", "block");

// destination_svg.append("text")
//     .attr("x", 600)
//     .attr("y", 250)
//     .attr("text-anchor", "middle")
//     .text("Destination airport placeholder")
//     .style("fill", "black")
//     .style("font-size", 28)
//     .style("font-family", "Helvetica")