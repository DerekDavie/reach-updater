const path = require("path");

const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
    app.quit();
  }

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, '/desktopAPI.js') // preload /desktopAPI this file facilitates communicaiton between server and UI window
        },
    });

    // and load the index.html of the app.
    // win.loadFile("index.html");
    win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`);

    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools({ mode: "detach" });
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const request = require('request')
const fs = require('fs')
const csv = require('csv-parser')
const json2csv = require('json2csv').parse

var credentials = { pass: '', user: '' }
var token


ipcMain.handle('authenticate', async function (event, arg) {
    credentials.user = arg.user
    credentials.pass = arg.pass
    console.log(credentials)

    return await getToken()

})

ipcMain.handle('getTags', async function (event, arg) {
    return await getTags()
})

ipcMain.on('updateTags', function (event, { tag, filePath }) {
    var listStatus = {
        state: 'Loading List',
        recordsLoaded: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        failsFile: filePath.replace('.csv', "") + '_failures_' + Date.now() + '.csv'
    }

    getList(filePath).then(function (listLoaded) {
        listStatus.recordsLoaded = listLoaded.length
        listStatus.state = 'File Loaded'
        event.reply('updateTagsUpdate', listStatus)
        console.log("list", listLoaded)
        listStatus = sendUpdates(tag, listLoaded, listStatus, event)

    })
})

async function sendUpdates(tag, list, listStatus, event) {
    var listUpdate
    listStatus.state = 'Sending Updates'
    // while not all records have either failed or updated
    while (listStatus.recordsLoaded - (listStatus.recordsUpdated + listStatus.recordsFailed) > 0) {
        listUpdate = await apply1000Tags(tag, listStatus, list.slice((listStatus.recordsUpdated + listStatus.recordsFailed), (listStatus.recordsUpdated + listStatus.recordsFailed) + 1000))
        // if token invalid get new token else store results
        if (listUpdate.detail === "Could not validate crednetials") {
            getToken()
        } else {
            listStatus.recordsUpdated = listStatus.recordsUpdated + listUpdate.removed_from_people_count + listUpdate.added_to_people_count
            listStatus.recordsFailed = listUpdate.failed_people_count
        }
        event.reply('updateTagsUpdate', listStatus)
        console.log("list Status", listStatus)
    }
    listStatus.state = 'Done'
    event.reply('updateTagsUpdate', listStatus)
    return listStatus
}

async function apply1000Tags(tag, listStatus, list) {
    var peopleArray = []
    console.log(list)
    list.forEach(function (person) {
        peopleArray.push({
            "person_id": person.Person_ID,
            "person_id_type": person.ID_Type,
            "action": person.Action
        })
    })

    // build the rest of the body for the request
    var applyTagsBody = {
        "people": peopleArray
    }

    // build full request
    var options = {
        'method': 'PUT',
        'url': 'https://api.reach.vote/api/v1/tags/' + tag.id,
        'headers': {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(applyTagsBody)
    };

    return new Promise(function (resolve, reject) {
        request(options, async (error, response) => {
            // need to do better error handling
            if (error) {
                throw new Error(error);
            }
            console.log("Apply Tags response: " + response.body);

            if (response.body === '{"detail":"Could not validate credentials"}') {
                resolve(response.body);
            }

            if (JSON.parse(response.body).failed_people_count !== 0) {
                await storeFailures(JSON.parse(response.body).people.filter(function (person) {
                    return person.status !== 'success'
                }), listStatus.failsFile)
            }

            // return response
            resolve(JSON.parse(response.body));
        });
    })

}

async function storeFailures(response, filePath) {
    return new Promise(function (resolve, reject) {
        var csvData
        console.log(response)

        fs.stat(filePath, function (error, status) {
            if (error === null) {
                console.log('File already made')


                csvData = json2csv(response, {fields: ['person_id', 'person_id_type', 'status', 'message'], header:false}) + '\r\n'

                fs.appendFile(filePath, csvData, function (error) {
                    if (error) throw error
                    console.log('File appended')
                    resolve()
                })
            } else {
                console.log("making new file")
                csvData = ['person_id', 'person_id_type', 'status', 'message'] + '\r\n'

                fs.writeFile(filePath, csvData, async function (error) {
                    if (error) throw error
                    console.log('new file created with headers')
                    await storeFailures(response, filePath)
                    resolve()
                })
            }
        })
    })

}

// Get list of tags from Teach
async function getTags() {
    var options = {
        'method': 'GET',
        'url': 'https://api.reach.vote/api/v1/tags',
        'headers': {
            'Authorization': 'Bearer ' + token.access_token
        }
    }
    console.log(options)
    return new Promise(function (resolve, reject) {

        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log("Tags: " + response.body);
            resolve({ statusCode: response.statusCode, body: JSON.parse(response.body) });
        });

    })
}

async function getList(filePath) {
    return new Promise(function (resolve, reject) {
        var list = []
        var headerCheck = true

        fs.createReadStream(filePath).pipe(csv({ headers: false }))
            .on('data', function (data) {
                console.log(data)

                // check if headerCheck is true, set to false if it is and don't store data
                if (headerCheck) {
                    headerCheck = false
                } else {
                    list.push({
                        Person_ID: data[0],
                        ID_Type: data[1],
                        Action: data[2]
                    })
                }
            })
            .on('end', function () {
                resolve(list)
            })
    })

}

async function getToken() {

    // build the requst, type application/x-www-form-urlencoded with Username and
    // password being contained in the form body
    var options = {
        'method': 'POST',
        'url': 'https://api.reach.vote/oauth/token',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            'username': credentials.user,
            'password': credentials.pass
        }
    }

    console.log(options)

    // Send request, putting this inside a promise so response is returned before
    // moving on.
    return await new Promise(function (resolve, reject) {
        // send request
        request(options, function (error, response) {
            // if there is an error throw error (some better error handling could
            // be implemented here)

            if (response.statusCode === 200) {
                token = JSON.parse(response.body)
                console.log("New Token Request successful")
                resolve({ statusCode: response.statusCode })
            } else if (response.statusCode === 422) {
                token = ''
                console.log("New Token Request failed: ", response.body)
                resolve({ statusCode: response.statusCode, body: response.body })
            } else if (error) {
                reject(error)
            }

        })
    })

}