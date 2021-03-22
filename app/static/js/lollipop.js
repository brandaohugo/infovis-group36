/* Modified code provided by:
https://stackoverflow.com/questions/42919992/d3-how-to-properly-get-the-key-value-inside-of-a-json-object
https://bl.ocks.org/llad/3918637
*/

const containerDiv = d3.select('#lollipop-chart');

const svgWidth = 580;
const margin = { top: 20, right: 30, bottom: 20, left: 130 };

const plotWidth = svgWidth - margin.left - margin.right;


const drawLollipopChart = (originAirport, destinationAirport) => {
    containerDiv.node().innerHTML = '';
    let data;
    const forOriginDestination = originAirport && destinationAirport
    if (forOriginDestination) {
        data = lollipop_od.filter((d) => {
            return (d.ORIGIN === originAirport) && (d.DEST === destinationAirport);
        });
        console.error(originAirport)
        console.error(destinationAirport)
        console.error(data)
    } else {
        data = lollipop_data.filter((d) => d.ORIGIN === originAirport);
    }
    const plotHeight = (data.length + 1) * 18;
    const svgHeight = plotHeight + margin.top + margin.bottom + 60;

    const odSvg = containerDiv.append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth);

    let titleText = forOriginDestination ? 'Origin destination flight delay in minutes' : 'Origin flight delay in minutes';
    odSvg.append('text')
        .attr('x', svgWidth / 2)
        .attr('y', plotHeight + margin.top + 30)
        .text(titleText)
        .attr('text-anchor', 'middle')

    const g = odSvg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const minXDomain = Math.min(-1, d3.min(data, (d) => d.ARR_DELAY));
    const maxXDomain = Math.max(1, d3.max(data, (d) => d.ARR_DELAY));
    const x = d3.scaleLinear()
        .range([0, plotWidth])
        .domain([minXDomain, maxXDomain])

    const y = d3.scaleBand()
        .range([20, plotHeight])
        .domain(data.map((d) => d.AIRLINE))

    const colorScale = d3.scaleLinear()
        .domain([d3.min(data, (d) => d.ARR_DELAY), 0, d3.max(data, (d) => d.ARR_DELAY)])
        .range(["#98C1D9", "#E0FBFC", "#EE6C4D"])

    const textHeight = 14;
    const mouseOverHandler = (d, i) => {
        const delayText = document.getElementsByClassName("delayText")[i]
        const airlineText = document.getElementsByClassName("airlineText")[i]
        const circle = document.getElementsByClassName("lolCircle")[i]
        let xCoord;
        if (d.ARR_DELAY < 0) {
            xCoord = x(d.ARR_DELAY) - 20;
        } else {
            xCoord = x(d.ARR_DELAY) + 20;
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
        if (d.ARR_DELAY < 0) {
            xCoord = x(d.ARR_DELAY) - 12;
        } else {
            xCoord = x(d.ARR_DELAY) + 12;
        }
        d3.select(delayText)
            .attr("font-size", 12)
            .attr("font-weight", "regular")
            .attr("x", xCoord)
        d3.select(airlineText).attr("font-size", 12).attr("font-weight", "normal")
        d3.select(circle).attr("r", 6)
    }

    g.append("line")
        .attr("x1", x(0) + 0.5)
        .attr("y1", 0)
        .attr("x2", x(0) + 0.5)
        .attr("y2", plotHeight)
        .attr('stroke', '#000')
        .attr('stroke-width', 1) // vertical axis line

    g.append("g")
        .call(d3.axisTop(x))

    g.selectAll(".lineToCircle")
        .data(data)
        .join((enter) => {
            const wrapper = enter.append("g");

            wrapper.append('line')
                .attr("x1", x(0))
                .attr("y1", (d) => y(d.AIRLINE))
                .attr("x2", (d) => x(d.ARR_DELAY))
                .attr("y2", (d) => y(d.AIRLINE))
                .style("stroke", "gray")
                .style("stroke-opacity", 1)
                .style("stroke-width", 0.5)
                .attr("class", "lineToCircle")

            wrapper.append('circle')
                .attr("cx", (d) => x(d.ARR_DELAY))
                .attr("cy", (d) => y(d.AIRLINE))
                .attr("r", 6)
                .attr("stroke", "black")
                .attr("fill", (d) => colorScale(d.ARR_DELAY))
                .attr("class", "lolCircle")

            wrapper.append('text')
                .attr("x", (d) => {
                    if (d.ARR_DELAY < 0) {
                        return x(0) + 4;
                    }
                    return x(0) - 4;
                })
                .attr("y", (d) => y(d.AIRLINE) + textHeight / 2 - 3)
                .attr("class", "airlineText")
                .text((d) => d.AIRLINE)
                .attr("font-family", "sans-serif")
                .attr("font-size", 12)
                .attr("text-anchor", (d) => {
                    if (d.ARR_DELAY < 0) {
                        return 'start';
                    }

                    return 'end';
                })

            wrapper.append('text')
                .attr("x", (d) => {
                    if (d.ARR_DELAY < 0) {
                        return x(d.ARR_DELAY) - 8 - 4;
                    }
                    return x(d.ARR_DELAY) + 8 + 4;
                })
                .attr("y", (d) => y(d.AIRLINE) + textHeight / 2 - 3)
                .attr("class", "delayText")
                .text((d) => Number.parseFloat(d.ARR_DELAY).toPrecision(2))
                .attr("font-family", "sans-serif")
                .attr("font-size", 12)
                .attr("text-anchor", (d) => {
                    if (d.ARR_DELAY < 0) {
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