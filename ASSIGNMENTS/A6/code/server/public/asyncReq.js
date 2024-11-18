function getXMLHTTPRequest() {
    // Create an XMLHttpRequest object for modern browsers
    if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
    } else {
        console.error("XMLHttpRequest is not supported by this browser.");
        return null;
    }
}

function loadFile(filename, callback) {
    var aXMLHttpRequest = getXMLHTTPRequest();

    if (aXMLHttpRequest) {
        aXMLHttpRequest.open("GET", filename, true); // Open an asynchronous GET request

        aXMLHttpRequest.onreadystatechange = function () {
            if (aXMLHttpRequest.readyState === 4) { // Request is complete
                console.log("Raw response from server:", aXMLHttpRequest.responseText); // Debug raw response

                if (aXMLHttpRequest.status === 200) { // HTTP success status
                    try {
                        // Parse the JSON response
                        const jsonData = JSON.parse(aXMLHttpRequest.responseText);
                        callback(null, jsonData); // Pass parsed JSON to the callback
                    } catch (error) {
                        console.error("Error parsing JSON:", error); // Log parsing error
                        callback(error, null); // Pass the error to the callback
                    }
                } else {
                    console.error("HTTP error:", aXMLHttpRequest.status, aXMLHttpRequest.statusText); // Log HTTP errors
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
