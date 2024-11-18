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
                        const responseText = aXMLHttpRequest.responseText.trim();
                        if (!responseText) {
                            throw new Error("Empty response from server");
                        }
                        const jsonData = JSON.parse(responseText); // Parse JSON response
                        callback(null, jsonData); // Pass parsed JSON to the callback
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        callback(error, null); // Pass error to the callback
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
