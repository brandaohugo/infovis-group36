//Width and height of map
const width = 900;
const height = 800;

let locationRadius = 4;
let lastTransform = {'k': 1, 'x': 0, 'y': 0}; // Default zoom settings
let zoomChanged = false

// D3 Projection
let projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])    // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
let path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection

const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', zoomed);

//Create SVG element and append map to the SVG
let map_svg = d3.select("#map-view")
    .append("svg")
    .attr("viewBox", '0 0 ' + width + ' ' + height);

map_svg.call(zoom);

// Append Div for tooltip to SVG
let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Bind the data to the SVG and create one path per GeoJSON feature
map_svg.selectAll("path")
    .data(map_data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", color_palette.LCyan)
    .style("stroke-width", "1")
    .style("fill", color_palette.BBlue);

let firstSelectedAirport = null
let secondSelectedAirport = null


// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/Dtenwolde/5ca2048944fdd699a36ad7016d77605f/raw/b9ee6cb5313f1b3c066dc4ad95f584c5651078fd/flights.csv",
    map: "https://gist.githubusercontent.com/brandaohugo/8783ee3a2567e0ef62605a74f662a85f/raw/0ca649eb8f563be9917ee063e46ee2796cc1246d/map.json",
    avgMonthDelay: "http://localhost:5000/data/global_avg_month_delay.csv",
    aggrDayOfWeek: "https://gist.githubusercontent.com/brandaohugo/a591bc1f6d9f7c4e9f927edcc8700fb8/raw/e351345af1f900d887177711dfa9f1da5e4fc309/aggr_day_of_week.csv",
    aggrDayOfMonth: "https://gist.githubusercontent.com/brandaohugo/a591bc1f6d9f7c4e9f927edcc8700fb8/raw/e351345af1f900d887177711dfa9f1da5e4fc309/aggr_day_of_month.csv",
    aggrHourOfDay: "https://gist.githubusercontent.com/brandaohugo/a591bc1f6d9f7c4e9f927edcc8700fb8/raw/e351345af1f900d887177711dfa9f1da5e4fc309/aggr_hour_of_day.csv",
    aggrMonth: "https://gist.githubusercontent.com/brandaohugo/a591bc1f6d9f7c4e9f927edcc8700fb8/raw/e351345af1f900d887177711dfa9f1da5e4fc309/aggr_month.csv"
};

function expandAirportInformation(origin, airport) {

    d3.csv(urls.flights)
        .then(flights => {
            for (let i = 0; i < flights.length; i++) {
                if (origin.iata === flights[i].origin && airport.iata === flights[i].destination) {
                    let airport_information = {...airport, ...(flights[i])}
                    delete airport_information['destination'];
                    selectDestinationAirport(airport_information)
                }
            }
        })
}

const onClickFlow = (d) => {
    for (let i = 0; i < airport_locations.length; i++) {
        if (d.target.name === airport_locations[i].iata) {
            expandAirportInformation(firstSelectedAirport, airport_locations[i])
            return [airport_locations[i]]
        }
    }
}

function zoomed() {
    lastTransform = d3.event.transform
    zoomChanged = true
    map_svg
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', lastTransform);

    map_svg.selectAll('circle')
        .attr('transform', lastTransform)
        .attr("r", function (d) {
            return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1
        })

    map_svg.selectAll('line')
        .attr('transform', lastTransform);
}

function drawConnectionLine(origin, destination) {
    map_svg.append("line")
        .style("stroke", function () {
            if (destination.arr_delay < 0) {
                return "green"
            } else if (destination.arr_delay > 5) {
                return "red"
            } else {
                return "orange"
            }
        })
        .style("opacity", 0.85)
        .style("stroke-width", function () {
            if (destination.flight_volume > 100) {
                return 2
            } else {
                return 1
            }
        })
        .attr("id", origin.iata + destination.iata)
        .attr("x1", projection([origin.longitude, origin.latitude])[0])
        .attr("y1", projection([origin.longitude, origin.latitude])[1])
        .attr("x2", projection([destination.longitude, destination.latitude])[0])
        .attr("y2", projection([destination.longitude, destination.latitude])[1])
}

function getAirportConnections(originAirport, flights) {
    let filteredFlights = flights.filter(i => i.origin === originAirport.iata)
    let filteredAirportLocations = [originAirport]

    filteredFlights.forEach(flight => {
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === flight.destination) {

                let airport_information = {...airport_locations[i], ...(flight)}
                delete airport_information['destination'];
                filteredAirportLocations.push(airport_information)
                break
            }
        }
    })
    return filteredAirportLocations
}

