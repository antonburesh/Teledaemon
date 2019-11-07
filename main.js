"use strict";

const request = require("request");
const chokidar = require("chokidar");
const notifier = require("node-notifier");

var tele = require("./telebot");
const telebot_url = "https://wowservice.info/fpv-perm/methods.php/?method=raceResult";

var parser = require("./parser");

const path = require("path");
const { app, ipcMain, Tray, Menu, screen } = require("electron");

const Window = require("./Window");
const DataStore = require("./DataStore");
const options = new DataStore({ name: "TinyDaemon" });

let tray;
let mainWindow;
let watcher;

function processFile(file) {
	console.log("process file", file);
	let baseName = path.basename(file);
	mainWindow.send("newfile", baseName); //id
	parser
		.parseFile(file)
		.then(res => {
			mainWindow.send("parsedfile", baseName); //id
			tele.requestToTelebot(telebot_url, res)
				.then(res => {
					mainWindow.send("sendedfile", baseName); //id
				})
				.catch(error => {
					mainWindow.send("sendederrorfile", baseName); //id
					console.log(error);
				});
		})
		.catch(error => {
			mainWindow.send("parsederrorfile", baseName); //id
			console.log(error);
		});
}

function main() {
	// list window
	const display = screen.getPrimaryDisplay();
	const width = display.bounds.width;
	const height = display.bounds.height;
	mainWindow = new Window({
		file: path.join("renderer", "index.html"),
		width: 350,
		height: 500,
		x: width - 350,
		y: height - 500
	});

	tray = new Tray(path.join(__dirname, "logo.png"));
	tray.on("click", function() {
		mainWindow.show();
	});
	let contextMenu = Menu.buildFromTemplate([
		{
			label: "Show app",
			click: function() {
				mainWindow.show();
			}
		},
		{
			label: "Quit",
			click: function() {
				app.quit();
			}
		}
	]);
	tray.setContextMenu(contextMenu);

	// Move to tray
	mainWindow.on("minimize", function(e) {
		e.preventDefault();
		mainWindow.hide();
	});

	// TODO: put these events into their own file

	mainWindow.once("show", () => {
		// mainWindow.webContents.openDevTools();
		mainWindow.removeMenu();
	});

	// checkfile click
	// for future use
	ipcMain.on("checkfile", (event, file) => {
		console.log(file);
	});

	// openfile click
	ipcMain.on("openfile", (event, file) => {
		console.log("openfile", file);
		processFile(file);
	});

	ipcMain.on("close", (event, none) => {
		app.quit();
	});

	watcher = chokidar.watch("./*.txt", {
		ignored: /(^|[\/\\])\../,
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: 2000,
			pollInterval: 100
		}
	});

	watcher.on("add", (file, status) => {
		console.log("add", path.join(__dirname, file));
		processFile(path.join(__dirname, file));
	});
}

app.on("ready", main);

app.on("window-all-closed", function() {
	app.quit();
});

// notifier.notify({
// 	title: "Watcher",
// 	message: "Watcher start",
// 	wait: false
// });
