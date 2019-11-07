"use strict";

const { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;

// delete todo by its text value ( used below in event listener)
const checkFile = e => {
    ipcRenderer.send("checkfile", e.target.textContent);
};

// create close window button
document.getElementById("closeBtn").addEventListener("click", () => {
    ipcRenderer.send("close");
});

// create open window button
document.getElementById("sendBtn").addEventListener("click", () => {
    dialog
        .showOpenDialog({
            filters: [{ name: "Logs", extensions: ["txt"] }],
            properties: ["openFile"]
        })
        .then(res => {
            if (!res.canceled) {
                ipcRenderer.send("openfile", res.filePaths[0]);
            }
        });
});

// on receive file
ipcRenderer.on("newfile", (event, item) => {
    const fileList = document.getElementById("fileList");

    fileList.innerHTML += `<li class="item" id="${item}">${item}</li>`;

    // add click handlers to delete the clicked todo
    fileList.querySelectorAll(".item").forEach(item => {
        item.addEventListener("click", checkFile);
    });
});

// on sendedfile file
ipcRenderer.on("parsedfile", (event, item) => {
    const fileList = document.getElementById(item);
    fileList.innerHTML += "+";
});

// on sendedfile file
ipcRenderer.on("sendedfile", (event, item) => {
    const fileList = document.getElementById(item);
    fileList.innerHTML += "+";
});

// on parsederrorfile file
ipcRenderer.on("parsederrorfile", (event, item) => {
    const fileList = document.getElementById(item);
    fileList.innerHTML += "-";
});

// on sendederrorfile file
ipcRenderer.on("sendederrorfile", (event, item) => {
    const fileList = document.getElementById(item);
    fileList.innerHTML += "-";
});
