const request = require("request");

function requestToTelebot(url, query) {
    console.log("telebot: url & data", url, query);
    console.log("telebot: json", JSON.stringify(query));
    return new Promise(function(resolve, reject) {
        request(
            {
                url: url,
                method: "POST",
                // json: true,
                // headers: {
                //     "Content-Type": "application/json"
                // },
                body: JSON.stringify(query)
            },
            function(error, response, body) {
                console.log("telebot: response.statusCode", response.statusCode);
                if (!error && response.statusCode == 200) {
                    resolve();
                } else if (error) {
                    console.log("telebot:", error);
                    reject(error);
                } else {
                    console.log("telebot: response", response.statusCode);
                    reject(response.statusCode);
                }
            }
        );
    });
}

// This is fake function
function requestToTelebot1(url, data) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            console.log(url, data);
            console.log(JSON.stringify(data));
            resolve();
        }, 1500);
    });
}

exports.requestToTelebot = requestToTelebot;
