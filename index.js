const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const jpeg = require("jpeg-js");

const app = express();
const PORT = process.env.APP_PORT || 13000;
const DOCROOT = process.env.APP_DOCROOT || "client";
const STORAGE = process.env.APP_STORAGE || "storage";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(DOCROOT));

app.post("/api/submitImage", (req, res) => {
    const file = req.files.fileInput;

    if(file && file.data){
        const rawInData = jpeg.decode(file.data, { useTArray: true });

        // Apply this crappy filter to test out the library

        for(let i = 0; i < rawInData.data.length; i += 4){
            let avg = (rawInData.data[i] + rawInData.data[i+1] + rawInData.data[i+2]) / 3;
            if(avg > 127){
                rawInData.data[i] = 255;
                rawInData.data[i+1] = 255;
                rawInData.data[i+2] = 255;
            } else {
                rawInData.data[i] = 0;
                rawInData.data[i+1] = 0;
                rawInData.data[i+2] = 0;
            }
        }

        const rawOutData = {
            data: rawInData.data,
            width: rawInData.width,
            height: rawInData.height,
        };
        
        const jpegImageData = jpeg.encode(rawOutData, 50);
        
        fs.writeFile(`${STORAGE}/${file.name}`, jpegImageData.data, {}, error => {
            if(error){
                res.json(500, {
                    success: false,
                    message: error + ""
                });
            } else {
                // TODO::Send file back
            }
        });
    }
    res.json(200, {success: true});
});

const server = app.listen(PORT, () => console.log(`Server started on http://${server.address().address}:${server.address().port}, docroot=${DOCROOT}`));