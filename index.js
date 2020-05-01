const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const Jpeg = require("./lib/jpeg");

const app = express();
const PORT = process.env.APP_PORT || 13000;
const DOCROOT = process.env.APP_DOCROOT || "client";
const STORAGE = process.env.APP_STORAGE || "storage";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(DOCROOT));

app.post("/api/submitImage", (req, res) => {
    const file = req.files.fileInput;
    const data = file.data;

    if(file && file.data){
        const jpeg = new Jpeg(file.data.toString("hex"));
        console.log(jpeg.header);
    }


    fs.writeFile(`${STORAGE}/${file.name}`, "", {}, error => {
        if(error){
            res.json(500, {
                success: false,
                message: error + ""
            });
        } else {
            
        }
    });
    res.end("Test");
});

const server = app.listen(PORT, () => console.log(`Server started on http://${server.address().address}:${server.address().port}, docroot=${DOCROOT}`));