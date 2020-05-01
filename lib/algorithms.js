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
            for(let i = 0; i < inputData.length; i += 4){
                // TODO::hide the data here
                data[i+3] = 128;
            }
            return data;
        }
    },
    decode: {
        threshold: () => "",
        alpha: (inputData) => {
            let text = "";
            for(let i = 0; i < inputData.length; i += 4){
                if(inputData[i+3] != 255){
                    text += String.fromCharCode(inputData[i+3]);
                    console.log(inputData[i+3]);
                };
            }
            return text;
        }
    }
};

module.exports = algorithms;