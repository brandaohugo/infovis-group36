// https://medium.com/javascript-in-plain-english/learning-d3-multiple-lines-chart-w-line-by-line-code-explanations-40440994e1ad
function lineChart(data) {

    var data = [
        {month: 1, airline: "Virgin Atlantic", delay: 1},
        {month: 2, airline: "Virgin Atlantic", delay: 0.5},
        {month: 3, airline: "Virgin Atlantic", delay: 0.4},
        {month: 4, airline: "Virgin Atlantic", delay: 0.6},
        {month: 5, airline: "Virgin Atlantic", delay: 0.2},
        {month: 6, airline: "Virgin Atlantic", delay: -0.3},
        {month: 7, airline: "Virgin Atlantic", delay: 0.4},
        {month: 8, airline: "Virgin Atlantic", delay: 0.7},
        {month: 9, airline: "Virgin Atlantic", delay: 0.2},
        {month: 10, airline: "Virgin Atlantic", delay: 0.1},
        {month: 11, airline: "Virgin Atlantic", delay: 0},
        {month: 12, airline: "Virgin Atlantic", delay: 0.2},

        {month: 1, airline: "American Airlines", delay: 1},
        {month: 2, airline: "American Airlines", delay: 0.2},
        {month: 3, airline: "American Airlines", delay: 0.3},
        {month: 4, airline: "American Airlines", delay: 0.9},
        {month: 5, airline: "American Airlines", delay: 0.1},
        {month: 6, airline: "American Airlines", delay: 0.6},
        {month: 7, airline: "American Airlines", delay: 0.4},
        {month: 8, airline: "American Airlines", delay: 0.9},
        {month: 9, airline: "American Airlines", delay: -0.2},
        {month: 10, airline: "American Airlines", delay: 0.9},
        {month: 11, airline: "American Airlines", delay: 0.2},
        {month: 12, airline: "American Airlines", delay: -0.5}
    ];


//set canvas margins
    leftMargin = 70
    topMargin = 0.5


//scale xAxis
    var xExtent = d3.extent(plot_data, d => d.month);
    xScale = d3.scaleLinear().domain(xExtent).range([leftMargin, 900])


//scale yAxis
    var yMax = 2
    yScale = d3.scaleLinear().domain([-1.5, yMax + topMargin]).range([600, 0])


//draw xAxis and xAxis label
    xAxis = d3.axisBottom()
        .scale(xScale)

    d3.select("svg")
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,320)")
        .call(xAxis)
        .append("text")
        .attr("x", (900 + 70) / 2) //middle of the xAxis
        .attr("y", "50") // a little bit below xAxis
        .text("Month")

//yAxis and yAxis label

    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10)

    d3.select('svg')
        .append("g")
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
        .key(d => d.airline)
        .entries(data);

    var map = d3.map(plot_data);
    console.log("MAP", map)

//set color pallete for different vairables
    var airlineName = sumstat.map(d => d.key)
    var color = d3.scaleOrdinal().domain(airlineName).range(colorbrewer.Set2[6])


//select path
//three types: curveBasis,curveStep, curveCardinal
    d3.select("svg")
        .selectAll(".line")
        .append("g")
        .attr("class", "line")
        .data(sumstat)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return d3.line()
                .x(d => xScale(d.month))
                .y(d => yScale(d.delay)).curve(d3.curveMonotoneX)
                (d.values)
        })
        .attr("fill", "none")
        .attr("stroke", d => color(d.key))
        .attr("stroke-width", 2)


//append circle
    d3.select("svg")
        .selectAll("circle")
        .append("g")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("cx", d => xScale(d.month))
        .attr("cy", d => yScale(d.delay))
        .style("fill", d => color(d.airline))


//append legends

    var legend = d3.select("svg")
        .selectAll('g.legend')
        .data(sumstat)
        .enter()
        .append("g")
        .attr("class", "legend");

    legend.append("circle")
        .attr("cx", 1000)
        .attr('cy', (d, i) => i * 30 + 350)
        .attr("r", 6)
        .style("fill", d => color(d.key))

    legend.append("text")
        .attr("x", 1020)
        .attr("y", (d, i) => i * 30 + 355)
        .text(d => d.key)


//append title
    d3.select("svg")
        .append("text")
        .attr("x", 485)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Delay in minutes per airline")
        .style("fill", "black")
        .style("font-size", 28)
        .style("font-family", "Arial Black")


    // https://www.vis4.net/blog/2015/04/making-html-tables-in-d3-doesnt-need-to-be-a-pain/


    // column definitions
    var columns = [
        {
            head: 'Month', cl: 'center',
            html: function (r) {
                return r.month;
            }
        },
        {
            head: 'Virgin Atlantic', cl: 'title',
            html: function (r) {
                return r.VA;
            }
        },
        {
            head: 'American Airlines', cl: 'center',
            html: function (r) {
                return r.AA;
            }
        }
    ];

    // create table
    var table = d3.select('body')
        .append('table');

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', function (r) {
            return r.cl;
        })
        .text(function (r) {
            return r.head;
        });


    console.log(plot_data)
    // create table body
    table.append('tbody')
        .selectAll('tr')
        .data(plot_data).enter()
        .append('tr')
        .selectAll('td')
        .data(function (row, i) {
            return columns.map(function (c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function (k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(function (r) {
            return r.html;
        })
        .attr('class', function (r) {
            return r.cl;
        });

    function length() {
        var fmt = d3.format('02d');
        return function (l) {
            return Math.floor(l / 60) + ':' + fmt(l % 60) + '';
        };
    }

}