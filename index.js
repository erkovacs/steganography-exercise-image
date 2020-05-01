const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const jpeg = require("jpeg-js");
const algorithms = require("./lib/algorithms");

const app = express();
const PORT = process.env.APP_PORT || 13000;
const DOCROOT = process.env.APP_DOCROOT || "client";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(DOCROOT));

app.post("/api/encodeImage", (req, res) => {
    
    const text = req.body.textInput;
    const algorithm = req.body.algorithmSelect;
    const file = req.files.fileInput;

    if(file && file.data){
        const rawInData = jpeg.decode(file.data, { useTArray: true });
        let processedData;
        switch(algorithm){
            case "alpha":
                // hide data in the alpha channel
                processedData = algorithms.encode.alpha(rawInData.data, text);
                break;
            default:
                // just use this filter
                processedData = algorithms.encode.threshold(rawInData.data);
                break;
        }

        const rawOutData = {
            data: processedData,
            width: rawInData.width,
            height: rawInData.height,
        };
        
        const jpegImageData = jpeg.encode(rawOutData, 100);

        const dataUrl = jpegImageData.data.toString("base64");
        res.status(200).json({
            success: true,
            file: `data:image/jpeg;base64,${dataUrl}`
        });
    }
});

app.post("/api/decodeImage", (req, res) => {

    const text = req.body.textInput;
    const algorithm = req.body.algorithmSelect;
    const file = req.files.fileInput;

    if(file && file.data){
        const rawInData = jpeg.decode(file.data, { useTArray: true });

        let extractedText;
        switch(algorithm){
            case "alpha":
                // hide data in the alpha channel
                extractedText = algorithms.decode.alpha(rawInData.data);
                break;
            default:
                // just use this filter
                extractedText = algorithms.decode.threshold(rawInData.data);
                break;
        }

        const rawOutData = {
            data: rawInData.data,
            width: rawInData.width,
            height: rawInData.height,
        };
        
        const jpegImageData = jpeg.encode(rawOutData, 100);

        const dataUrl = jpegImageData.data.toString("base64");
        res.status(200).json({
            success: true,
            text: extractedText,
            file: `data:image/jpeg;base64,${dataUrl}`
        });
    }
});


const server = 
    app.listen(PORT, () => console.log(`Server started on http://${server.address().address}:${server.address().port}, docroot=${DOCROOT}`));