function drawLegend() {
    map_svg.select("text").remove()
    map_svg.select("mydots").remove()
    map_svg.select("mylabels").remove()
    var keys = ["< 0", ">= 0 and =< 5 ", "> 5"]

// Usually you have a color scale in your chart already
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(["green", "orange", "red"]);

    // Add one dot in the legend for each name.
    var size = 20
    let xPos = 50
    let yPos = 50
    map_svg
        .append("text")
        .text("Average delay in minutes")
        .attr("x", xPos)
        .attr("y", yPos - 10)
        .attr("width", size)
        .attr("height", size)
        .style("fill", "black")
        .style("font-size", "34px")

    map_svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", xPos)
        .attr("y", function (d, i) {
            return yPos + i * (size + 5)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) {
            return color(d)
        })

    map_svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", xPos + size * 1.2)
        .attr("y", function (d, i) {
            return yPos + i * (size + 5) + (size / 2)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) {
            return color(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

}

const drawAirportConnections = (originAirport, flights) => {
    let airportConnections = getAirportConnections(originAirport, flights)
    map_svg.selectAll("line").remove()
    airportConnections.forEach(airport => {
        drawConnectionLine(originAirport, airport)
    })
    map_svg.selectAll('line').attr('transform', function (d) {
        if (zoomChanged) {
            return lastTransform
        } else {
            return null
        }
    })
    drawLegend()
    drawAirports(airportConnections)
}

function drawOriDesConnection(origin, destination) {
    map_svg.selectAll('line').remove()
    drawConnectionLine(origin, destination)
    map_svg.selectAll('line').attr('transform', function (d) {
        if (zoomChanged) {
            return lastTransform
        } else {
            return null
        }
    })
}


function selectOriginAirport(airport) {
    firstSelectedAirport = airport
    secondSelectedAirport = null

    d3.select("#navbar-top")
        .style("display", "none")
    d3.select("#landing-text")
        .style("display", "none")

    d3.select("#origin-input-selector")
        .property("value", `${airport.name} (${airport.iata})`)

    d3.csv(urls.flights)
        .then(flights => {
            drawAirportConnections(firstSelectedAirport, flights)
            map_svg.selectAll("circle").style("fill", color_palette.BSienna)
            map_svg.select("#" + firstSelectedAirport.iata).style("fill", color_palette.Gunmetal)
            const flowOptions = {
                margins: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                divId: "#origin-chart",
                svgWidth: 950,
                svgHeight: 190,
                nodeWidth: 10,
                nodePadding: 15
            }
            drawOriginAirportFlow(firstSelectedAirport, flights, flowOptions, onClickFlow);
        })
    drawOriginAirportInfoBox(airport)
    const destinationVal = $('#destination-input-selector').val()
    if (destinationVal) {
        const destIata = destinationVal.match(/\(([A-Z]+)\)/)[1]
        drawLollipopChart(airport.iata, destIata);
    } else {
        drawLollipopChart(airport.iata);
    }

    d3.select("#destination-form")
        .style("display", "block")

    d3.select("#lollipop-chart")
        .style("display", "block")
}

function selectDestinationAirport(airport) {
    console.log("Selected Destination airport")
    if (airport === firstSelectedAirport) { // If selected airport is equal to origin airport
        secondSelectedAirport = null
    } else {
        secondSelectedAirport = airport

        d3.select("#gauge-bar-row")
            .style("visibility", "visible")

        d3.select("#destination-input-selector")
            .property("value", `${airport.name} (${airport.iata})`)

        drawOriDesConnection(firstSelectedAirport, secondSelectedAirport)
        map_svg.select("#" + secondSelectedAirport.iata).style("fill", "blue")
        const Spideroptions = {
            titleFontSize: "12px",
            divId: "#od-chart",
            maxLabels: 6,
            numTicks: 5,
            chartMargin: 50,
            labelsYOffset: -50,
            labelLineHeight: 15,
            labelFontSize: "12px"
        };
        // Month
        d3.csv(urls.aggrMonth)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === firstSelectedAirport.iata &&
                    el.dest === secondSelectedAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Month",
                    frequency: 12,
                    showLabels: false,
                    chartWidth: 320,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)
            });
        // Day of month
        d3.csv(urls.aggrDayOfMonth)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === firstSelectedAirport.iata &&
                    el.dest === secondSelectedAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Day of the Month",
                    frequency: 31,
                    showLabels: true,
                    chartWidth: 480,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });
        d3.csv(urls.aggrHourOfDay)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === firstSelectedAirport.iata &&
                    el.dest === secondSelectedAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Hour of Day",
                    frequency: 24,
                    showLabels: false,
                    chartWidth: 320,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });
        d3.csv(urls.aggrDayOfWeek)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === firstSelectedAirport.iata &&
                    el.dest === secondSelectedAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Day of Week",
                    frequency: 7,
                    showLabels: false,
                    chartWidth: 320,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });

        console.log("First airport", firstSelectedAirport)
        console.log("Second airport", secondSelectedAirport)
        drawDestinationAirportInfoBox(secondSelectedAirport)
        createGaugeChart()
        updateGaugeChart({
            origin: firstSelectedAirport.iata,
            destination: secondSelectedAirport.iata
        })
        drawLollipopChart(firstSelectedAirport.iata, secondSelectedAirport.iata);

        makeBarchart(firstSelectedAirport.iata, secondSelectedAirport.iata)
        showDestinationAirportInfo()

    }
}


