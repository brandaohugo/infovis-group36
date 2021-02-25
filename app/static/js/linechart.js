/*  This visualization was made possible by modifying code provided by:

Chi Huang, Learning D3 — Multiple Lines Chart w/ Line-by-Line Code Explanations
https://js.plainenglish.io/learning-d3-multiple-lines-chart-w-line-by-line-code-explanations-40440994e1ad?gi=eaf244fc73f0

Zakaria Chowdhury, D3 v4 Multi Line Chart
https://codepen.io/zakariachowdhury/pen/JEmjwq?editors=0110
 */

function lineChart(data) {

    var data = plot_data

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

    leftMargin = 70
    topMargin = 5
    bottomMargin = 2
    chartHeight = 550

    var svg = d3.select("#linechart")
        .append("svg")
        .attr("viewBox", '0 0 1200 750');


//scale xAxis
    var xExtent = d3.extent(data, d => d.MONTH);
    xScale = d3.scaleLinear().domain(xExtent).range([leftMargin, 900])


//scale yAxis
    var yMax = d3.max(data, d => d.ARR_DELAY)
    yMin = d3.min(data, d => d.ARR_DELAY)

    yScale = d3.scaleLinear().domain([yMin - bottomMargin, yMax + topMargin]).range([chartHeight, 0])

    middle = yScale(-1.5)


//draw xAxis and xAxis label
    xAxis = d3.axisBottom()
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
    xAxisZero = d3.axisBottom()
        .scale(xScale)
        .ticks(0)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + middle + ")")
        .call(xAxisZero)

//yAxis and yAxis label

    yAxis = d3.axisLeft()
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
        .entries(data);


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
                .x(d => xScale(d.MONTH))
                .y(d => yScale(d.ARR_DELAY)).curve(d3.curveMonotoneX)
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
        .data(data)
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


    // https://www.vis4.net/blog/2015/04/making-html-tables-in-d3-doesnt-need-to-be-a-pain/
    // START HERE MARTA

    // var airlineNames = Object.keys(table_data[0])
    //
    //
    // // // column definitions
    // var columns = [
    //     {
    //         head: 'Month', cl: 'center',
    //         html: function (r) {
    //             return r;
    //         }
    //     }
    // ];
    //
    // for (index = 0; index < airlineNames.length; ++index) {
    //     var airline = airlineNames[index]
    //     columns.push({
    //         head: airline, cl: 'center',
    //         html: function (r) {
    //             return r[airline];
    //         }
    //     })
    // }
    //
    // // create table
    // var table = d3.select('body')
    //     .append('table');
    //
    // // create table header
    // table.append('thead').append('tr')
    //     .selectAll('th')
    //     .data(columns).enter()
    //     .append('th')
    //     .attr('class', function (r) {
    //         return r.cl;
    //     })
    //     .text(function (r) {
    //         return r.head;
    //     });
    //
    // // create table body
    // table.append('tbody')
    //     .selectAll('tr')
    //     .data(table_data).enter()
    //     .append('tr')
    //     .selectAll('td')
    //     .data(function (row, i) {
    //         return columns.map(function (c) {
    //             // compute cell values for this specific row
    //             var cell = {};
    //             d3.keys(c).forEach(function (k) {
    //                 cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
    //             });
    //             return cell;
    //         });
    //     }).enter()
    //     .append('td')
    //     .html(function (r) {
    //         return r.html;
    //     })
    //     .attr('class', function (r) {
    //         return r.cl;
    //     });
    //
    // function length() {
    //     var fmt = d3.format('02d');
    //     return function (l) {
    //         return Math.floor(l / 60) + ':' + fmt(l % 60) + '';
    //     };
    // }

}
