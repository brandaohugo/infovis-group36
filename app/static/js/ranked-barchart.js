function makeBarchart(origin, destination ){

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    chart_width = 430 - margin.left - margin.right,
    chart_height = 360 - margin.top - margin.bottom;




// append the svg object to the body of the page
var svg = d3.select("#destination-airport")
  .append("svg")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", chart_height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data


var dataPoint = flights_data.find((data) => {
        return data.origin === origin && data.destination === destination;
    });

delete dataPoint.origin
delete dataPoint.destination
delete dataPoint.CANCELLED
delete dataPoint.VOLUME_RANK
delete dataPoint.arr_delay
delete dataPoint.flight_volume;

//console.log("delay is", Object.keys(dataPoint))

function test(){
   function draw(data) {



  // X axis
       console.log("delay is", data)
  var x = d3.scaleBand()
    .range([ 0, chart_width ])
    .domain(Object.keys(data))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + chart_height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 1])
    .range([ chart_height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll("mybar")
    .data(Object.keys(data))
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d); })
      .attr("y", function(d) { return y(data[d]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return chart_height - y(data[d]); })
      .attr("fill", "#69b3a2")

}
draw(dataPoint);
};


test()
};