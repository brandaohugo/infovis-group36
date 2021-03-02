// $('.airportAutoComplete').autoComplete({
//     resolverSettings: {
//         url: 'https://gist.githubusercontent.com/Dtenwolde/2cb89416b675ee6ecaf0f99aa7c3bdeb/raw/609ab4ae2d5c89389666ee77c88186b8b6826dd5/airport_names.json'
//     }
// });
//

$(document).ready(function () { // Wait until document is fully parsed

    $("#origin-form").bind('submit', function (e) {

        e.preventDefault();
        let origin_airport = $('#origin-form').serializeArray()[0]['value']
        let airport_found = false
        for(let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === origin_airport.toUpperCase()) {
                selectAirport(airport_locations[i])
                airport_found = true
                break
            }
        }
        if (!airport_found) {
            alert("The input did not match any IATA")
        }

    });
})

