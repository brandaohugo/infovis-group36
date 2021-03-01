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
        //If value is undefined…
        return "rgb(118,118,118)";
    });

let firstSelectionBool = true
let firstSelectedAirport = null
let secondSelectedAirport = null


 // the function for moving the nodes
const dragmove = (d) => {
        d3.select(this)
        .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                    0, Math.min(height - d.dy, d3.event.y))
                    ) + ")");
        sankey.relayout();
        link.attr("d", sankey.link() );
}


const showOriginAirportFlow = (origin, flights) => {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    w = 540 - margin.left - margin.right,
    h = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#secondchart").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Color scale used
    var color = d3.scaleOrdinal(d3.schemePastel1);

    // Set the sankey diagram properties
    var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(15)
    .size([w, h]);

    const destFlights = flights.filter( el => {
        return origin.iata == el.origin
    })
    
    const nodes = destFlights.map((el, i) => {
        return {node: i+1, name: el.destination}
    })
    nodes.push({node:0, name:origin.iata})

    const links = destFlights.map(el => {
        let t = nodes.find(e => e.name == el.destination);
        return {source: 0, target: t.node, value: el.count }
    })

    sankey
        .nodes(nodes)
        .links(links)
        .layout(1);

    // add in the links
    var link = svg.append("g")
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link() )
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });

    // add in the nodes
    var node = svg.append("g")
    .selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    // .call(d3.drag()
        // .subject(function(d) { return d; })
        // .on("start", function() { this.parentNode.appendChild(this); })
        // .on("drag", dragmove));


    // add the rectangles for the nodes
    node
    .append("rect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    // Add hover text
    .append("title")
    .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });

    // add in the title for the nodes
    node
    .append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");


    // load the data
    // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_sankey.json", function(error, graph) {
    

   
    // });
};

// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/brandaohugo/95cd2011017b3da45a12849705e2e453/raw/8632dfe829f10f85a978fddb3a8a52856da380b5/flights.csv",
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
    svg.append("line")
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

    svg.selectAll("line").remove()
    airportConnections.forEach(flight => {
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === flight.iata) {
                console.log(flight)
                drawConnectionLine(originAirport, airport_locations[i])
                break
            }
        }

    })
    svg.selectAll('line').attr('transform', lastTransform);

    fadeOutAirports(airportConnections)
}

function drawOriDesConnection(origin, destination) {
    svg.selectAll('line').remove()
    drawConnectionLine(origin, destination)
    fadeOutAirports([origin, destination])
    svg.selectAll('line').attr('transform', lastTransform);
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
                svg.selectAll("circle").style("fill", "rgb(217,91,67)")
                svg.select("#" + firstSelectedAirport.iata).style("fill", "green")
                showOriginAirportFlow(d, flights)
            })   
    } else if (secondSelectedAirport === null) {
        secondSelectedAirport = d
        d3.csv(urls.flights)
            .then(flights => {
                if (getAirportConnections(firstSelectedAirport, flights).includes(secondSelectedAirport)) {
                    drawOriDesConnection(firstSelectedAirport, secondSelectedAirport)
                    svg.select("#" + secondSelectedAirport.iata).style("fill", "blue")

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


drawAirports(airport_locations)
