// Author: Daniel


//Width and height of map
const width = 900;
const height = 800;

let locationRadius = 4;
let lastTransform = {'k': 1, 'x': 0, 'y': 0}; // Default zoom settings
let zoomChanged = false

let selectedOriginAirport = null
let selectedDestinationAirport = null


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
let mapSvg = d3.select("#map-view")
    .append("svg")
    .attr("viewBox", '0 0 ' + width + ' ' + height);

mapSvg.call(zoom);

// Append Div for tooltip to SVG
let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Bind the data to the SVG and create one path per GeoJSON feature
mapSvg.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", colorPalette.LCyan)
    .style("stroke-width", "1")
    .style("fill", colorPalette.BBlue);


function expandAirportInformation(origin, airport) {
    d3.csv(urls.flights)
        .then(flights => {
            for (let i = 0; i < flights.length; i++) {
                if (origin.iata === flights[i].origin && airport.iata === flights[i].destination) {
                    let airportInformation = {...airport, ...(flights[i])}
                    delete airportInformation['destination'];
                    selectDestinationAirport(airportInformation)
                }
            }
        })
}

const onClickFlow = (d) => {
    for (let i = 0; i < airportLocations.length; i++) {
        if (d.target.name === airportLocations[i].iata) {
            expandAirportInformation(selectedOriginAirport, airportLocations[i])
            return [airportLocations[i]]
        }
    }
}

function zoomed() {
    lastTransform = d3.event.transform
    zoomChanged = true
    mapSvg
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', lastTransform);

    mapSvg.selectAll('circle')
        .attr('transform', lastTransform)
        .attr("r", function (d) {
            return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1
        })

    mapSvg.selectAll('line')
        .attr('transform', lastTransform);
}

function drawConnectionLine(origin, destination) {
    mapSvg.append("line")
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
        for (let i = 0; i < airportLocations.length; i++) {
            if (airportLocations[i].iata === flight.destination) {

                let airport_information = {...airportLocations[i], ...(flight)}
                delete airport_information['destination'];
                filteredAirportLocations.push(airport_information)
                break
            }
        }
    })
    return filteredAirportLocations
}

