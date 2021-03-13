$(document).ready(function () { // Wait until document is fully parsed
    $("#origin-form").bind('submit', function (e) {
        e.preventDefault();

        let origin_airport = $('#origin-form').serializeArray()[0]['value']
        let airport_iata = origin_airport.split('(')[1].substr(0, 3)

        let airport_found = false
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === airport_iata.toUpperCase()) {
                selectOriginAirport(airport_locations[i])
                airport_found = true
                break
            }
        }
        if (!airport_found) {
            alert("The input did not match any IATA")
        } else {
            // if origin airport is found, see if there is also a destination airport
            // if there is, update the gauge chart
            const destinationAirport = $("#destination-input-selector").val();
            if (destinationAirport) {
                const destinationIata = destinationAirport.split('(')[1].substr(0, 3);
                window.updateGaugeChart({
                    origin: airport_iata,
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
        console.log("Destination airport", destination_airport)
        let airport_iata = destination_airport.split('(')[1].substr(0, 3)

        let airport_found = false
        for (let i = 0; i < airport_locations.length; i++) {
            if (airport_locations[i].iata === airport_iata.toUpperCase()) {
                selectDestinationAirport(airport_locations[i])
                airport_found = true
                showDestinationAirportInfo()
                break
            }
        }
        if (!airport_found) {
            alert("The input did not match any IATA")
        } else {
            // if destination airport is found, see if there is also a origin airport
            // if there is, update the gauge chart
            const originAirport = $("#origin-input-selector").val();
            if (originAirport) {
                const originIata = originAirport.split('(')[1].substr(0, 3);
                window.updateGaugeChart({
                    origin: originIata,
                    destination: airport_iata
                })
            }
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
}

function resetToMainView() {
    d3.select("#map-view")
        .style("display", "block")

    d3.select("#origin-chart").select('svg').remove()
    d3.select("#origin-chart")
        .style("display", "block")

    d3.select("#destination-airport")
        .style("display", "none")

    d3.select("#od-row")
        .style("display", "none")

    d3.select("#destination-form")
        .style("display", "none")
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
                b.addEventListener("click", function (e) {
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

autocomplete(document.getElementById("origin-input-selector"), airport_names);
autocomplete(document.getElementById("destination-input-selector"), airport_names);
