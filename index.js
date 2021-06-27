const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient, ObjectId } = require('mongodb');
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
        const file = req.files.file;
        const imgData = file.data.toString('base64');
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(imgData, 'base64'),
        }

        const title = req.body.title;
        const content = req.body.content;
        const publishDate = req.body.publishDate;

        blogsCollection.insertOne({ title, content, publishDate, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/check-admin/:email', (req, res) => {
        adminCollection.findOne({ email: req.params.email })
            .then(result => {
                if (result) {
                    res.send(true);
                } else {
                    res.send(false);
                }
            })
            .catch(() => res.send(false));
    });

    app.get('/blogs', (req, res) => {
        blogsCollection.find({})
        .toArray((err, documents) => {
            if(err){
                res.send({});
            } else{
                res.send(documents);
            }
        })
    });

    app.delete('/delete-blog/:id', (req, res) => {
        blogsCollection.deleteOne({ _id: ObjectId(req.params.id)})
        .then(result => res.send(result.deletedCount > 0))
        .catch(() => res.send(false));
    });

});

app.listen( process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})