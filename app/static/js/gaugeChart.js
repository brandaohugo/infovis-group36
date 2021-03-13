function createGaugeChart() {
 window.simpleGauge = new window.d3SimpleGauge.SimpleGauge({
    el: d3.select('.chart-gauge').append('g'),        // The element that hosts the gauge
    height: 100,                // The height of the gauge
    interval: [-15, 15],         // The interval (min and max values) of the gauge (optional)
    sectionsCount: 2,           // The number of sections in the gauge
    width: 200,                  // The width of the gauge
    sectionsColors: ['#00ff00', '#ff0000'],
    barWidth: 20,
    needleRadius: 8
  });
}
function updateGaugeChart({ origin, destination }) {
    const delay = getDelay({ origin, destination });
    const isLate = delay > 0;
    const $gaugeChartNumber = $('.gauge-chart-number');
    $gaugeChartNumber.removeClass('is-late');
    $gaugeChartNumber.removeClass('is-early');
    window.simpleGauge.value = delay;

    $gaugeChartNumber.text(`${isLate ? '+' : ''}${Math.round(delay)} min`);
    if (isLate) {
        $gaugeChartNumber.addClass('is-late');
    } else if (delay === 0) {
        //no-op
    } else {
        $gaugeChartNumber.addClass('is-early');
    }
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
