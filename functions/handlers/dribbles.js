const { db } = require("../util/admin")

exports.getAllDribbles = (req, res) => {
    db.collection('dribbbles')
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
}

exports.postOneDribble = (req, res) => {
    if(req.method !== "POST"){
        return res.status(400).json({error: "Method not allowed"})
    }

    //Create a new post
    const newDribble = {
        body: req.body.body,
        userHandle: req.user.handle,
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
}

