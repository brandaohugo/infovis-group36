/* Modified code provided by:
https://stackoverflow.com/questions/42919992/d3-how-to-properly-get-the-key-value-inside-of-a-json-object
https://bl.ocks.org/llad/3918637
*/

var data = table_data

const containerDiv = d3.select('#lollipop-chart');
const odSvg = containerDiv.append("svg");
const svgWidth = 900;
const svgHeight = (data.length + 1) * 15;
const margin = {top: 20, right: 30, bottom: 20, left: 0};

const tableWidth = 320;
const plotWidth = svgWidth - tableWidth - margin.left - margin.right;
const odHeight = svgHeight - margin.top - margin.bottom;

odSvg.attr("viewBox", '0 0 ' + svgWidth + ' ' + svgHeight);

    const g = odSvg.append("g")
        .attr("transform", `translate(${margin.left + tableWidth}, ${margin.top})`)

    const x = d3.scaleLinear()
        .range([0, plotWidth])
        .domain(d3.extent(data, (d) => d.AVG_ARR_DELAY))

    const y = d3.scaleBand()
        .range([20, svgHeight])
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
        .attr("y2", svgHeight)
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