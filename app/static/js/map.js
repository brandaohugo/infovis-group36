
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
        return "rgb(118,118,118)";
    });

let firstSelectionBool = true
let firstSelectedAirport = null
let secondSelectedAirport = null

// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/Dtenwolde/5ca2048944fdd699a36ad7016d77605f/raw/9c62cc28a6b9972999d44d613ab99734fa49ccea/flights.csv",
    airports: "https://gist.githubusercontent.com/brandaohugo/c66a88ecac49b0af6a6a91162ebdceb8/raw/31315724924ab2ffcc199463d46f26044bdf829c/airports.csv",
    map: "https://gist.githubusercontent.com/brandaohugo/8783ee3a2567e0ef62605a74f662a85f/raw/0ca649eb8f563be9917ee063e46ee2796cc1246d/map.json",
    avgMonthDelay: "https://gist.githubusercontent.com/brandaohugo/2afd4888532bd563d5dcd20d5d741423/raw/a02e4a00c13e8fa025625b002db4200a5a0c0e55/avg_flight_delay_month.csv"
};


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
    link.attr("d", sankey.link());
}

const convertDataToSpider =(dataIn) => {
    const keySet = new Set();
    dataIn.forEach(f => {
        keySet.add(f.airline)
    })
    const airlineData = [];
    const airlineNames = [];
    keySet.forEach(k => {
        const airline = {}
        const airlineArrays = dataIn.filter(el  => el.airline == k)
        airlineArrays.forEach(el => {
            month = el.period
            delay = Math.max(0,el.avg_delay)
            airline[month] = delay
        })
        airlineNames.push(k)
        airlineData.push(airline)
    })
    return {
        airlineNames,
        airlineData
    }
}


const drawSpiderWebChart = (airlineNames, airlineData, features) => {
    
        
    const diameter = 20;
    const maxAirlines = 4

    let svg = d3.select("body").append("svg")
        .attr("width", 600)
        .attr("height", 600);


    let radialScale = d3.scaleLinear()
        .domain([0,diameter])
        .range([0,250]);
    let ticks = [5,10,15,20];
   
    ticks.forEach(t =>
        svg.append("circle")
        .attr("cx", 300)
        .attr("cy", 300)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", radialScale(t))
    );

    ticks.forEach(t =>
        svg.append("text")
        .attr("x", 305)
        .attr("y", 300-radialScale(t))
        .text(t.toString())
    );

    const angleToCoordinate = (angle, value) => {
        let x = Math.cos(angle) * radialScale(value);
        let y  = Math.sin(angle) * radialScale(value);
        return {"x": 300 + x, "y": 300-y}
    }

    for (var i = 0 ; i < features.length; i++) {
        let featureName =  features[i];
        let angle  = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let lineCoordinate = angleToCoordinate(angle, diameter);
        let labelCoordinate = angleToCoordinate(angle, diameter + 0.5);

        svg.append("line")
        .attr("x1", 300)
        .attr("y1", 300)
        .attr("x2", lineCoordinate.x)
        .attr("y2", lineCoordinate.y)
        .attr("stroke", "black");

        svg.append("text")
        .attr("x", labelCoordinate.x)
        .attr("y", labelCoordinate.y)
        .text(featureName);
    }

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    let colors = ["gold", "blue", "green", "black", "grey", "darkgreen", "yellow", "pink", "brown", "slateblue", "grey1", "orange"]

    const getPathCoordinates = (dataPoint) => {
        let coordinates = [];
        for (var i = 0; i < features.length; i++){
            let featureName = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, dataPoint[featureName]));
        }
        return coordinates;
    }


    for (var i = 0; i < maxAirlines; i++) {
        let d = airlineData[i];
        let color = colors[i];
        let coordinates = getPathCoordinates(d);

        console.log(d)
        console.log("coordinates", coordinates);

        svg.append("text")
        .attr("x", 400)
        .attr("y", 300 + i * 20)
        .style("fill",color)
        .style("font-size", "20px")
        .text(airlineNames[i]);
        
        svg.append("path")
            .attr("d",line(coordinates))
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.3);
    }
}

const showOriginAirportFlow = (origin, flights) => {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        w = 540 - margin.left - margin.right,
        h = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#origin-chart").append("svg")
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

    const destFlights = flights.filter(el => {
        return origin.iata == el.origin
    })

    const nodes = destFlights.map((el, i) => {
        return {node: i + 1, name: el.destination}
    })
    nodes.push({node: 0, name: origin.iata})

    const links = destFlights.map(el => {
        let t = nodes.find(e => e.name == el.destination);
        return {source: 0, target: t.node, value: el.flight_volume}
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
        .attr("d", sankey.link())
        .style("stroke-width", function (d) {
            return Math.max(1, d.dy);
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        });

    // add in the nodes
    var node = svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
    // .call(d3.drag()
    // .subject(function(d) { return d; })
    // .on("start", function() { this.parentNode.appendChild(this); })
    // .on("drag", dragmove));


    // add the rectangles for the nodes
    node
        .append("rect")
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(2);
        })
        // Add hover text
        .append("title")
        .text(function (d) {
            return d.name + "\n" + "There is " + d.value + " stuff in this node";
        });

    // add in the title for the nodes
    node
        .append("text")
        .attr("x", -6)
        .attr("y", function (d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
            return d.name;
        })
        .filter(function (d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");


    // load the data
    // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_sankey.json", function(error, graph) {


    // });
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
    d3.csv(urls.avgMonthDelay)
        .then(avgMonthDelay => {
            const {airlineNames, airlineData} = convertDataToSpider(avgMonthDelay);
            const features = Object.keys(airlineData[0]);
            drawSpiderWebChart(airlineNames, airlineData, features)
        }
    )
}

function selectOriginAirport(airport) {
    firstSelectedAirport = airport
    secondSelectedAirport = null

    d3.select("#origin-input-selector")
        .property("value", `${airport.name} (${airport.iata})`)

    d3.csv(urls.flights)
        .then(flights => {
            drawAirportConnections(firstSelectedAirport, flights)
            map_svg.selectAll("circle").style("fill", "rgb(217,91,67)")
            map_svg.select("#" + firstSelectedAirport.iata).style("fill", "green")
            showOriginAirportFlow(airport, flights)
        })
}

function selectDestinationAirport(airport) {
    if (airport === firstSelectedAirport) {
        secondSelectedAirport = null
    } else {
        secondSelectedAirport = airport

        d3.select("#destination-input-selector")
            .property("value", `${airport.name} (${airport.iata})`)

        drawOriDesConnection(firstSelectedAirport, secondSelectedAirport)
        map_svg.select("#" + secondSelectedAirport.iata).style("fill", "blue")

    }
}


function selectAirport(airport) {
    if (firstSelectedAirport === null) {
        selectOriginAirport(airport)
        showSecondInputField()
    } else if (secondSelectedAirport === null) {
        selectDestinationAirport(airport)
        showDestinationAirportInfo()
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
    d3.select("#origin-chart").select('svg').remove()
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
