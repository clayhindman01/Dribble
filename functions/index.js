const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

//Config for Firebase Authentication
const firebaseConfig = {
    apiKey: "AIzaSyAuGa57dRIFa-iYKGfXXe6hh3ZhKMsFGLc",
    authDomain: "dribble-34f6b.firebaseapp.com",
    projectId: "dribble-34f6b",
    storageBucket: "dribble-34f6b.appspot.com",
    messagingSenderId: "121556298456",
    appId: "1:121556298456:web:9e3bee00ccb97a691a05ad",
    measurementId: "G-KVFC59GKMH"
  };

//import Firebase
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/dribble', (req, res) => {
    admin
        .firestore()
        .collection('dribbbles')
        .orderBy("createdAt", 'desc')
        .get()
        .then((data) => {
            let dribbles = [];
            data.forEach((doc) => {
                dribbles.push({
                    dribbleId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(dribbles);
        })
        .catch((err) => console.error(err))
})

//Verify that the user is logged in
const FBAuth = (req, res, next) => {
    let idToken
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error("No token found")
        return res.status(403).json({ error: "Unauthorized" })
    }
    
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', "==", req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
}

app.post('/dribble', FBAuth, (req, res) => {
    if(req.method !== "POST"){
        return res.status(400).json({error: "Method not allowed"})
    }
    const newDribble = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }
    
    db
    .collection('dribbbles')
    .add(newDribble)
    .then(doc => {
        res.json({message: `document ${doc.id} created successfully`})
    })
    .catch(err => {
        res.status(500).json({error: "something went wrong"})
        console.error(err)
    })
})

//Check if a string is empty after trimming off the white space
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

//Check that the email is a valid email
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)) return true;
    else return false;
}

//Signup route
app.post("/signup", (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    let errors = {};

    // Check if email is empty or a valid email
    if(isEmpty(newUser.email)) {
        errors.email = "Must not be empty"
    } else if(!isEmail(newUser.email)) {
        errors.email = "Must be a valid email address"
    }

    //Check if password is empty
    if(isEmpty(newUser.password)) {
        errors.password = "Must not be empty"
    }

    //Check that both passwords match
    if(newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = "Passwords must match"
    }

    //Check if handle is empty
    if(isEmpty(newUser.handle)) {
        errors.handle = "Must not be empty"
    }

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({ handle: "This handle is already taken" })
        } else {
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userId = data.user.uid
        return data.user.getIdToken();
    })
    .then (idToken => {
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId
        };
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({ token });
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({ email: "Email is already in use" });
        }  else {
            return res.status(500).json({ error: err.code });
        }
    })
});

//Login route
app.post("/login", (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};
    
    if(isEmpty(user.email)) errors.email = "Must not be empty";
    if(isEmpty(user.password)) errors.password = "Must not be empty";

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ general: "Wrong credentials, please try again" })
            } else return res.status(500).json({ error: err.code })
        })
})

exports.api = functions.https.onRequest(app);