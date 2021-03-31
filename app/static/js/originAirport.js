/*  This visualization was made possible by modifying code provided by:

Chi Huang, Learning D3 — Multiple Lines Chart w/ Line-by-Line Code Explanations
https://js.plainenglish.io/learning-d3-multiple-lines-chart-w-line-by-line-code-explanations-40440994e1ad?gi=eaf244fc73f0

Zakaria Chowdhury, D3 v4 Multi Line Chart
https://codepen.io/zakariachowdhury/pen/JEmjwq?editors=0110
 */

function originAirport() {

    var lineOpacity = "0.40";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 6;
    var circleRadiusHover = 9;


//set canvas margins

    let leftMargin = 70
    let topMargin = 5
    let bottomMargin = 2
    let chartHeight = 550

    var svg = d3.select("#origin-airport")
        .append("svg")
        .attr("id", "origin-svg")
        .attr("viewBox", '0 0 1200 750')
        .style("display", "none");

    var before_origin_svg = d3.select("#origin-airport")
        .append("svg")
        .attr("id", "before-origin-svg")
        .attr("viewBox", '0 0 1200 750')
        .style("display", "block");

    before_origin_svg.append("text")
        .attr("x", 600)
        .attr("y", 250)
        .attr("text-anchor", "middle")
        .text("Please select an origin airport")
        .style("fill", "black")
        .style("font-size", 28)
        .style("font-family", "Helvetica")


//scale xAxis
    var xExtent = d3.extent(plotData, d => d.MONTH);
    let xScale = d3.scaleLinear().domain(xExtent).range([leftMargin, 900])


//scale yAxis
    var yMax = d3.max(plotData, d => d.ARR_DELAY)
    let yMin = d3.min(plotData, d => d.ARR_DELAY)

    let yScale = d3.scaleLinear().domain([yMin - bottomMargin, yMax + topMargin]).range([chartHeight, 0])

    let middle = yScale(-1.5)


//draw xAxis and xAxis label
    let xAxis = d3.axisBottom()
        .scale(xScale)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,570)")
        .call(xAxis)
        .append("text")
        .attr("x", (900 + 70) / 2) //middle of the xAxis
        .attr("y", "50") // a little bit below xAxis
        .text("Month")

    //draw xAxis and xAxis label
    let xAxisZero = d3.axisBottom()
        .scale(xScale)
        .ticks(0)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + middle + ")")
        .call(xAxisZero)

//yAxis and yAxis label

    let yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${leftMargin},20)`) //use variable in translate
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", "-150")
        .attr("y", "-50")
        .attr("text-anchor", "end")
        .text("Minutes delay")

//use .nest()function to group data

    var sumstat = d3.nest()
        .key(d => d.AIRLINE)
        .entries(plotData);


//set color pallete for different vairables
    var airlineName = sumstat.map(d => d.key)
    var color = d3.scaleOrdinal().domain(airlineName).range(d3.schemeSpectral[11])

//select path
//three types: curveBasis,curveStep, curveCardinal
    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(sumstat)
        .enter()
        .append("g")
        .attr("class", "line-group")
        .append("path")
        .attr('class', 'line')
        .attr("d", function (d) {
            return d3.line()
                .x(e => xScale(e.MONTH))
                .y(e => yScale(e.ARR_DELAY)).curve(d3.curveMonotoneX)
                (d.values)
        })
        .attr("fill", "none")
        .attr("stroke", d => color(d.key))
        .style("stroke-width", lineStroke)
        .style('opacity', lineOpacity)
        .on("mouseover", function (d) {
            lines.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            lines.selectAll('circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            lines.selectAll(".line")
                .style('opacity', lineOpacity);
            lines.selectAll('circle')
                .style('opacity', circleOpacity);
            d3.select(this)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        });


//append circle
    lines.selectAll("circle-group")
        .data(plotData)
        .enter()
        .append("g")
        .style("fill", d => color(d.AIRLINE))
        .append("circle")
        .attr("cx", d => xScale(d.MONTH))
        .attr("cy", d => yScale(d.ARR_DELAY))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function (d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("r", circleRadiusHover);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("r", circleRadius);
        });


//append legends

    var legend = svg.selectAll('g.legend')
        .data(sumstat)
        .enter()
        .append("g")
        .attr("class", "legend");

    legend.append("circle")
        .attr("cx", 1000)
        .attr('cy', (d, i) => i * 30 + 50)
        .attr("r", 6)
        .style("fill", d => color(d.key))

    legend.append("text")
        .attr("x", 1020)
        .attr("y", (d, i) => i * 30 + 50)
        .text(d => d.key)


//append title
    svg.append("text")
        .attr("x", 485)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Delay in minutes per airline")
        .style("fill", "black")
        .style("font-size", 28)
        .style("font-family", "Arial Black")
}
