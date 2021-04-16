const express = require('express');
const mongodb = require("mongodb").MongoClient;
const fileUpload = require('express-fileupload');
const csv = require('csvtojson');
const cors = require('cors');


const CONNECTION_URL = process.env.URL;
const app = express();


app.use(cors());
app.use(fileUpload());

function csvtojson(filePath) {
    console.log(filePath);
    csv()
        .fromFile(filePath)
        .then(csvData => {
            console.log(csvData);
            mongodb.connect(
                CONNECTION_URL,
                { useNewUrlParser: true, useUnifiedTopology: true },
                (err, client) => {
                    if (err) throw err;
                    client
                        .db("csv")
                        .collection(filePath)
                        .insertMany(csvData, (err, res) => {
                            if (err) throw err;
                            console.log(`Inserted: ${res.insertedCount} rows`);
                            client.close();
                        });
                }
            );
        });
}

app.post('/upload', (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    var file = req.files.file;

    file.mv(`${__dirname}/${file.name}`, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json({
            fileName: file.name,
            filePath: `/${file.name}`
        });
        csvtojson(`${file.name}`);
    });
});

app.get('/get', (req, res) => {

})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server Started'));