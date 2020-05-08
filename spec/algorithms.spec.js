const fs = require("fs");
const jpeg = require("jpeg-js");
const bmp = require("bmp-js");
const algorithms = require("../lib/algorithms");
const PLAINTEXT = "TEST TEXT";
const TEST_DIR = "./spec/testData/";
const TEMP_DIR = "./spec/testData/__temp/";
const TEST_FILE = "testPicture.jpg";
const OUT_FILE = "output.bmp";

describe("Tests 1", function() {

  let setUp = () => {
    if(!fs.existsSync(TEMP_DIR)){
      fs.mkdirSync(TEMP_DIR);
    }
  }
  
  let tearDown = () => {
    if(fs.existsSync(TEMP_DIR + OUT_FILE)){
      fs.unlinkSync(TEMP_DIR + OUT_FILE);
    }
    if(fs.existsSync(TEMP_DIR)){
      fs.rmdirSync(TEMP_DIR);
    }
  }

  it("Embeds text in an image, then decodes it", function() {
    setUp();
    const rawFile = fs.readFileSync(TEST_DIR + TEST_FILE);
    const initialImage = jpeg.decode(rawFile);
    initialImage.data = algorithms.util.convertEndianness(initialImage.data);
    const rawData = algorithms.encode.proprietary(initialImage, PLAINTEXT);
    const bmpImage = bmp.encode({
      width: initialImage.width,
      height: initialImage.height,
      data: rawData
    });
    try {
      fs.writeFileSync(TEMP_DIR + OUT_FILE, bmpImage.data);
    } catch(e){
      fail("Could not write file");
    }
    const outFile = fs.readFileSync(TEMP_DIR + OUT_FILE);
    const stegoImage = bmp.decode(outFile);
    const text = algorithms.decode.proprietary(stegoImage);
    expect(text).toContain(PLAINTEXT);
    tearDown();
  });
});