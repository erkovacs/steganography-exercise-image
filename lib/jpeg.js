function Jpeg(hexData){
    this.rawData = hexData;
    // JPEG Header structure:
    // typedef struct _JFIFHeader {
    // BYTE SOI[2];          /* 00h  Start of Image Marker     */
    // BYTE APP0[2];         /* 02h  Application Use Marker    */
    // BYTE Length[2];       /* 04h  Length of APP0 Field      */
    // BYTE Identifier[5];   /* 06h  "JFIF" (zero terminated) Id String */
    // BYTE Version[2];      /* 07h  JFIF Format Revision      */
    // BYTE Units;           /* 09h  Units used for Resolution */
    // BYTE Xdensity[2];     /* 0Ah  Horizontal Resolution     */
    // BYTE Ydensity[2];     /* 0Ch  Vertical Resolution       */
    // BYTE XThumbnail;      /* 0Eh  Horizontal Pixel Count    */
    // BYTE YThumbnail;      /* 0Fh  Vertical Pixel Count      */
    // } JFIFHEAD;
    this.header = {};
    this.header.SOI = hexData.slice(0, 2);
    this.header.APP0 = hexData.slice(2, 4);
    this.header.Length = hexData.slice(4, 6);
    this.header.Identifier = hexData.slice(6, 11);
    this.header.Version = hexData.slice(11, 13);
    this.header.Units = hexData.slice(13, 14);
    this.header.Xdensity = hexData.slice(14, 16);
    this.header.Ydensity = hexData.slice(16, 18);
    this.header.XThumbnail = hexData.slice(18, 19);
    this.header.YThumbnail = hexData.slice(19, 20);
    
    this.body = hexData.slice(20, hexData.length);
    
};

module.exports = Jpeg;