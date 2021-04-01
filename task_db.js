const dbPath = require('./taskDb.json');

function addJob(park, start, end, passType, NotifYN) {
    // JobId: {park: "",
    //         start: "",
    //         end: "",
    //         passType: "",
    //         NotifYN: "",
    //         lastNotif: ""}
    var dataObject = {
        park:park,
        start: start,
        end: end, 
        passType: passType,
        NotifYN: NotifYN,
        lastNotif: new Date.now() 
    }

    let database = JSON.parse(fs.readFileSync(data));

    let id = Object.keys(database).length + 1;

    dataObject["id"] = id;
    database[id] = dataObject;

    fs.writeFileSync(dbPath, JSON.stringify(database));

    return id;

}

function readDatabaseEntry(id) {

    let database = JSON.parse(fs.readFileSync(dbPath));

    return database[id];


}

function updateDatabaseEntry(id, data) {

    let database = JSON.parse(fs.readFileSync(dbPath));

    database[id] = data;

    fs.writeFileSync(dbPath, JSON.stringify(database));

}

function deleteDatabaseEntry(id) {

    let database = JSON.parse(fs.readFileSync(dbPath));

    database[id] = null;

    fs.writeFileSync(dbPath, JSON.stringify(database));
}

function queryDatabaseForDbId(queryType, queryData) {

    let database = JSON.parse(fs.readFileSync(dbPath));

    for (const [key, value] of Object.entries(database)) {

        if (value[queryType] === queryData) {

            // retrun user id
            return key;
        }

    }

    return undefined
}

function searchDatabase (queryType, queryData) {

    let database = JSON.parse(fs.readFileSync(dbPath));

    let keys = [];

    for (const [key, value] of Object.entries(database)) {

        if (value[queryType] === queryData) {

            // retrun user id
            keys.push(key);
            
        }

    }

    return keys;

}

function listAll() {

    let database = JSON.parse(fs.readFileSync(dbPath));

    return database;
}

function clearDatabase() {

    fs.writeFileSync(dbPath, '{}');
}


module.exports = { createDatabaseEntry, readDatabaseEntry, updateDatabaseEntry, deleteDatabaseEntry, queryDatabaseForDbId, listAll, clearDatabase, searchDatabase };