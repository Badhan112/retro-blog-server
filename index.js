const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const port = 5100;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tinfh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors());
app.use(fileUpload());

client.connect(err => {
    const blogsCollection = client.db(process.env.DB_NAME).collection("blogs");
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    console.log('MongoDB Connected');

    app.post('/add-blog', (req, res) => {
        console.log(req.files.file);
        console.log(req.body);
    });

    app.get('/check-admin/:email', (req, res) => {
        adminCollection.findOne({ email: req.params.email })
        .then(result => {
            if(result){
                res.send(true);
            } else{
                res.send(false);
            }
        })
        .catch(() => res.send(false));
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})