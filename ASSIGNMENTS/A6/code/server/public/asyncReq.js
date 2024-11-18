function getXMLHTTPRequest()
{
    var request;
    // Lets try using ActiveX to instantiate the XMLHttpRequest object
    try{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }catch(ex1){
        try{
            request = new ActiveXObject("Msxml2.XMLHTTP");
        }catch(ex2){
            request = null;
        }
    }

    // If the previous didn't work, lets check if the browser natively support XMLHttpRequest 
    if(!request && typeof XMLHttpRequest != "undefined"){
        //The browser does, so lets instantiate the object
        request = new XMLHttpRequest();
    }

    return request;
}

function loadFile(filename, callback) {
    var aXMLHttpRequest = getXMLHTTPRequest();
    if (aXMLHttpRequest) {
        aXMLHttpRequest.open("GET", filename, true);

        aXMLHttpRequest.onreadystatechange = function () {
            if (aXMLHttpRequest.readyState == 4) {
                if (aXMLHttpRequest.status == 200) {
                    try {
                        // Parse JSON response
                        const jsonData = JSON.parse(aXMLHttpRequest.responseText);
                        callback(null, jsonData);
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        callback(error, null);
                    }
                } else {
                    console.error("HTTP error:", aXMLHttpRequest.status, aXMLHttpRequest.statusText);
                    callback(new Error("HTTP error " + aXMLHttpRequest.status), null);
                }
            }
        };

        // Send the request
        aXMLHttpRequest.send(null);
    } else {
        console.error("Failed to create XMLHttpRequest object.");
        callback(new Error("Failed to create XMLHttpRequest object"), null);
    }
}



     




