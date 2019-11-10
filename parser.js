const lineReader = require("line-reader");
const iconv = require("iconv-lite");

function parseFile(file) {
	let result = new Promise(function(resolve, reject) {
		console.log("parser: starting ", file);
		let dataToSend = [];
		let info = false;
		let error = false;
		let summary = false;
		lineReader.eachLine(file, {encoding: "binary"}, function(line, last) {
			line = iconv.encode(iconv.decode(Buffer.from(line, 'binary'), 'cp1251'), 'utf8').toString();
			// Fix the imput line: remove spases
			line = line.trim();
			line = line.split("  ").join(" ");
			console.log("parser:", line);
			// Now guess what file position
			try {
				if (line.indexOf("- Summary -") !== -1) {
					// We found summary start
					console.log("parser: found summary");
					summary = true;
				} else if (line.indexOf("- Summary end -") !== -1) {
					// We found summary end
					console.log("parser: summary end");
					summary = false;
				} else if (line.indexOf("- Daemon info -") !== -1) {
					// We found info about laps
					console.log("parser: daemon info about laps found");
					info = true;
				} else if (line.indexOf("- Daemon info end -") !== -1) {
					// We found end info about laps
					console.log("parser: info about laps end");
					info = false;
				}
				// if nothing found we are in progress
				else if (info) {
					// We a reading info about laps
					let laps = line.split(" ");
					let id = parseInt(laps[0]);
					laps.splice(0, 1); // remove first item
					console.log("parser: id is ", id);
					console.log("parser: laps ", laps);
					// Translate text to float
					let lapsFloat = [];
					laps.forEach((item) => {
						let oneLapTime = parseFloat(item);
						if (!isNaN(oneLapTime)) lapsFloat.push(oneLapTime);
					});
					dataToSend.forEach(function callback(item, index, array) {
						console.log("parser: forEach item ", item);
						if (item.ID == id) {
							item.RaceResult = lapsFloat;
							console.log("parser: forEach inserting item ", item);
						}
					});
				} else if (summary) {
					// We a reading summary
					let pilot = line.split(" ");
					if (pilot[0] == "Name" && pilot[1] == "ID") {
						// this is first string: Name ID position... skip it
					} else {
						console.log("parser: pilot ", pilot);
						let item = {
							RaceId: false,
							PilotName: pilot[0],
							ID: parseInt(pilot[1]),
							RaceResult: [],
							TotalTime: pilot[5]
						};
						dataToSend.push(item);
					}
				}

				if (false) { // not used
					return false; // stop reading
				}
			} catch {
				console.log("parser: split error");
				error = true;
			}
			if (last) {
				console.log("parser: finish");
				if (error) {
					reject(dataToSend);
				} else if (dataToSend.length > 0) {
					resolve(dataToSend);
				} else {
					reject(dataToSend);
				}
			}
		});
	});
	return result;
}

exports.parseFile = parseFile;
