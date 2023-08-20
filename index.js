const express = require('express');
const cors = require('cors');

require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });



app.get('/', (req, res) => {
    res.send('Notepad Server is Runnning....')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a46jnic.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        const notesCollection = client.db("notesDB").collection("notes");

        app.post('/notes', async (req, res) => {
            const note = req.body;
            const result = await notesCollection.insertOne(note)
            res.send(result)
            console.log(note);
        })

        app.get('/favorites', async (req, res) => {

            let query = {}
            if (req.query?.email) {
                query = { userEmail: req.query.email, favorite: true }
            }
            const result = await notesCollection.find(query).toArray()
            res.send(result)
        })


        app.get('/notes', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { userEmail: req.query.email, favorite: false }
            }
            const result = await notesCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await notesCollection.findOne(filter)
            res.send(result)
        })

        app.delete('/favorites/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await notesCollection.deleteOne(filter)
            res.send(result)
        })
        app.delete('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await notesCollection.deleteOne(filter)
            res.send(result)
        })

        app.put('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedNote = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedNote.title,
                    descriptions: updatedNote.descriptions,
                    textColor: updatedNote.textColor
                }
            }
            const result = await notesCollection.updateOne(filter, updateDoc, options)
            res.send(result)

        })


        app.patch('/favorites/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedNote = req.body;


            const updateDoc = {
                $set: {
                    favorite: updatedNote.favorite
                },
            };
            const result = await notesCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.patch('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedNote = req.body;


            const updateDoc = {
                $set: {
                    favorite: updatedNote.favorite
                },
            };

            console.log(updatedNote);

            const result = await notesCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
    console.log(
        `Notepad Server is running in port:${port}`
    );
})