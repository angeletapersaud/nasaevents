let eventMarkers = [];
let issOutput;
const issSearch = document.querySelector("#issBtn");
const eventSearchDropdown = document.querySelector("#eventSearchDropdown");
const eventSearchBtn = document.querySelector("#eventSearchBtn");

//Add a click event listener to the search event button element that runs the function requestAPI_Event
eventSearchBtn.addEventListener("click", () => {
    const eventSearchTxt = document.querySelector("#eventSearchTxt");
    requestAPI_Event(eventSearchTxt.value)
})

//Add a click event listener to the select event category dropdown element that runs the function requestAPI_Event
eventSearchDropdown.addEventListener("change", () => {
    requestAPI_Event(eventSearchDropdown.options[eventSearchDropdown.selectedIndex].value);
})


//Add a click event listener to the 'where is the ISS?' button element that runs the function requestISS
issSearch.addEventListener("click", () => {
    requestISS()
})

//display list of events for preselected value of dropdown when window loads 
window.addEventListener("load", () => {
    requestAPI_Event(eventSearchDropdown.options[eventSearchDropdown.selectedIndex].value);
})

// Add a click event listener to the 'where is the ISS?' button element that runs the function requestISS
window.addEventListener("load", () => {
    // setInterval(requestISS, 1000);
    requestISS();
})

//asynchronus api call to get ISS latitude and longitude
async function requestISS() {
    let reply = await fetch(`https://api.wheretheiss.at/v1/satellites/25544`);
    issOutput = await reply.json()
    DisplayissApiData(issOutput);
}

//render ISS latitude and longitude to the browser
function DisplayissApiData() {
    document.querySelector("#issLatitude").innerText = (`ISS Latitude: ${ issOutput.latitude }`);
    document.querySelector("#issLongitude").innerText = (`ISS Longitude: ${ issOutput.longitude }`);

}

//asynchronus api call to get events data and render it
async function requestAPI_Event(filter = '') {
    try {
        filter != '' ? filter = `?category=${filter}` : filter;
        let reply = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events/${filter}`);
        let allEvents = await reply.json();
        let events = '';
        for (let i = 0; i < 20; i++) {
            eventMarkers[i] = allEvents['events'][i];
            events +=
                '<tr>' +
                `<td> ${eventMarkers[i]['categories'][0]['title']}</td>` +
                `<td> ${allEvents['events'][i]['title']}</td>` +
                `<td> ${eventMarkers[i]['geometry'][0]['coordinates']}</td>` +
                `<td> ${eventMarkers[i]['geometry'][0]['date']}</td>` +
                '</tr>';
        }

        initMap();
        document.querySelector("#eventsDiv").innerHTML =
            '<table id="titleList" style="width:1500px">' +
            '<tr>' +
            '<th>Category</th>' +
            '<th>Event</th>' +
            '<th>Coordinates</th>' +
            '<th>Date/Time of Event</th>' +
            '</tr>' +
            events +
            '</tr>' +
            '</table>';
    } catch (error) {
        if (error.message.includes('Unexpected token')) {
            document.querySelector("#eventsDiv").innerHTML = '<div> No events for the search category </div>'
        } else {
            document.querySelector("#eventsDiv").innerHTML = '<div> Please Reload Page and try again </div>'
        }
        console.log(error.message);

    }
}

//define initMap function to send in the google api request
async function initMap() {

    // initial the zoom and focus point
    let options = {
        zoom: 1,
        center: {
            lat: 40.7128,
            lng: -10.0060

        }
    }

    // create an instance of the google Map object 
    let map = new google.maps.Map(document.getElementById('map'), options);

    let markers = [];

    //check to see if any events where returned from requestAPI_Event function 
    if (eventMarkers.length > 0) {

        //loop through each event and create the markers array which will have to contain the coords object that takes the
        //longitude and latitudes of each event location. Other properties can be added to the array if desired
        for (let i = 0; i < eventMarkers.length - 1; i++) {
            markers[i] = {
                coords: {
                    lng: eventMarkers[i]['geometry'][0]['coordinates'][0],
                    lat: eventMarkers[i]['geometry'][0]['coordinates'][1]

                },
                iconImage: eventMarkers[i]['title'].toUpperCase().includes('FIRE') ? '../Media/Images/bonfireIcon2020.png' : eventMarkers[i]['title'].toUpperCase().includes('VOLCANO') ? '../Media/Images/volcanoIcon.png' : eventMarkers[i]['title'].toUpperCase().includes('ICEBERG') ? '../Media/Images/iceIcon.png' : '../Media/Images/dropPin.png',

                content: eventMarkers[i]['title'].toUpperCase().includes('FIRE') ? '<h1>Wildfire</h1>' : eventMarkers[i]['title'].toUpperCase().includes('VOLCANO') ? '<h1>VOLCANO</h1>' : eventMarkers[i]['title'].toUpperCase().includes('ICEBERG') ? '<h1>ICEBERG</h1>' : '<h1>Natural Disaster</h1>'
            }

        }
    }


    //call requestISS to get the most updated ISS data
    await requestISS();

    //add iss coordinates to markers array
    markers.push({
            coords: {
                lat: issOutput.latitude,
                lng: issOutput.longitude
            },
            iconImage: '../Media/Images/satelite.png',
            content: '<h1>International Space Station</h1>'
        }

    );

    //add NYC coordinates to markers array
    markers.push({
            coords: {
                lat: 40.7128,
                lng: -74.0060
            },
            iconImage: '../Media/Images/statueOfLiberty.png',
            content: '<h1>NYC</h1>'
        }

    );


    // Loop through markers and call the addMarkers function each time to render the pointer to google maps
    //the addMarker function needs the markers array and map object in order to render the pointers
    for (let i = 0; i < markers.length; i++) {
        addMarker(markers[i], map);
    }
}

function addMarker(props, map) {
    let marker = new google.maps.Marker({
        position: props.coords,
        map: map,
        animation: google.maps.Animation.DROP
            //icon:props.iconImage
    });

    // Check for customicon
    if (props.iconImage) {
        // Set icon image
        marker.setIcon(props.iconImage);
    }

    // Check content
    if (props.content) {
        let infoWindow = new google.maps.InfoWindow({
            content: props.content
        });

        //creates a info window if the pointer is clicked
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
    }
}