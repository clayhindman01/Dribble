const functions = require("firebase-functions");
const app = require("express")();
const config = require("./util/config")
const FBAuth = require("./util/fbauth")
const { getAllDribbles, postOneDribble } = require("./handlers/dribbles");
const { signup, login, uploadImage } = require('./handlers/users');

//Dribble routes
app.get('/dribbles', getAllDribbles)
app.post('/dribble', FBAuth, postOneDribble)

//Users routes
app.post("/signup", signup);
app.post("/login", login)
app.post("/user/image", FBAuth, uploadImage)

exports.api = functions.https.onRequest(app);