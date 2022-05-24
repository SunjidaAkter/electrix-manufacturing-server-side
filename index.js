const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//use middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: "Sorry Unauthorized" });
    }

    jwt.verify(
        authHeader,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
            if (err) {
                return res
                    .status(403)
                    .send({ massage: " Forbidden, does not have access " });
            }

            req.decoded = decoded;
            next();
        }
    );
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.daybt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//require('crypto').randomBytes(64).toString('hex')


async function run() {
    try {
        await client.connect();
        const toolCollection = client.db("assignmentTwelfth").collection("tool");
        const reviewCollection = client.db("assignmentTwelfth").collection("review");
        const userCollection = client.db('assignmentTwelfth').collection('user');
        const newsCollection = client.db('assignmentTwelfth').collection('news');


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        });

        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })


        app.get("/review", async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        app.get("/news", async (req, res) => {
            const query = {};
            const cursor = newsCollection.find(query);
            const news = await cursor.toArray();
            res.send(news);
        });

    }

    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running My Twelfth Assignment Server');
});
app.listen(port, () => {
    console.log('Twelfth Assignment Server is running on port :', port)
})