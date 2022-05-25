require("dotenv").config();
require("./config/database").connect();
const orbitDB = require("./config/orbitdb")
const jsonwebtoken = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const express = require("express");

const app = express();

app.use(express.json());

// importing user context
const User = require("./model/user");

// Register
app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {

        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jsonwebtoken.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

// Login
app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jsonwebtoken.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // user
            res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});

const auth = require("./middleware/auth");

app.post("/welcome", auth, async (req, res) => {
    res.status(200).send("Welcome 🙌 ");
    const docstore = await orbitDB.createDocstore()
});

// Register
app.post("/mfa", auth, async (req, res) => {

    // Our register logic starts here
    try {

        const docstore = await orbitDB.createDocstore()
        // Get user input
        const { producer, consumer, energy, mfa_id } = req.body;

        // Validate user input
        if (!(producer && consumer && energy && mfa_id)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldMfa = await docstore.query((doc) => doc._id == mfa_id)

        if (oldMfa.length > 0) {
            return res.status(409).send("Mfa Already exists");
        }

        //Encrypt meter ids
        encryptedProdMeterId = await bcrypt.hash(producer.meter_id, 10);
        encryptedConsMeterId = await bcrypt.hash(consumer.meter_id, 10);


        // Create user in our database
        await docstore.put({
            "producer": encryptedProdMeterId,
            "consumer": encryptedConsMeterId,
            "date": energy.date, // sanitize: convert email to lowercase
            "energy": energy.energy_kwh,
            "_id": mfa_id
        });

        let lastEntry = await docstore.query((doc) => doc._id == mfa_id)

        console.log("Successfully saved: ", lastEntry)
        // return new user
        res.status(201).json(mfa_id);
    } catch (err) {
        console.log(err);
    }
});

module.exports = app;