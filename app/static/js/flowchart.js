const convertDataToFlow = (origin, flights) => {

    const destFlights = flights.filter(el => {
        return origin.iata === el.origin
    })
    const destFlightsSorted = destFlights.sort((a, b) => parseFloat(b.flight_volume) - parseFloat(a.flight_volume));

    const nodes = destFlightsSorted.map((el, i) => {
        return {node: i + 1, name: el.destination}
    });
    nodes.unshift({node: 0, name: origin.iata})

    const links = destFlightsSorted.map(el => {
        let t = nodes.find(e => e.name === el.destination);
        return {source: 0, target: t.node, value: el.flight_volume}
    });
    return {
        nodes: nodes.slice(0, 10),
        links: links.slice(0, 9)
    }
}

const drawOriginAirportFlow = (origin, flights, flowOptions, onClickFlow) => {
    const {
        nodes,
        links
    } = convertDataToFlow(origin, flights);
    const {
        margins,
        divId,
        svgWidth,
        svgHeight,
        nodeWidth,
        nodePadding
    } = flowOptions;

    const chartWidth = svgWidth - margins.left - margins.right;
    const chartHeight = svgHeight - margins.top - margins.bottom;

    // append the svg object to the div
    const svg = d3.select(divId).append("svg")
        .attr("viewBox", '0 0 ' + svgWidth + ' ' + svgHeight)
        .append("g")
        .attr("transform",
            "translate(" + margins.left + "," + margins.top + ")");

    // Color scale used
    const color = d3.scaleOrdinal(d3.schemePastel1);

    // Set the sankey diagram properties
    const sankey = d3.sankey()
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .size([chartWidth, chartHeight]);

    sankey
        .nodes(nodes)
        .links(links)
        .layout(1);

    // add in the links
    svg.append("g")
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .style("stroke-width", function (d) {
            return Math.max(1, d.dy);
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        })
        .on("click", onClickFlow);

    // add in the nodes
    var node = svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

    // add the rectangles for the nodes
    node
        .append("rect")
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(2);
        })
        // Add hover text
        .append("title")
        .text(function (d) {
            return d.name + "\n" + "There is " + d.value + " stuff in this node";
        });

    // add in the title for the nodes
    node
        .append("text")
        .attr("x", -6)
        .attr("y", function (d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
            return d.name;
        })
        .filter(function (d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")

    let titleText = 'Top destinations sorted by flight volume';
    d3.select(divId).append('text')
        .attr('x', svgWidth / 2)
        .attr('y', chartHeight + margin.top + 30)
        .text(titleText)
        .attr('text-anchor', 'middle')
};
