const algorithms = {
    encode: {
        threshold: inputData => {
            const data = [];
            for(let i = 0; i < inputData.length; i += 4){
                let avg = (inputData[i] + inputData[i+1] + inputData[i+2]) / 3;
                if(avg > 127){
                    data[i] = 255;
                    data[i+1] = 255;
                    data[i+2] = 255;
                } else {
                    data[i] = 0;
                    data[i+1] = 0;
                    data[i+2] = 0;
                }
            }
            return data;
        },
        alpha: (inputData, text) => {

            let data = inputData;

            let j = 0;
            for(let i = 0; i < inputData.length; i += 4){
                if(j < text.length){
                    data[i+2] = text.charCodeAt(j);
                    j++;
                }
            }
            console.log("outputData", data);
            return data;
        }
    },
    decode: {
        threshold: () => "",
        alpha: (inputData) => {
            console.log("inputData", inputData);
            let text = "--->\n\n";
            for(let i = 0; i < inputData.length; i += 4){
                if(inputData[i+2] < 255){
                    text += String.fromCharCode(inputData[i+2]);
                };
            }
            return text;
        }
    }
};

module.exports = algorithms;