/*
 * Qualtrics Google Map Lat/Long Collector
 * Version 1.4
 *
 * Written by George Walker <george@georgewwalker.com>
 * Get the latest from GitHub: https://github.com/pkmnct/qualtrics-google-map-lat-long/releases
 *
 * This JavaScript allows a Qualtrics user to collect a lat/long from a
 * Google Map in a survey. To use it, create a new "Text Entry" question,
 * then add this JavaScript to the question. You can set variables below.
 * These include the lattitude and longitude to center the map at, the
 * zoom level of the map, and the text to display when hovering over the
 * map's pin. It also includes the width and height of the map.
 */

// Enter your Google Map API key in this variable:
// var googleMapAPIKey = "AIzaSyAG8QzzblFF4sXjZS6Mbq4UVkd8CMoVK44";

var test

Qualtrics.SurveyEngine.addOnload(function() {
    // --- User Variables, set these: ---
    var mapCenterLat = 38.9892549;
    var mapCenterLng = -76.9489012;
    var mapZoom = 13;

    var markerRadius = 1609; // 1 mile in meters




    var mapWidth = "96%";
    var mapHeight = "400px";
    var mapMargin = "2%";

    var locationInputWidth = "96%";
    var locationInputMargin = "2%";
    var locationInputPadding = "15px";
    var locationInputPlaceholder = "Enter a city or zip code";

    var enableAutocompleteField = true;
    var invalidLocationAlertText = "Please enter a valid city or zip code.";

    // --- End of User Variables ---

    // Get the data entry box and store it in a variable
    var dataBox = document.getElementById("QR~" + this.questionId);

    // Get the question container and store it in a variable.
    var questionContainer = this.getQuestionContainer();

    // Initiate marker to update it later.
    // var marker;

    if (enableAutocompleteField) {
        // Create a search box
        try {
            var locationInput = document.createElement('input');
            locationInput.setAttribute("id", this.questionId + "-locationInput");
            locationInput.setAttribute("placeholder", locationInputPlaceholder);
            locationInput.style.width = locationInputWidth;
            locationInput.style.margin = locationInputMargin;
            locationInput.style.padding = locationInputPadding;
            questionContainer.appendChild(locationInput);
            var locationInputID = this.questionId + "-locationInput";
            
            var locationOptions = {
                types: ['(regions)'], // Only search cities, zip codes, and other administrative areas
                // types: ['(cities)'], // Only search cities, zip codes, and other administrative areas
                componentRestrictions: {country: "us"}, // Within the US
                strictBounds: true,
                bounds: { // Within the rectangular bounds of MD
                    north: 39.8,
                    south: 37.8,
                    east: -75.0,
                    west: -79.5,
                },
            };

        } catch (err) {
            console.log("Unable to create places autocomplete field. Details: " + err);
            alert("An error occurred creating the input field.");
        }
    }

    try {
        // Create a map object and append it to the question container.
        var mapObject = document.createElement('div');
        mapObject.setAttribute("id", this.questionId + "-map");
        mapObject.style.width = mapWidth;
        mapObject.style.height = mapHeight;
        mapObject.style.margin = mapMargin;
        questionContainer.appendChild(mapObject);
        var mapID = this.questionId + "-map";
    } catch (err) {
        console.log("Unable to create map object. Details: " + err);
        alert("An error occurred creating the map.");
    }

    // Hide the data box
    // try {
    //     dataBox.style.display = 'none';
    // } catch (err) {
    //     console.log("Unable to hide data box.");
    // }


    function save_data(name, address, lat, lon, zoom, radius, dragged) {
        var data = zoom + '{"name": "' + name + '", "address": "' + address + '", "lat": ' + lat + ', "lon": ' + lon + ', "zoom": ' + zoom + ', "marker_radius": ' + radius + ', "marker_dragged": ' + dragged + '}';
        console.log(data);
        return data;
    }

    // function to select the first option from the places autocomplete form on "Enter"
    // from https://stackoverflow.com/questions/14601655/google-places-autocomplete-pick-first-result-on-enter-key
    var selectFirstOnEnter = function(input) {  // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;
        function addEventListenerWrapper(type, listener) {  // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected, and then trigger the original listener.
            if (type == "keydown") { 
                var orig_listener = listener;
                listener = function(event) {
                    var suggestion_selected = jQuery(".pac-item-selected").length > 0;
                    if (event.which == 13 && !suggestion_selected) { 
                        var simulated_downarrow = jQuery.Event("keydown", {keyCode: 40, which: 40}); 
                        orig_listener.apply(input, [simulated_downarrow]); 
                    }
                    orig_listener.apply(input, [event]);
                };
            }
            _addEventListener.apply(input, [type, listener]); // add the modified listener
        }
        if (input.addEventListener) { 
            input.addEventListener = addEventListenerWrapper; 
        } else if (input.attachEvent) { 
            input.attachEvent = addEventListenerWrapper; 
        }
    }


    // This function calls itself once per second until the Google Maps API is loaded, then it displays the map.
    function displayMap() {
        try {

            var place // make 'place' available globally within the map function
            // var zoom = mapZoom // male current zoom level available globally within the map function

            var map = new google.maps.Map(document.getElementById(mapID), {
                center: {
                    lat: mapCenterLat,
                    lng: mapCenterLng
                },
                zoom: mapZoom,
                minZoom: mapZoom - 5,
                maxZoom: mapZoom,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: false,
            });

            var marker = new google.maps.Circle({
                draggable: true,
                raiseOnDrag: false,
                center: {
                    lat: mapCenterLat,
                    lng: mapCenterLng
                },
                map: map,
                radius: markerRadius,
                fillColor: "#6495ED",
                strokeColor: "#6495ED",
                fillOpacity: 0.5,
                strokeWeight: 2,
            });

            // Variable to indicate if marker has been dragged
            var dragged = false;

            if (enableAutocompleteField) {
                
                selectFirstOnEnter(locationInput);

                var locationAutocomplete = new google.maps.places.Autocomplete(locationInput, locationOptions);

                // Whenever the inputs change, set the locationLatLong
                google.maps.event.addListener(locationAutocomplete, 'place_changed', function() {
                    
                    place = locationAutocomplete.getPlace();

                    // Collect place types represented in the address
                    var types = []
                    for (i in place.address_components) {
                        if (place.address_components[i].hasOwnProperty('types')) {
                            types.push(...place.address_components[i].types)
                        }
                    };
                    
                    // Ensure that the place has valid geometry and is at least a locality, administrative_area_level_3, or postal_code
                    if (!place.geometry || !(types.includes("locality") || types.includes("administrative_area_level_3") || types.includes("postal_code"))) {
                        alert(invalidLocationAlertText);
                    } else {
                        var locationLatLong = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
                        marker.setCenter(locationLatLong);
                        map.panTo(locationLatLong);
                        // set the zoom back to default
                        map.setZoom(mapZoom);
                        // set dragged to false
                        dragged = false;
                        // store new position
                        dataBox.value = save_data(place.name, place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng(), map.zoom, markerRadius, dragged);
                    }
                });
            }


            // When the pin is clicked, store the lat/lng
            google.maps.event.addListener(marker, 'click', function(event) {
                if (place) {
                    dataBox.value = save_data(place.name, place.formatted_address, this.getCenter().lat(), this.getCenter().lng(), map.zoom, markerRadius, dragged);
                }
            });

            // When the pin is dragged, store the lat/lng where it ends
            google.maps.event.addListener(marker, 'dragend', function(event) {
                if (place) {
                    dragged = true;
                    dataBox.value = save_data(place.name, place.formatted_address, this.getCenter().lat(), this.getCenter().lng(), map.zoom, markerRadius, dragged);
                }
            });

            // When the map zoom changes, store the new zoom level
            google.maps.event.addListener(map, 'zoom_changed', function(event) {
                if (place) {
                    dataBox.value = save_data(place.name, place.formatted_address, marker.getCenter().lat(), marker.getCenter().lng(), map.zoom, markerRadius, dragged);
                }
            });

        } catch (err) {
            setTimeout(displayMap, 1000);
        }
    }
    displayMap();

});

// Load the Google Maps API if it is not already loaded.
// try {
//     if (typeof googleMapJS == 'undefined') {
//         var googleMapJS;
//         if (googleMapJS == null) {
//             googleMapJS = document.createElement('script');
//             if (googleMapAPIKey == "Your Key" || googleMapAPIKey == null) {
//                 googleMapJS.src = 'https://maps.googleapis.com/maps/api/js' + "?libraries=places";
//             } else {
//                 googleMapJS.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + googleMapAPIKey;
//             }
//             document.head.appendChild(googleMapJS);
//         }
//     } else {
//         console.log("Map already loaded.");
//     }
// } catch (err) {
//     console.log("Unable to load Google Maps API. Details: " + err);
//     alert("Unable to load Google Maps API.");
// }