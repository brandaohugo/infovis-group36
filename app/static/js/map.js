//Width and height of map
const width = 960;
const height = 500;

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
let svg = d3.select("#map-view")
    .append("svg")
    .attr("viewBox", '0 0 ' + width + ' ' + height);

svg.call(zoom);

// Append Div for tooltip to SVG
let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Bind the data to the SVG and create one path per GeoJSON feature
svg.selectAll("path")
    .data(map_data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function (d) {
        return "rgb(118,118,118)";
    });

let firstSelectionBool = true
let firstSelectedAirport = null
let secondSelectedAirport = null


// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/Dtenwolde/5ca2048944fdd699a36ad7016d77605f/raw/9c62cc28a6b9972999d44d613ab99734fa49ccea/flights.csv",
    airports: "https://gist.githubusercontent.com/brandaohugo/c66a88ecac49b0af6a6a91162ebdceb8/raw/31315724924ab2ffcc199463d46f26044bdf829c/airports.csv",
    map: "https://gist.githubusercontent.com/brandaohugo/8783ee3a2567e0ef62605a74f662a85f/raw/0ca649eb8f563be9917ee063e46ee2796cc1246d/map.json"
};

function zoomed() {
    lastTransform = d3.event.transform
    zoomChanged = true
    svg
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', lastTransform);

    svg.selectAll('circle')
        .attr('transform', lastTransform)
        .attr("r", function (d) {
            return lastTransform["k"] === 1 ? locationRadius : locationRadius / Math.max(1, lastTransform['k']) + 1
        })

    svg.selectAll('line')
        .attr('transform', lastTransform);
}

function drawConnectionLine(origin, destination) {
    svg.append("line")
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

const drawAirportConnections = (originAirport, flights) => {
    let airportConnections = getAirportConnections(originAirport, flights)
    svg.selectAll("line").remove()
    airportConnections.forEach(airport => {
        drawConnectionLine(originAirport, airport)
    })
    svg.selectAll('line').attr('transform', function (d) {
        if (zoomChanged) {
            return lastTransform
        } else {
            return null
        }
    })
    drawAirports(airportConnections)
}

function drawOriDesConnection(origin, destination) {
    svg.selectAll('line').remove()
    drawConnectionLine(origin, destination)
    svg.selectAll('line').attr('transform', function (d) {
        if (zoomChanged) {
            return lastTransform
        } else {
            return null
        }
    })
}

function selectAirport(airport) {
    if (firstSelectedAirport === null) {
        firstSelectedAirport = airport
        d3.csv(urls.flights)
            .then(flights => {
                drawAirportConnections(firstSelectedAirport, flights)
                svg.selectAll("circle").style("fill", "rgb(217,91,67)")
                svg.select("#" + firstSelectedAirport.iata).style("fill", "green")
            })
    } else if (secondSelectedAirport === null) {
        if (airport === firstSelectedAirport) {
            secondSelectedAirport = null
        } else {
            secondSelectedAirport = airport
            drawOriDesConnection(firstSelectedAirport, secondSelectedAirport)
            svg.select("#" + secondSelectedAirport.iata).style("fill", "blue")

        }
    }
}

function showOriginAirportInfo() {
    d3.select("#before-origin-svg")
        .style("display", "none")

    d3.select("#origin-svg")
        .style("display", "block")
}

function resetMap() {
    svg.selectAll("line").remove()
    firstSelectedAirport = secondSelectedAirport = null
    drawAirports(airport_locations)
}

function drawAirports(airports) {
    svg.selectAll("circle").remove()
    svg.selectAll("circle")
        .data(airports)
        .enter()
        .append("svg:circle")
        .attr("id", function (d) {
            return d.iata;
        })
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
        .style("fill", "rgb(217,91,67)")
        .style("opacity", 0.85)
        .on("click", function (d) {
            selectAirport(d)
            showOriginAirportInfo()
        })

    $('svg circle').tipsy({
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

console.log(airport_locations)

drawAirports(airport_locations)