function selectAirport(airport) {
    if (firstSelectedAirport === null) {
        selectOriginAirport(airport)
        // showSecondInputField()

    } else if (secondSelectedAirport === null) {
        selectDestinationAirport(airport)

    }
}

function showOriginAirportInfo() {
    d3.select("#before-origin-svg")
        .style("display", "none")

    d3.select("#origin-svg")
        .style("display", "block")
}

function resetMap() {
    map_svg.selectAll("line").remove()
    d3.select("#origin-chart").select('svg').remove()
    d3.select("#origin-flights").select('svg').remove()
    d3.select("#origin-connections").select('svg').remove()
    d3.select("#origin-cancelled").select('svg').remove()
    d3.select("#od-flights").select('svg').remove()
    d3.select("#od-rank").select('svg').remove()
    d3.select("#od-cancelled").select('svg').remove()

    firstSelectedAirport = secondSelectedAirport = null
    drawAirports(airport_locations)
}

function resetMapDestination() {
    map_svg.selectAll("line").remove()
    d3.select("#origin-chart").select('svg').remove()
    secondSelectedAirport = null
    selectOriginAirport(firstSelectedAirport)
}

function drawAirports(airports) {
    map_svg.selectAll("circle").remove()
    map_svg.selectAll("circle")
        .data(airports)
        .enter()
        .append("svg:circle")
        .attr("id", function (d) {
            return d.iata;
        })
        .attr("class", "airport-circle")
        .attr("cx", function (d) {
            try {
                return projection([d.longitude, d.latitude])[0]
            } catch (error) {
                console.error("Projection went wrong with airport: " + d.name)
            }
        })
        .attr("cy", function (d) {
            try {
                return projection([d.longitude, d.latitude])[1]
            } catch (error) {
                console.error("Projection went wrong with airport: " + d.name)
            }
        })
        .attr('transform', function (d) {
            if (zoomChanged) {
                return lastTransform
            } else {
                return null
            }
        })
        .attr("r", function (d) {
            return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1
        })
        .style("fill", color_palette.BSienna)
        .style("opacity", 0.85)
        .on("click", function (d) {
            $(".tipsy").remove();
            selectAirport(d)
        })
        .on("mouseover", function (d, i) {
            d3.select(this)
                .style("opacity", 1)
                .attr("r", function (d) {
                    return (lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1) * 2
                })
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .style("opacity", 0.85)
                .attr("r", function (d) {
                    return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1

                })
        });

    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {  // Add interactivity
        console.log(d)
        // Use D3 to select element, change color and size
        d3.select(this).attr({
            fill: "green",
            // r: (lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1) * 2,
        });
    }

    function handleMouseOut(d, i) {
        // Use D3 to select element, change color back to normal
        d3.select(this).attr({

            r: lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1,
        });

        // Select text by id and then remove
        d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
    }


    $('.airport-circle').tipsy({
        gravity: 'w',
        html: true,
        title: function () {
            let iata = this.__data__.iata
            let city = this.__data__.city
            let name = this.__data__.name

            return 'IATA: ' + iata + '<br/>' +
                'Airport Name: ' + name + '<br/>' +
                'City: ' + city;
        }
    })
}


drawAirports(airport_locations)
