const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

exports.createDocstore = async () =>{

    var docstore
    try {
        // Create IPFS instance
        const ipfsOptions = { repo: './ipfs', }
        const ipfs = await IPFS.create(ipfsOptions);
        console.log("Successfully connected to IPFS");

        // Create OrbitDB instance
        const orbitDb = await OrbitDB.createInstance(ipfs);
        console.log("Successfully created orbitDB Instance");

        // Create docstore DB
        docstore = await orbitDb.docstore('docstoreDB');
        console.log("Successfully created docstore");
    } catch (err) {
        console.log("database connection failed. exiting now...");
        console.error(error);
        process.exit(1);
    }
    return docstore
}

