function updateDestinationAutoComplete(airport) {
    d3.csv(urls.flights)
        .then(flights => {
            let airportConnections = getAirportConnections(airport, flights)
            let _airport_names = []
            for (let i = 1; i < airportConnections.length; i++) { // Skip origin airport
                _airport_names.push(airportConnections[i].name + " (" + airportConnections[i].iata + ")")
            }
            autocomplete(document.getElementById("destination-input-selector"), _airport_names);
        })
}

$(document).ready(function () { // Wait until document is fully parsed
    $("#origin-form").bind('submit', function (e) {
        e.preventDefault();

        let originAirport = $('#origin-form').serializeArray()[0]['value']
        let airportIata = originAirport.split('(')[1].substr(0, 3)

        let airportFound = false
        for (let i = 0; i < airportLocations.length; i++) {
            if (airportLocations[i].iata === airportIata.toUpperCase()) {
                selectOriginAirport(airportLocations[i])
                updateDestinationAutoComplete(airportLocations[i])
                airportFound = true
                break
            }
        }
        if (!airportFound) {
            alert("The input did not match any IATA")
        } else {
            // if origin airport is found, see if there is also a destination airport
            // if there is, update the gauge chart
            const destinationAirport = $("#destination-input-selector").val();
            if (destinationAirport) {
                const destinationIata = destinationAirport.split('(')[1].substr(0, 3);
                window.updateGaugeChart({
                    origin: airportIata,
                    destination: destinationIata
                })
            }
        }

    })
        .bind('reset', function (e) {
            e.preventDefault();

            document.getElementById("origin-input-selector").value = "";
            document.getElementById("destination-input-selector").value = "";
            resetToMainView()
            resetMap()
        });
})

$(document).ready(function () { // Wait until document is fully parsed
    $("#destination-form").bind('submit', function (e) {
        e.preventDefault();

        let destination_airport = $('#destination-form').serializeArray()[0]['value']
        let airportIata = destination_airport.split('(')[1].substr(0, 3)

        let airportFound = false
        for (let i = 0; i < airportLocations.length; i++) {
            if (airportLocations[i].iata === airportIata.toUpperCase()) {
                expandAirportInformation(selectedOriginAirport, airportLocations[i])
                airportFound = true
                showDestinationAirportInfo()
                break
            }
        }
        if (!airportFound) {
            alert("The input did not match any IATA")
        }

    })
        .bind('reset', function (e) {
            e.preventDefault();

            document.getElementById("destination-input-selector").value = "";
            resetToDestinationView()
            resetMapDestination()
        });
})

function showDestinationAirportInfo() {
    d3.select("#map-view")
        .style("display", "none")

    d3.select("#origin-chart")
        .style("display", "none")

    d3.select("#destination-airport")
        .style("display", "block")

    d3.select("#od-row")
        .style("display", "block")

    $('#lollipop-chart').insertAfter('#od-lollipop-row');
}

function clearGaugeLollipop() {
    d3.select("#od-chart").selectAll('svg').remove()

    $('#lollipop-chart').insertAfter('#o-lollipop-row');
    d3.select("#lollipop-chart").select('svg').remove()

    d3.select("#chart-gauge").select('g').remove()
    d3.select("#gauge-chart-text")
        .style("display", "none")
    d3.select("#gauge-chart-number")
        .style("display", "none")
}

function resetToMainView() {
    d3.select("#map-view")
        .style("display", "block")
    d3.select("#landing-text")
        .style("display", "block")

    d3.select("#origin-chart").select('svg').remove()
    d3.select("#origin-chart").select('text').remove()

    clearGaugeLollipop()
    d3.select("#origin-chart")
        .style("display", "block")

    d3.select("#destination-airport")
        .style("display", "none")

    d3.select("#od-row")
        .style("display", "none")

    d3.select("#destination-form")
        .style("display", "none")

    d3.select("#gauge-bar-row")
        .style("visibility", "hidden")

    removeOldBarchart()
}

function resetToDestinationView() {
    d3.select("#map-view")
        .style("display", "block")

    d3.select("#origin-chart")
        .style("display", "block")

    d3.select("#destination-airport")
        .style("display", "none")

    d3.select("#od-row")
        .style("display", "none")

    d3.select("#origin-chart").select('svg').remove()
    d3.select("#origin-chart").select('text').remove()


    clearGaugeLollipop()

    d3.select("#gauge-bar-row")
        .style("visibility", "hidden")

    removeOldBarchart()
}


function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].toUpperCase().includes(val.toUpperCase())) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                b.innerHTML = arr[i]
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (_) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode === 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode === 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode === 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt !== x[i] && elmnt !== inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

autocomplete(document.getElementById("origin-input-selector"), airportNames);
