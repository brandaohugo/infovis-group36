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
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function (d) {
        //If value is undefined…
        return "rgb(118,118,118)";
    });

let firstSelectionBool = true
let firstSelectedAirport = null
let secondSelectedAirport = null


// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/brandaohugo/95cd2011017b3da45a12849705e2e453/raw/8632dfe829f10f85a978fddb3a8a52856da380b5/flights.csv",
    airports: "https://gist.githubusercontent.com/brandaohugo/c66a88ecac49b0af6a6a91162ebdceb8/raw/31315724924ab2ffcc199463d46f26044bdf829c/airports.csv",
    map: "https://gist.githubusercontent.com/brandaohugo/8783ee3a2567e0ef62605a74f662a85f/raw/0ca649eb8f563be9917ee063e46ee2796cc1246d/map.json"
};

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

function fadeOutAirports(filteredAirportLocations) {
    for (let i = 0; i < airport_locations.length; i++) {
        if (!filteredAirportLocations.includes(airport_locations[i])) {
            d3.select("#" + airport_locations[i].iata).style("opacity", 0.3)
        } else {
            d3.select("#" + airport_locations[i].iata).style("opacity", 0.85)
        }
    }
}

function drawConnectionLine(origin, destination) {
    map_svg.append("line")
        .style("stroke", "black")
        .style("opacity", 0.85)
        // TODO: Reimplement stroke-width
        // .style("stroke-width", function () {
        //     if (flight.count > 100) {
        //         return 2
        //     } else {
        //         return 1
        //     }
        // })
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
                filteredAirportLocations.push(airport_locations[i])
                break
            }
        }
    })

    return filteredAirportLocations
}

const drawAirportConnections = (originAirport, flights) => {
    let airportConnections = getAirportConnections(originAirport, flights)

    map_svg.selectAll("line").remove()
    airportConnections.forEach(flight => {
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === flight.iata) {
                console.log(flight)
                drawConnectionLine(originAirport, airport_locations[i])
                break
            }
        }

    })
    map_svg.selectAll('line').attr('transform', lastTransform);

    fadeOutAirports(airportConnections)
}

function drawOriDesConnection(origin, destination) {
    map_svg.selectAll('line').remove()
    drawConnectionLine(origin, destination)
    fadeOutAirports([origin, destination])
    map_svg.selectAll('line').attr('transform', lastTransform);
}

function selectAirport(d) {
    // firstSelectedAirport = d
    // d3.csv(urls.flights)
    //     .then(flights => {
    //         drawAirportConnections(d, flights)
    //         svg.selectAll("circle").style("fill", "rgb(217,91,67)")
    //         svg.select("#" + firstSelectedAirport.iata).style("fill", "green")
    //     })
    if (firstSelectedAirport === null) {
        firstSelectedAirport = d
        d3.csv(urls.flights)
            .then(flights => {
                drawAirportConnections(firstSelectedAirport, flights)
                map_svg.selectAll("circle").style("fill", "rgb(217,91,67)")
                map_svg.select("#" + firstSelectedAirport.iata).style("fill", "green")
                showOriginAirportInfo()
            })
    } else if (secondSelectedAirport === null) {
        secondSelectedAirport = d
        d3.csv(urls.flights)
            .then(flights => {
                if (getAirportConnections(firstSelectedAirport, flights).includes(secondSelectedAirport)) {
                    drawOriDesConnection(firstSelectedAirport, secondSelectedAirport)
                    map_svg.select("#" + secondSelectedAirport.iata).style("fill", "blue")
                    showDestinationAirportInfo()

                } else {
                    alert("These two airports do not have a connection, try a different airport")
                    secondSelectedAirport = null
                }
            })
    }
    // } else if (firstSelectionBool) {
    //     firstSelectedAirport = d
    //     firstSelectionBool = !firstSelectionBool
    //     console.log(firstSelectionBool)
    // } else {
    //     secondSelectedAirport = d
    //     firstSelectionBool = !firstSelectionBool
    // }


    // console.log(firstSelectedAirport, secondSelectedAirport)
    // d3.select("#" + firstSelectedAirport.iata).style("fill", "green")
    //
    // if (secondSelectedAirport !== null) {
    //     svg.selectAll("line").remove()
    //     d3.select("#" + secondSelectedAirport.iata).style("fill", "blue")
    //     svg.append("line")
    //         .style("stroke", "black")
    //         .attr("id", firstSelectedAirport.iata + secondSelectedAirport.iata)
    //         .attr("x1", projection([firstSelectedAirport.longitude, firstSelectedAirport.latitude])[0])
    //         .attr("y1", projection([firstSelectedAirport.longitude, firstSelectedAirport.latitude])[1])
    //         .attr("x2", projection([secondSelectedAirport.longitude, secondSelectedAirport.latitude])[0])
    //         .attr("y2", projection([secondSelectedAirport.longitude, secondSelectedAirport.latitude])[1])
    //
    // }

}

function showOriginAirportInfo() {
    d3.select("#before-origin-svg")
        .style("display", "none")

    d3.select("#origin-svg")
        .style("display", "block")
}

function showDestinationAirportInfo() {
    d3.select("#map-view")
        .style("display", "none")

    d3.select("#origin-chart")
        .style("display", "none")

    d3.select("#destination-airport")
        .style("display", "block")

    d3.select("#od-chart")
        .style("display", "block")
}

function resetMap() {
    map_svg.selectAll("line").remove()
    firstSelectedAirport = secondSelectedAirport = null
    drawAirports(airport_locations)
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


drawAirports(airport_locations)
