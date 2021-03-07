function createGaugeChart() {
 window.simpleGauge = new window.d3SimpleGauge.SimpleGauge({
    el: d3.select('.chart-gauge').append('g'),        // The element that hosts the gauge
    height: 200,                // The height of the gauge   
    interval: [0, 200],         // The interval (min and max values) of the gauge (optional)
    sectionsCount: 2,           // The number of sections in the gauge
    width: 400,                  // The width of the gauge
    sectionsColors: ['orange', 'red']
  });
}