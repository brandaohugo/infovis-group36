/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web"
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html

Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */


//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])    // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scaleLinear()
    .range(["rgb(213,222,217)", "rgb(69,173,168)", "rgb(84,36,55)", "rgb(217,91,67)"]);

var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

//Create SVG element and append map to the SVG
var svg = d3.select("#map-view")
    .append("svg")
    .attr("viewBox", '0 0 ' + width + ' ' + height);

// Append Div for tooltip to SVG
var div = d3.select("body")
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


// URls to load data from the web
const urls = {
    flights: "https://gist.githubusercontent.com/brandaohugo/95cd2011017b3da45a12849705e2e453/raw/8632dfe829f10f85a978fddb3a8a52856da380b5/flights.csv",
    airports: "https://gist.githubusercontent.com/brandaohugo/c66a88ecac49b0af6a6a91162ebdceb8/raw/31315724924ab2ffcc199463d46f26044bdf829c/airports.csv",
    map: "https://gist.githubusercontent.com/brandaohugo/8783ee3a2567e0ef62605a74f662a85f/raw/0ca649eb8f563be9917ee063e46ee2796cc1246d/map.json"
};

function fadeOutAirports(filteredAirportLocations) {
    for (let i = 0; i < airport_locations.length; i++) {
        if (!filteredAirportLocations.includes(airport_locations[i])) {
            d3.select("#" + airport_locations[i].iata).style("opacity", 0.3)
        } else {
            d3.select("#" + airport_locations[i].iata).style("opacity", 0.85)
        }
    }
}

const drawAirportConnections = (originAirport, flights) => {
    let filteredFlights = flights.filter(i => i.origin === originAirport.iata)

    svg.selectAll("line").remove()
    let filteredAirportLocations = [originAirport]
    filteredFlights.forEach(flight => {
        let destinationAirport = null
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === flight.destination) {
                filteredAirportLocations.push(airport_locations[i])
                destinationAirport = airport_locations[i]
                svg.append("line")
                    .style("stroke", "black")
                    .style("opacity", 0.85)
                    .style("stroke-width", function () {
                        if (flight.count > 100) {
                            return 2
                        } else {
                            return 1
                        }
                    })
                    .attr("id", flight.origin + flight.destination)
                    .attr("x1", projection([originAirport.longitude, originAirport.latitude])[0])
                    .attr("y1", projection([originAirport.longitude, originAirport.latitude])[1])
                    .attr("x2", projection([destinationAirport.longitude, destinationAirport.latitude])[0])
                    .attr("y2", projection([destinationAirport.longitude, destinationAirport.latitude])[1])
                break
            }
        }
    })
    fadeOutAirports(filteredAirportLocations)
}

function selectAirport(d) {
    firstSelectedAirport = d
    d3.csv(urls.flights)
        .then(flights => {
            drawAirportConnections(d, flights)
            svg.selectAll("circle").style("fill", "rgb(217,91,67)")
            svg.select("#" + firstSelectedAirport.iata).style("fill", "green")

        })

    // if (firstSelectedAirport === null) {
    //     firstSelectedAirport = d
    //     d3.csv(urls.flights)
    //         .then(flights => drawAirportConnections(d, flights))
    // } else if (secondSelectedAirport === null) {
    //     secondSelectedAirport = d
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

function resetMap() {
    svg.selectAll("line").remove()
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
        .attr("r", 4)
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
    // .on("mouseover", function (d) {
    //     div.transition()
    //         .duration(200)
    //         .style("opacity", 0.9);
    //     div.text(d.name)
    //         .style("left", (d3.event.pageX) + "px")
    //         .style("top", (d3.event.pageY - 28) + "px");
    // })
    // .on("mouseout", function (d) {
    //     div.transition()
    //         .duration(500)
    //         .style("opacity", 0);
    // })

}

// function drawAirportConnections() {

//     let segments = {nodes: [], link:[], paths:[]}

//     // bundle.nodes = airport_locations.map(function(d,i))
//     console.log(airport_locations)
//     console.log("flights", airport_connections)
// }

drawAirports(airport_locations)
// drawAirportConnections()

// Modification
// of
// custom
// tooltip
// code
// provided
// by
// Malcolm
// Maclean, "D3 Tips and Tricks"
// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html


// fade out tooltip on mouse out


// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
// var legend = d3.select("body").append("svg")
//       			.attr("class", "legend")
//      			.attr("width", 140)
//     			.attr("height", 200)
//    				.selectAll("g")
//    				.data(color.domain().slice().reverse())
//    				.enter()
//    				.append("g")
//      			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
//
//   	legend.append("rect")
//    		  .attr("width", 18)
//    		  .attr("height", 18)
//    		  .style("fill", color);
//
//   	legend.append("text")
//   		  .data(legendText)
//       	  .attr("x", 24)
//       	  .attr("y", 9)
//       	  .attr("dy", ".35em")
//       	  .text(function(d) { return d; });
// 	});
//
// })
