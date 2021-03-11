function createGaugeChart() {
 window.simpleGauge = new window.d3SimpleGauge.SimpleGauge({
    el: d3.select('.chart-gauge').append('g'),        // The element that hosts the gauge
    height: 200,                // The height of the gauge
    interval: [0, 15],         // The interval (min and max values) of the gauge (optional)
    sectionsCount: 3,           // The number of sections in the gauge
    width: 400,                  // The width of the gauge
    sectionsColors: ['yellow', 'orange', 'red']
  });
}
function updateGaugeChart({ origin, destination }) {
    const delay = getDelay({ origin, destination });
    window.simpleGauge.value = delay;
    $('.gauge-chart-number').text(`${Math.round(delay)} min`);
}
function getDelay({ origin, destination }) {
    const dataPoint = flights_data.find((data) => {
        return data.origin === origin && data.destination === destination;
    });

    if (!dataPoint) {
        return 0;
    }

    return dataPoint.arr_delay;
}
