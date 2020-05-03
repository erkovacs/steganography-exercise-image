const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const bmp = require("bmp-js");
const jpeg = require("jpeg-js");
const algorithms = require("./lib/algorithms");

const app = express();
const PORT = process.env.APP_PORT || 13000;
const DOCROOT = process.env.APP_DOCROOT || "client";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(DOCROOT));

app.post("/api/encodeImage", (req, res) => {
    try {
        const text = req.body.textInput;
        const algorithm = req.body.algorithmSelect;
        const file = req.files.fileInput;

        if(file && file.data){
            let rawInData;
            switch(file.mimetype){
                case "image/jpeg":
                    rawInData = jpeg.decode(file.data);
                    rawInData.data = algorithms.util.convertEndianness(rawInData.data);
                    break;
                case "image/bmp":
                    rawInData = bmp.decode(file.data);
                    break;
                default:
                    rawInData = {};
                    break;
            }

            let processedData;
            switch(algorithm){
                case "lsb":
                    processedData = algorithms.encode.lsb(rawInData.data, text);
                    break;
                case "threshold":
                    processedData = algorithms.encode.threshold(rawInData.data);
                    break;
                case "alpha":
                    processedData = algorithms.encode.alpha(rawInData.data);
                    break;
                default:
                    processedData = rawInData.data;
                    break;
            }

            const rawOutData = {
                data: processedData,
                width: rawInData.width,
                height: rawInData.height,
            };
            
            const bmpImageData = bmp.encode(rawOutData);
            
            const dataUrl = bmpImageData.data.toString("base64");
            res.status(200).json({
                success: true,
                file: `data:image/bmp;base64,${dataUrl}`
            });
        }
    } catch(e){
        res.status(500).json({
            success: false,
            message: e.toString()
        });
    }
});

app.post("/api/decodeImage", (req, res) => {

    try {
        const text = req.body.textInput;
        const algorithm = req.body.algorithmSelect;
        const file = req.files.fileInput;

        if(file && file.data){
            const rawInData = bmp.decode(file.data);

            let extractedText;
            switch(algorithm){
                case "lsb":
                    extractedText = algorithms.decode.lsb(rawInData.data);
                    break;
                case "alpha":
                    extractedText = algorithms.decode.alpha(rawInData.data);
                    break;
                case "threshold":
                    extractedText = algorithms.decode.threshold(rawInData.data);
                    break;
                default:
                    extractedText = "";
                    break;
            }

            const rawOutData = {
                data: rawInData.data,
                width: rawInData.width,
                height: rawInData.height,
            };
            
            const bmpImageData = bmp.encode(rawOutData);

            const dataUrl = bmpImageData.data.toString("base64");
            res.status(200).json({
                success: true,
                text: extractedText,
                file: `data:image/bmp;base64,${dataUrl}`
            });
        } 
    } catch(e){
        res.status(500).json({
            success: false,
            message: e.toString()
        });
    }
});


const server = 
    app.listen(PORT, () => console.log(`Server started on http://${server.address().address}:${server.address().port}, docroot=${DOCROOT}`));