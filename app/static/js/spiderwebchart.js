const convertDataToSpider =(dataIn) => {
    const keySet = new Set();
    dataIn.forEach(f => {
        keySet.add(f.label)
    })
    let data = [];
    const labels = [];
    keySet.forEach(k => {
        const labelRow = {}
        const labelArrays = dataIn.filter(el  => el.label == k)
        labelArrays.forEach(el => {
            value = Math.max(0,el.value)
            labelRow[el.period] = value
        })
        labels.push(k)
        data.push(labelRow)
    })
    const features = Object.keys(data[0]);
    return {
        labels,
        data,
        features
    }
}

const drawSpiderWebChart = (rawData) => {
    const {labels, data, features} = convertDataToSpider(rawData);

    const maxLabels = 4

    const maxValue = 25;
    const minValue = 0;

    const numTicks = 5;
    
    const chartWidth = 800;
    const chartHeight = 600;
    const chartMargin = 50;

    const labelsRightMargin = 150;
    const labelsYOffset = 0;
   
    
    const minDim = Math.min(chartWidth,chartHeight)
    const maxRange = Math.round(minDim / 2)

    let svg = d3.select("body").append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);


    let radialScale = d3.scaleLinear()
        .domain([minValue,maxValue])
        .range([0, maxRange - chartMargin]);
    
    // let ticks = [5,10,15,20]; //calculate ticks?
    
    let ticks = [...Array(numTicks).keys()].map((e,i) => {return Math.min((i+1) * maxValue / numTicks, maxValue)})
    console.log(ticks)
    ticks.forEach(t =>
        svg.append("circle")
        .attr("cx", Math.round(chartWidth / 2))
        .attr("cy", Math.round(chartHeight / 2))
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", radialScale(t))
    );

    ticks.forEach(t =>
        svg.append("text")
        .attr("x", Math.round(chartWidth / 2) + 5)
        .attr("y", Math.round(chartWidth / 2) -radialScale(t))
        .text(t.toString())
    );

    const angleToCoordinate = (angle, value) => {
        let x = Math.cos(angle) * radialScale(value);
        let y  = Math.sin(angle) * radialScale(value);
        return {"x": Math.round(chartWidth / 2) + x, "y": Math.round(chartHeight / 2)-y}
    }

    for (var i = 0 ; i < features.length; i++) {
        let featureName =  features[i];
        let angle  = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let lineCoordinate = angleToCoordinate(angle, maxValue);
        let labelCoordinate = angleToCoordinate(angle, maxValue + 0.5);

        svg.append("line")
        .attr("x1", Math.round(chartWidth / 2))
        .attr("y1", Math.round(chartHeight / 2))
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
        .attr("x", chartWidth - labelsRightMargin  )
        .attr("y", Math.round(chartHeight / 2) + i * 20 + labelsYOffset)
        .style("fill",color)
        .style("font-size", "20px")
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
