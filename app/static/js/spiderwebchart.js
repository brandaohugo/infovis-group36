const convertDataToSpider =(dataIn, frequency) => {
    const keySet = new Set();
    dataIn.forEach(f => {
        keySet.add(f.label)
    })
    let data = [];
    const values = []
    const labels = [];
    const features = [...Array(frequency).keys()].map(i => i+1);
    keySet.forEach(k => {
        const labelRow = {}
        features.forEach(f => labelRow[f] = 0)
        const labelArrays = dataIn.filter(el  => el.label == k)
        labelArrays.forEach(el => {
            value = Math.max(0,el.value)
            labelRow[el.period] = value
            values.push(value);
        })
        labels.push(k)
        data.push(labelRow)
    })
    const standardDev = math.std(values)
    const mean = math.mean(values)
    const misc = {
        maxValue: Math.min(Math.max.apply(Math, values), mean + 1 * standardDev),
        minValue: Math.min.apply(Math, values),
        mean,
        standardDev
    }
    data.forEach(a => {
        features.forEach(f => {
            a[f] = Math.min(a[f], misc.maxValue)
        })
    })
    return {
        labels,
        data,
        features,
        misc
    }
}

const drawSpiderWebChart = (rawData, options) => {
    const {
        chartTitle,
        titleFontSize,
        divId,
        frequency,
        maxLabels,
        numTicks,
        chartHeight,
        chartWidth,
        chartMargin,
        labelsYOffset,
        labelFontSize,
        labelLineHeight,
    } = options

    const {labels, data, features, misc} = convertDataToSpider(rawData, frequency);
    const { maxValue, minValue } = misc

    const tickXOffset = 5;
    const titleMargin = 60

    const spiderCenterX = Math.round(chartHeight / 2);
    const spiderCenterY = Math.round((chartHeight-titleMargin) / 2);

    const minDim = Math.min(chartWidth,chartHeight-titleMargin);
    const maxRange = Math.round(minDim / 2);

    let svg = d3.select(divId).append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);


    let radialScale = d3.scaleLinear()
        .domain([minValue,maxValue])
        .range([0, maxRange - chartMargin]);

    
    let ticks = [...Array(numTicks).keys()].map((e,i) => {
        return Math.round(Math.min((i+1) * maxValue / numTicks, maxValue))
    });

    ticks.forEach(t =>
        svg.append("circle")
        .attr("cx", spiderCenterX)
        .attr("cy", spiderCenterY)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("opacity", 0.5)
        .attr("r", radialScale(t))
    );

    ticks.forEach(t =>
        svg.append("text")
        .attr("x", spiderCenterX + tickXOffset)
        .attr("y", spiderCenterY - radialScale(t))
        .attr("opacity", 0.5)
        .style("font-size", "10px")
        .text(t.toString())
    );

    svg.append("text")
        .attr("x", spiderCenterX)
        .attr("y", titleMargin/3)
        .style("font-size", titleFontSize)
        .style("font-weight", 500)
        .attr('text-anchor','middle')
        .attr('alignment-baseline','central')
        .text(chartTitle)


    const angleToCoordinate = (angle, value) => {
        let x = Math.cos(angle) * radialScale(value);
        let y  = Math.sin(angle) * radialScale(value);
        return {"x": spiderCenterX - x, "y": spiderCenterY - y}
    }

    for (var i = 0 ; i < features.length; i++) {
        let featureName =  features[i];
        let angle  = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let lineCoordinate = angleToCoordinate(angle, maxValue);
        let labelCoordinate = angleToCoordinate(angle, maxValue * 1.2);

        svg.append("line")
        .attr("x1", spiderCenterX)
        .attr("y1", spiderCenterY)
        .attr("x2", lineCoordinate.x)
        .attr("y2", lineCoordinate.y)
        .attr("stroke", "black")
        .attr("opacity", 0.3);

        svg.append("text")
        .attr("x", labelCoordinate.x)
        .attr("y", labelCoordinate.y)
        .attr("opacity", 0.5)
        .style("font-size", "10px")
        .attr('text-anchor','middle')
        .attr('alignment-baseline','central')
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
            coordinate = angleToCoordinate(angle, dataPoint[featureName])
            coordinates.push(coordinate);
        }
        return coordinates;
    }

    try { 
        data.forEach((d,i) => {
            if (i >= maxLabels) {
                throw BreakException
            }
            let color = colors[i];
            let coordinates = getPathCoordinates(d);
    

            svg.append("text")
            .attr("x", spiderCenterX + maxRange )
            .attr("y", spiderCenterY + i * labelLineHeight + labelsYOffset)
            .style("fill",color)
            .style("font-size", labelFontSize)
            .text(labels[i]);
            
            svg.append("path")
                .attr("d",line(coordinates))
                .attr("stroke-width", 4)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5);
        });
    } catch (e) {
        //pass
    }
    
}
