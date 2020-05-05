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
            let bin = algorithms.util.getMessageBinary(text);
            let pixels = [];
            for(let i = 0; i < inputData.length; i+=4){
                const pixel = {
                    start: i
                };
                const r = inputData[i+1];
                const g = inputData[i+2];
                const b = inputData[i+3];
                const avg = (r+g+b) / 3;
                pixel.brightness = avg;
                pixels.push(pixel);   
            }
            pixels = pixels.sort((a, b) => { return a.brightness - b.brightness; });
            let middle = pixels.length / 2;
            for(let i = 0; i < bin.length; i++){
                let offset;
                if(i % 2 === 0){
                    offset = middle - i;
                } else {
                    offset = middle + i;
                }
                if(inputData[pixels[offset].start + 1] % 0x02 == 0 && bin[i] == 1){
                    inputData[pixels[offset].start + 1]++;
                }else if(inputData[pixels[offset].start + 1] % 0x02 == 1 && bin[i] == 0){
                    inputData[pixels[offset].start + 1]--;
                }
            }
            return inputData;
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
            let binMsg = "";
            let pixels = [];
            for(let i = 0; i < inputData.length; i+=4){
                const pixel = {
                    start: i
                };
                const r = inputData[i+1];
                const g = inputData[i+2];
                const b = inputData[i+3];
                const avg = (r+g+b) / 3;
                pixel.brightness = avg;
                pixels.push(pixel);   
            }
            pixels = pixels.sort((a, b) => { return a.brightness - b.brightness; });
            let middle = pixels.length / 2;
            for(let i = 0; i < pixels.length; i++){
                let offset;
                if(i % 2 === 0){
                    offset = middle - i;
                } else {
                    offset = middle + i;
                }
                if(pixels[offset]){
                    const int = inputData[pixels[offset].start + 1];
                    const b = int.toString(2);
                    binMsg += b[b.length - 1];
                }
            }
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