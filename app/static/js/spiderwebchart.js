const convertDataToSpider =(dataIn) => {
    const keySet = new Set();
    dataIn.forEach(f => {
        keySet.add(f.label)
    })
    let data = [];
    const values = []
    const labels = [];
    keySet.forEach(k => {
        const labelRow = {}
        const labelArrays = dataIn.filter(el  => el.label == k)
        labelArrays.forEach(el => {
            value = Math.max(0,el.value)
            labelRow[el.period] = value
            values.push(value);
        })
        labels.push(k)
        data.push(labelRow)
    })
    const features = Object.keys(data[0]);
    const misc = {
        maxValue: Math.max.apply(Math, values),
        minValue: Math.min.apply(Math, values)
    }
    return {
        labels,
        data,
        features,
        misc
    }
}

const drawSpiderWebChart = (rawData, options) => {
    const {labels, data, features, misc} = convertDataToSpider(rawData);
    const { maxValue, minValue } = misc
    const {
        maxLabels,
        numTicks,
        chartHeight,
        chartWidth,
        chartMargin,
        labelsYOffset,
        labelFontSize,
        labelLineHeight,
    } = options

    const spiderCenterX = chartHeight / 2
    const spiderCenterY = chartHeight / 2

    const minDim = Math.min(chartWidth,chartHeight)
    const maxRange = Math.round(minDim / 2)

    let svg = d3.select("body").append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);


    let radialScale = d3.scaleLinear()
        .domain([minValue,maxValue])
        .range([0, maxRange - chartMargin]);

    
    let ticks = [...Array(numTicks).keys()].map((e,i) => {return Math.round(Math.min((i+1) * maxValue / numTicks, maxValue))})
    console.log(ticks)
    ticks.forEach(t =>
        svg.append("circle")
        .attr("cx", Math.round(spiderCenterX))
        .attr("cy", Math.round(spiderCenterY))
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", radialScale(t))
    );

    ticks.forEach(t =>
        svg.append("text")
        .attr("x", Math.round(spiderCenterX) + 5)
        .attr("y", Math.round(spiderCenterY) - radialScale(t))
        .text(t.toString())
    );

    const angleToCoordinate = (angle, value) => {
        let x = Math.cos(angle) * radialScale(value);
        let y  = Math.sin(angle) * radialScale(value);
        return {"x": Math.round(spiderCenterX) + x, "y": Math.round(spiderCenterY)-y}
    }

    for (var i = 0 ; i < features.length; i++) {
        let featureName =  features[i];
        let angle  = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let lineCoordinate = angleToCoordinate(angle, maxValue);
        let labelCoordinate = angleToCoordinate(angle, maxValue + 0.5);

        svg.append("line")
        .attr("x1", Math.round(spiderCenterX))
        .attr("y1", Math.round(spiderCenterY))
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


    for (var i = 0; i < maxLabels; i++) {
        let d = data[i];
        let color = colors[i];
        let coordinates = getPathCoordinates(d);


        svg.append("text")
        .attr("x", spiderCenterX + maxRange )
        .attr("y", Math.round(spiderCenterY) + i * labelLineHeight + labelsYOffset)
        .style("fill",color)
        .style("font-size", labelFontSize)
        .text(labels[i]);
        
        svg.append("path")
            .attr("d",line(coordinates))
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.3);
    }
}
