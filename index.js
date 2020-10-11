const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const admin = require('firebase-admin');
const serviceAccount = require("./configs/snigdha-burj-al-arab-firebase-adminsdk-kv6km-db21a9b8a8.json")
require('dotenv').config()

console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1sg5c.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;


const app = express();
app.use(cors());
app.use(bodyParser.json());

//initialize firebase to server
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const port = 5000;
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true  });



client.connect(err => {
  const collection = client.db("burj-al-arab").collection("booking");
  app.post('/addbooking',(req,res)=>{
      const data = req.body;
      collection.insertOne(data)
      .then(result =>{
          res.send(result.insertedCount>0)
      })
  })
  app.get('/getbooking/',(req,res)=>{
      //bearer with id token from client
        const bearer = req.headers.authorization;
       
        if(bearer && bearer.startsWith('Bearer')){
        const idToken = bearer.split(' ')[1];    
         console.log(idToken)
         admin.auth().verifyIdToken(idToken) 
        .then(function(decodedToken) {
            let tokenEmail = decodedToken.email;
            console.log(tokenEmail,req.query.email)
            if(tokenEmail == req.query.email){
                collection.find({email:req.query.email})
                .toArray((err,document)=>{
                    res.status(200).send(document) 
                    console.log("p",req.query)
                })
            } else {
                res.status(401).send('un authorize')
            }
        }).catch(function(error) {
            res.status(401).send('un authorize')
        });
        } else {
            res.status(401).send('un authorize')
        }
       


  })
});


app.get('/',(req,res)=>{
    res.send("hello")
})

app.listen(port)