function drawLegend() {
    mapSvg.select("text").remove()
    mapSvg.select("mydots").remove()
    mapSvg.select("mylabels").remove()
    let keys = ["< 0", ">= 0 and =< 5 ", "> 5"]

    // Usually you have a color scale in your chart already
    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(["green", "orange", "red"]);

    // Add one dot in the legend for each name.
    let size = 20
    let xPos = 50
    let yPos = 50
    mapSvg
        .append("text")
        .text("Average delay in minutes")
        .attr("x", xPos)
        .attr("y", yPos - 10)
        .attr("width", size)
        .attr("height", size)
        .style("fill", "black")
        .style("font-size", "34px")

    mapSvg.selectAll("mydots")
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

    mapSvg.selectAll("mylabels")
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
    mapSvg.selectAll("line").remove()
    airportConnections.forEach(airport => {
        drawConnectionLine(originAirport, airport)
    })
    mapSvg.selectAll('line').attr('transform', function (d) {
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
    mapSvg.selectAll('line').remove()
    drawConnectionLine(origin, destination)
    mapSvg.selectAll('line').attr('transform', function (d) {
        if (zoomChanged) {
            return lastTransform
        } else {
            return null
        }
    })
}


function selectOriginAirport(airport) {
    selectedOriginAirport = airport
    selectedDestinationAirport = null

    d3.select("#navbar-top")
        .style("display", "none")
    d3.select("#landing-text")
        .style("display", "none")

    d3.select("#origin-input-selector")
        .property("value", `${airport.name} (${airport.iata})`)

    d3.csv(urls.flights)
        .then(flights => {
            drawAirportConnections(selectedOriginAirport, flights)
            mapSvg.selectAll("circle").style("fill", colorPalette.BSienna)
            mapSvg.select("#" + selectedOriginAirport.iata).style("fill", colorPalette.Gunmetal)
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
            drawOriginAirportFlow(selectedOriginAirport, flights, flowOptions, onClickFlow);
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
    if (airport === selectedOriginAirport) { // If selected airport is equal to origin airport
        selectedDestinationAirport = null
    } else {
        selectedDestinationAirport = airport

        d3.select("#gauge-bar-row")
            .style("visibility", "visible")

        d3.select("#destination-input-selector")
            .property("value", `${airport.name} (${airport.iata})`)

        drawOriDesConnection(selectedOriginAirport, selectedDestinationAirport)
        mapSvg.select("#" + selectedDestinationAirport.iata).style("fill", "blue")
        const Spideroptions = {
            titleFontSize: "12px",
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
                    el.orig === selectedOriginAirport.iata &&
                    el.dest === selectedDestinationAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Month",
                    divId: "#od-chart",
                    frequency: 12,
                    showLabels: true,
                    chartWidth: 480,
                    chartHeight: 320
                }
                setTimeout(() => drawSpiderWebChart(ODData, options), 1000);
            });
        // Day of month
        d3.csv(urls.aggrDayOfMonth)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === selectedOriginAirport.iata &&
                    el.dest === selectedDestinationAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Day of the Month",
                    divId: "#od-chart",
                    frequency: 31,
                    showLabels: false,
                    chartWidth: 260,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });
        d3.csv(urls.aggrHourOfDay)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === selectedOriginAirport.iata &&
                    el.dest === selectedDestinationAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Hour of Day",
                    divId: "#od-chart",
                    frequency: 24,
                    showLabels: false,
                    chartWidth: 260,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });
        d3.csv(urls.aggrDayOfWeek)
            .then(rawData => {
                const ODData = rawData.filter(el =>
                    el.orig === selectedOriginAirport.iata &&
                    el.dest === selectedDestinationAirport.iata
                );
                let options = {
                    ...Spideroptions,
                    chartTitle: "% Delayed Flights - Day of Week",
                    divId: "#od-chart",
                    frequency: 7,
                    showLabels: false,
                    chartWidth: 260,
                    chartHeight: 320
                }
                drawSpiderWebChart(ODData, options)

            });

        drawDestinationAirportInfoBox(selectedDestinationAirport)
        createGaugeChart()
        updateGaugeChart({
            origin: selectedOriginAirport.iata,
            destination: selectedDestinationAirport.iata
        })
        drawLollipopChart(selectedOriginAirport.iata, selectedDestinationAirport.iata);

        makeBarchart(selectedOriginAirport.iata, selectedDestinationAirport.iata)
        showDestinationAirportInfo()

    }
}

function selectAirport(airport) {
    if (selectedOriginAirport === null) {
        selectOriginAirport(airport)
        // showSecondInputField()

    } else if (selectedDestinationAirport === null) {
        selectDestinationAirport(airport)

    }
}

function resetMap() {
    mapSvg.selectAll("line").remove()
    d3.select("#origin-chart").select('svg').remove()
    d3.select("#origin-flights").select('svg').remove()
    d3.select("#origin-connections").select('svg').remove()
    d3.select("#origin-cancelled").select('svg').remove()
    d3.select("#od-flights").select('svg').remove()
    d3.select("#od-rank").select('svg').remove()
    d3.select("#od-cancelled").select('svg').remove()

    selectedOriginAirport = selectedDestinationAirport = null
    drawAirports(airportLocations)
}

function resetMapDestination() {
    mapSvg.selectAll("line").remove()
    d3.select("#origin-chart").select('svg').remove()
    selectedDestinationAirport = null
    selectOriginAirport(selectedOriginAirport)
}

function drawAirports(airports) {
    mapSvg.selectAll("circle").remove()
    mapSvg.selectAll("circle")
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
        .style("fill", colorPalette.BSienna)
        .style("opacity", 0.85)
        .on("click", function (d) {
            $(".tipsy").remove();
            selectAirport(d)
        })
        .on("mouseover", function (d, i) {
            d3.select(this)
                .style("opacity", 1)
                .attr("r", function (_) {
                    return (lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1) * 2
                })
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .style("opacity", 0.85)
                .attr("r", function (_) {
                    return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1

                })
        });

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

drawAirports(airportLocations)
