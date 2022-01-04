//uses jquery to create the date picker and initialize the values.
$(document).ready(function() {
    $("#date-picker").datepicker({
        dateFormat: 'yy-mm-dd',
        maxDate: new Date(),
        changeYear: true,
        defaultDate: new Date(),
    });


    //Event handler for datepicker
    $("#date-picker").on("change", function() {
        var selectedDate = $(this).val();
        requestAPI_Img(selectedDate);
    });

    //call the api function on when the window loads
    window.addEventListener("load", (e) => {
        requestAPI_Img(new Date().toLocaleString('en-CA').split(',')[0]);
    });

    //asynchronus get api call.
    let apiKey = "A5fxKzPqCRFcKbURD1km6I8nSJGyIOxEZ8zSAkqk";
    async function requestAPI_Img(selectedDateFilter) {
        selectedDateFilter = `&date=${selectedDateFilter}`;
        let reply = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}${selectedDateFilter}`);
        let imgResultInfo = await reply.json()
        dailyImageApiData(imgResultInfo)
    }

    //Display the image returned from the api call
    function dailyImageApiData(imgResultInfo) {
        document.querySelector("#titleFound").innerHTML = imgResultInfo.title;
        let videoURL = `${imgResultInfo.url}&autoplay=1&muted=1&loop=1&;enablejsapi=1`;
        document.querySelector("#dailyImgFound").innerHTML = imgResultInfo.url.includes('.jpg') || imgResultInfo.url.includes('.gif') || imgResultInfo.url.includes('.png') ?
            `<img id = 'dailydataReturned' src="${imgResultInfo.hdurl}">` :
            `<iframe id = 'dailydataReturned' width="840" height="630" src="${videoURL}" allow="autoplay"></iframe>`;
        document.querySelector("#imgInfo").innerHTML = imgResultInfo.explanation;
    }

});