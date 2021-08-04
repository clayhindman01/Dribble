const functions = require("firebase-functions");
const app = require("express")();
const { getAllDribbles, postOneDribble } = require("./handlers/dribbles");
const { signup, login } = require('./handlers/users');
const config = require("./util/config")
const FBAuth = require("./util/fbauth")

//Dribble routes
app.get('/dribbles', getAllDribbles)
app.post('/dribble', FBAuth, postOneDribble)

//Users routes
app.post("/signup", signup);
app.post("/login", login)




exports.api = functions.https.onRequest(app);