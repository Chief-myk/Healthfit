const express = require("express");
const bodyParser = require("body-parser");
const NodeWebcam = require("node-webcam");
const cv2 = require('opencv4nodejs'); 
const request = require('request');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Define URLs for games
const gameUrls = {
    'endless-runner-1': "https://scratch.mit.edu/projects/600560206/embed",
    'endless-runner-2': "https://scratch.mit.edu/projects/599708735/embed",
    'endless-runner-3': "https://scratch.mit.edu/projects/600097774/embed"
};
let url_send = "";

// ROUTES

// Home route - Render the home page
app.get("/", (req, res) => {
    res.render("play.ejs");
});

// Handle the form submission from the home page
app.post("/", (req, res) => {
    const play = req.body.play;
    if (play === "yes") {
        res.redirect("/yoga");
    } else {
        res.redirect("/");
    }
});

// Render the yoga page
app.get("/yoga", (req, res) => {
    res.render("yoga");
});

// Render the games page
app.get("/games", (req, res) => {
    res.render("games");
});

// Handle game selection
app.post("/games", (req, res) => {
    const gameName = req.body.gameName;

    if (gameUrls[gameName]) {
        url_send = gameUrls[gameName];
        res.redirect("/play");
    } else {
        res.status(400).send("Invalid game selection");
    }
});

// Render and process the play page
app.get("/play", (req, res) => {
    try {
        // Uncomment the next line if using OpenCV
        // const Vcap = new cv2.VideoCapture(0);

        // Request data from Flask server
        request('http://localhost:3000/flask', (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send("Error connecting to Flask server.");
            }
            console.log('Status Code:', response && response.statusCode);
            console.log('Body:', body);

            // Render the game with the received response
            res.render("play", { gameSrc: url_send });
        });

        // Capture webcam image using NodeWebcam (if needed)
        const Webcam = NodeWebcam.create({});
        // You can capture images with Webcam.capture or handle more webcam actions

    } catch (err) {
        console.error("Error during webcam capture or server request:", err);
        res.status(500).send("An error occurred while loading the play page.");
    }
});

// Handle form submission for play page (if needed)
app.post("/play", (req, res) => {
    const gameName = req.body.gameName;

    if (gameUrls[gameName]) {
        res.redirect("/play");
    } else {
        res.status(400).send("Invalid game selection.");
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
