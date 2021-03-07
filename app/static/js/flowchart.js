// the function for moving the nodes
const dragmove = (d) => {
  d3.select(this)
      .attr("transform",
          "translate("
          + d.x + ","
          + (d.y = Math.max(
              0, Math.min(height - d.dy, d3.event.y))
          ) + ")");
  sankey.relayout();
  link.attr("d", sankey.link());
}

const showOriginAirportFlow = (origin, flights) => {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      w = 540 - margin.left - margin.right,
      h = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#origin-chart").append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Color scale used
  var color = d3.scaleOrdinal(d3.schemePastel1);

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(10)
      .nodePadding(15)
      .size([w, h]);

  const destFlights = flights.filter(el => {
      return origin.iata == el.origin
  })

  const nodes = destFlights.map((el, i) => {
      return {node: i + 1, name: el.destination}
  })
  nodes.push({node: 0, name: origin.iata})

  const links = destFlights.map(el => {
      let t = nodes.find(e => e.name == el.destination);
      return {source: 0, target: t.node, value: el.flight_volume}
  })

  sankey
      .nodes(nodes)
      .links(links)
      .layout(1);

  // add in the links
  var link = svg.append("g")
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
      });

  // add in the nodes
  var node = svg.append("g")
      .selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
      })
  // .call(d3.drag()
  // .subject(function(d) { return d; })
  // .on("start", function() { this.parentNode.appendChild(this); })
  // .on("drag", dragmove));


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
      .attr("text-anchor", "start");


  // load the data
  // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_sankey.json", function(error, graph) {


  // });
};
