function getXMLHTTPRequest() {
    var request;

    // Attempt to instantiate the XMLHttpRequest object
    try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (ex1) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (ex2) {
            request = null;
        }
    }

    // Fallback to native XMLHttpRequest for modern browsers
    if (!request && typeof XMLHttpRequest !== "undefined") {
        request = new XMLHttpRequest();
    }

    return request;
}

function loadFile(filename, callback) {
    var aXMLHttpRequest = getXMLHTTPRequest();

    if (aXMLHttpRequest) {
        aXMLHttpRequest.open("GET", filename, true); // Open an asynchronous GET request

        aXMLHttpRequest.onreadystatechange = function () {
            if (aXMLHttpRequest.readyState === 4) { // Request completed
                console.log("Raw response from server:", aXMLHttpRequest.responseText); // Log raw response for debugging

                if (aXMLHttpRequest.status === 200) { // HTTP 200 OK
                    callback(aXMLHttpRequest.responseText);
                } else {
                    console.error(
                        "HTTP error occurred:",
                        aXMLHttpRequest.status,
                        aXMLHttpRequest.statusText
                    );
                    callback(null); // Pass null to indicate an error occurred
                }
            }
        };

        // Send the request
        aXMLHttpRequest.send(null);
    } else {
        console.error("Failed to create XMLHttpRequest object.");
        alert("A problem occurred instantiating the XMLHttpRequest object.");
    }
}
