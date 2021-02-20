function table(data) {

// column definitions
    var columns = [
        {head: 'Airline', cl: 'title', html: d3.f('title')},
        {head: 'Airline', cl: 'center', html: d3.f('year')},
        {head: 'Length', cl: 'center', html: d3.f('length', length())},
        {head: 'Budget', cl: 'num', html: d3.f('budget', d3.format('$,'))},
        {head: 'Rating', cl: 'num', html: d3.f('rating', d3.format('.1f'))}
    ];

// create table
    var table = d3.select('body')
        .append('table');

// create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', d3.f('cl'))
        .text(d3.f('head'));

// create table body
    table.append('tbody')
        .appendMany(movies, 'tr')
        .appendMany(td_data, 'td')
        .html(d3.f('html'))
        .attr('class', d3.f('cl'));

    function td_data(row, i) {
        return columns.map(function (c) {
            // compute cell values for this specific row
            var cell = {};
            d3.keys(c).forEach(function (k) {
                cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
            });
            return cell;
        });
    }

    function length() {
        var fmt = d3.format('02d');
        return function (l) {
            return Math.floor(l / 60) + ':' + fmt(l % 60) + '';
        };
    }
}