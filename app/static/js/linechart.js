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
    let lines = d3.select('svg').append('g')
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
            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.selectAll(".line")
                .style('opacity', lineOpacity);
            d3.selectAll('circle')
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

}
    // https://www.vis4.net/blog/2015/04/making-html-tables-in-d3-doesnt-need-to-be-a-pain/
    // START HERE MARTA

    /* Modified code provided by:
    https://stackoverflow.com/questions/42919992/d3-how-to-properly-get-the-key-value-inside-of-a-json-object
    
    https://bl.ocks.org/llad/3918637
    */


//function tabulate(data) {
    // const columns = d3.keys(data[0])
    // var table = d3.select('#delay-table');
    // var thead = table.append('thead');
    // var tbody = table.append('tbody');

    // // append the header row
    // thead.append('tr')
    //     .selectAll('th')
    //     .data(columns).enter()
    //     .append('th')
    //     .text(function (column) {
    //         return column;
    //     });

    // // create a row for each object in the data
    // var rows = tbody.selectAll('tr')
    //     .data(data)
    //     .enter()
    //     .append('tr');


    // // create a cell in each row for each column
    // var cells = rows.selectAll('td')
    //     .data(function (row) {
    //         return columns.map(function (column) {
    //             return {
    //                 column: column,
    //                 value: row[column]
    //             };
    //         });
    //     })
    //     .enter()
    //     .append('td')
    //     .text(function (d) {
    //         return d.value;
    //     });
    // return table;
//}

function plotBarChart(data) {
    const containerDiv = d3.select('#delay-bar-chart');
    const svg = containerDiv.append("svg");
    const svgWidth = 1000;
    const svgHeight = (data.length + 1) * 26;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const tableWidth = 320;
    const plotWidth = svgWidth - tableWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    svg.attr("width", svgWidth)
        .attr("height", svgHeight);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left + tableWidth}, ${margin.top})`)

    const x = d3.scaleLinear()
        .range([0, plotWidth])
        .domain(d3.extent(data, (d) => d.AVG_ARR_DELAY))

    const y = d3.scaleBand()
        .range([20, height])
        .domain(data.map((d) => d.AIRLINE))

    const colorScale = d3.scaleLinear()
        .domain([d3.min(data, (d) => d.AVG_ARR_DELAY), 0, d3.max(data, (d) => d.AVG_ARR_DELAY)])
        .range(["#7fc97f", "grey", "#f0027f"])

        const textHeight = 14;
        const mouseOverHandler = (d, i) => {
            const delayText = document.getElementsByClassName("delayText")[i]
            const airlineText = document.getElementsByClassName("airlineText")[i]
            const circle = document.getElementsByClassName("lolCircle")[i]
            let xCoord;
            if (d.AVG_ARR_DELAY < 0) {
                xCoord = x(d.AVG_ARR_DELAY) - 20;
            } else {
                xCoord = x(d.AVG_ARR_DELAY) + 20;
            }
            d3.select(delayText)
                .attr("font-size", 14)
                .attr("font-weight", "bold")
                .attr("x", xCoord)
            d3.select(airlineText).attr("font-size", 14).attr("font-weight", "bold")
            d3.select(circle).attr("r", 10)
        }
        const mouseOutHandler = (d, i) => {
            const delayText = document.getElementsByClassName("delayText")[i]
            const airlineText = document.getElementsByClassName("airlineText")[i]
            const circle = document.getElementsByClassName("lolCircle")[i]
    
            let xCoord;
            if (d.AVG_ARR_DELAY < 0) {
                xCoord = x(d.AVG_ARR_DELAY) - 12;
            } else {
                xCoord = x(d.AVG_ARR_DELAY) + 12;
            }
            d3.select(delayText)
                .attr("font-size", 12)
                .attr("font-weight", "regular")
                .attr("x", xCoord)
            d3.select(airlineText).attr("font-size", 12).attr("font-weight", "normal")
            d3.select(circle).attr("r", 6)
        }

    g.append("line")
        .attr("x1", x(0))
        .attr("y1", 0)
        .attr("x2", x(0))
        .attr("y2", height)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2) // vertical axis line

    g.append("g")
        .call(d3.axisTop(x))

    g.selectAll(".lineToCircle")
        .data(data)
        .join((enter) => {
            const wrapper = enter.append("g");

            wrapper.append('line')
            .attr("x1", x(0))
            .attr("y1", (d) => y(d.AIRLINE))
            .attr("x2", (d) => x(d.AVG_ARR_DELAY))
            .attr("y2", (d) => y(d.AIRLINE))
            .style("stroke", "gray")
            .style("stroke-opacity", 1)
            .style("stroke-width", 0.5)
            .attr("class", "lineToCircle")

            wrapper.append('circle')
            .attr("cx", (d) => x(d.AVG_ARR_DELAY))
            .attr("cy", (d) => y(d.AIRLINE))
            .attr("r", 6)
            .attr("stroke", "black")
            .attr("fill", (d) => colorScale(d.AVG_ARR_DELAY))
            .attr("class", "lolCircle")

            wrapper.append('text')
            .attr("x", (d) => {
                if (d.AVG_ARR_DELAY < 0) {
                    return x(0) + 4;
                }
                return  x(0) - 4;
            })
            .attr("y", (d) => y(d.AIRLINE) + textHeight / 2 - 3)
            .attr("class", "airlineText")
            .text((d) => d.AIRLINE)
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", (d) => {
                if (d.AVG_ARR_DELAY < 0) {
                    return 'start';
                }

                return 'end';
            })

            wrapper.append('text')
            .attr("x", (d) => {
                if (d.AVG_ARR_DELAY < 0) {
                    return x(d.AVG_ARR_DELAY) - 8 - 4;
                }
                return x(d.AVG_ARR_DELAY) + 8 + 4;
            })
            .attr("y", (d) => y(d.AIRLINE) + textHeight / 2 - 3)
            .attr("class", "delayText")
            .text((d) => d.AVG_ARR_DELAY)
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", (d) => {
                if (d.AVG_ARR_DELAY < 0) {
                    return 'end';
                }
                return 'start';
            })

            wrapper
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler)

            return wrapper;
        })
}