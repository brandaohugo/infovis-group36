function removeOldBarchart() {
    d3.select("#barchart-body")
        .remove();
}

function makeBarchart(origin, destination) {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        chart_width = 430 - margin.left - margin.right,
        chart_height = 300 - margin.top - margin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select("#delay-barchart")
        .append("svg")
        .attr("id", "barchart-body")
        .attr("width", chart_width + margin.left + margin.right)
        .attr("height", chart_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Add Title
    d3.select("svg#barchart-body")
        .append("text")
        .attr("class", "title")
        .attr("x", ((chart_width + margin.left + margin.right) / 2))
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Top 5 Delay Causes");

    // Parse the Data
    var dataPoint = flightsData.find((data) => {
        return data.origin === origin && data.destination === destination;
    });

    function draw(data) {
        var barPlotData = [
            {name: 'Carrier', data: data.CARRIER_DELAY * 100},
            {name: 'Weather', data: data.WEATHER_DELAY * 100},
            {name: 'NAS', data: data.NAS_DELAY * 100},
            {name: 'Security', data: data.SECURITY_DELAY * 100},
            {name: 'Late aircraft', data: data.LATE_AIRCRAFT_DELAY * 100}
        ]
        var sortedData = barPlotData.sort((a, b) => b.data - a.data);
        // X axis
        var x = d3.scaleBand()
            .range([0, chart_width])
            .domain(sortedData.map((d) => d.name))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + chart_height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([chart_height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
        // .call(d3.axisLeft(y).tickFormat((interval, i) => {return i % 2 === 0 ? interval : ''}));


        // Bars
        svg.selectAll(".mybar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.name);
            })
            .attr("y", function (d) {
                return y(d.data);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return chart_height - y(d.data);
            })
            .attr("fill", "#98C1D9")
            .attr('class', 'mybar')
            .attr("id", function (d, i) {
                return "bar_" + i
            })

        //color top Bar
        d3.select("rect#bar_0")
            .attr("fill", "#EE6C4D");

        svg.selectAll('.bar-text')
            .data(sortedData)
            .enter()
            .append('text')
            .attr("x", function (d) {
                return x(d.name) + x.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return y(d.data) - 4;
            })
            .attr("text-anchor", "middle")
            .text((d) => Number.parseFloat(d.data).toPrecision(2) + '%')

    }

    draw(dataPoint);
}

