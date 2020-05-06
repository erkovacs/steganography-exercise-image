const algorithms = {
    encode: {
        threshold: (inputData) => {
            for(let i = 0; i < inputData.length; i+=4){
                const r = inputData[i+1];
                const g = inputData[i+2];
                const b = inputData[i+3];
                const avg = (r+g+b) / 3;
                if(avg < 0x7f){
                    inputData[i+1] = inputData[i+2] = inputData[i+3] = 0x00;
                } else {
                    inputData[i+1] = inputData[i+2] = inputData[i+3] = 0xff;
                }
            }
            return inputData;
        },
        lsb: (inputData, text) => {
            let bin = algorithms.util.getMessageBinary(text);
            for(let i = 0, j = 0; i < inputData.length; i += 4, j++){
                if(j < bin.length){
                    if(inputData[i+1] % 0x02 == 0 && bin[j] == 1){
                        inputData[i+1]++;
                    } else if(inputData[i+1] % 0x02 == 1 && bin[j] == 0){
                        inputData[i+1]--;
                    }
                } else {
                    break;
                }
            }
            return inputData;
        },
        alpha: (inputData, text) => {
            let message = algorithms.util.getMessage(text);
            for(let i = 0, j = 0; i < inputData.length; i += 4, j++){
                if(j < message.length){
                    inputData[i] = message.charCodeAt(j);
                } else {
                    break;
                }
            }
            return inputData;
        },
        proprietary: (inputData, text) => {
            const data = inputData.data;
            let bin = algorithms.util.getMessageBinary(text);
            let channels = inputData.data.length / (inputData.height*inputData.width);
            let i = 0;
            for (let y = 0; y < inputData.height; y++){
                for (let x = 0; x < inputData.width; x++){
                    let i = x + (y * inputData.width * channels);
                    data[i+1] = 0; // g
                    data[i+2] = 0; // b
                    data[i+3] = 0; // r
                }
            }
            return data;
        }
    },
    decode: {
        threshold: () => "",
        lsb: (inputData) => {
            let binMsg = "";
            for(let i = 0; i < inputData.length; i+=4){
                const int = inputData[i+1];
                const b = int.toString(2);
                binMsg += b[b.length - 1];
            }
            return algorithms.util.binStrToUtf8(binMsg);
        },
        alpha: inputData => {
            let msg = "";
            for(let i = 0; i < inputData.length; i+=4){
                const int = inputData[i];
                if(int > 0x00){
                    msg += String.fromCharCode(int);
                }
            }
            return msg;
        },
        proprietary: inputData => {
            let binMsg = "10101010";
            return algorithms.util.binStrToUtf8(binMsg);
        }
    },
    util: {
        convertEndianness: inputData => {
            for(let i = 0; i < inputData.length; i += 4){
                const r = inputData[i];
                const g = inputData[i+1];
                const b = inputData[i+2];
                const a = inputData[i+3];
                inputData[i] = a;
                inputData[i+1] = b;
                inputData[i+2] = g;
                inputData[i+3] = r;
            }
            return inputData;
        },
        getGlobalAvg: inputData => {
            let gAvg = 0;
            for(let i = 0; i < inputData.length; i+=4){
                const r = inputData[i+1];
                const g = inputData[i+2];
                const b = inputData[i+3];
                const avg = (r+g+b) / 3;
                gAvg += avg;
            }
            return gAvg / inputData.length;
        },
        dwt: inputData => {
            let output = [];
            // This function assumes that input.length=2^n, n>1
            for (let length = inputData.length / 2; ; length = length / 2) {

                // length is the current length of the working area of the output array.
                // length starts at half of the array size and every iteration is halved until it is 1.
                for (let i = 0; i < length; i++) {
                    let sum = inputData[i * 2] + inputData[i * 2 + 1];
                    let difference = inputData[i * 2] - inputData[i * 2 + 1];
                    output[i] = sum;
                    output[length + i] = difference;
                }
                if (length == 1 || length == 0) {
                    return output;
                }
                //Swap arrays to do next iteration
                algorithms.util.arrayCopy(output, 0, inputData, 0, length);
            }  
        },
        arrayCopy: (source, sourceIndex, destination, destinationIndex, length) => {
            for(let i = sourceIndex; i < length; i++){
                destination[destinationIndex + i] = source[i];
            }
        },
        getMessage: text => {
            return `<MSG>${text}</MSG>`;
        },
        getMessageBinary: text => {
            const message = algorithms.util.getMessage(text);
            const bin = [];
            for(let i = 0; i < message.length; i++){
                let char = message.charCodeAt(i);
                let binChar = char.toString(2);
                while(binChar.length < 8){
                    binChar = "0" + binChar;
                }
                for(let j = 0; j < binChar.length; j++){
                    bin.push(binChar[j]);
                }
            }
            return bin;
        },
        binStrToUtf8: binStr => {
            let msg = "";
            for(let i = 0; i < binStr.length; i+=8){
                const byte = binStr.slice(i, i+8);
                const int = parseInt(byte, 2);
                msg += String.fromCharCode(int);
            }
            return msg;
        }
    }
};

module.exports = algorithms;