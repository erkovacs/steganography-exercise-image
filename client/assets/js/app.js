const App = (function(){

   const ENDPOINT = "/api/";
   const App = {};

   let _getRandomString = len => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
   }

   let _attachEventHandler = (id, event, callback) => {
       const doc = App._document;
       const el = doc.getElementById(id);
       el.addEventListener(event, _event => {
           callback(el, _event);
       });
   }

   let _addError = (id, text) => {
       const doc = App._document;
       const el = doc.getElementById(id);
       const generatedId = `error_` + id + `_${_getRandomString(16)}`;
       const tpl = `<div class="alert alert-dismissible alert-primary" id="${generatedId}">${text}</div>`;
       el.insertAdjacentHTML("beforebegin", tpl);
       setTimeout(()=>{
            const msg = doc.getElementById(generatedId);
            msg.parentNode.removeChild(msg);
       }, 2000);
   };

   let _validateForm = (params) => {
       let answer = true;
       if(!params.text || params.text.length <= 0){
           _addError("textInput", "Some text is required.");
           answer = false;
       }
       if(!params.image || params.image.size <= 0){
           _addError("fileInput", "An image file is required.");
           answer = false;
       }
       if(params.image && params.image.type !== "image/jpeg"){
            _addError("fileInput", "Only JPEG images are supported.");
            answer = false;
       }
       return answer;
   }; 

   let _displayFile = (id, url) => {
       const image = App._document.getElementById(id);
       image.src = url;
   };

   App.init = _document => {
       App._document = _document;
       _attachEventHandler("imageForm", "submit", async (el, event) => {
           event.preventDefault();
           var formData = new FormData(el);
           const text = formData.get("textInput");
           const image = formData.get("fileInput");
           const model = {
                text: text,
                image: image
           };
           if(_validateForm(model)){
               _displayFile("imagePreview", URL.createObjectURL(model.image));
               const response = await fetch(ENDPOINT + "submitImage", {
                    method: 'POST',
                    body: formData
               });
           }
        });
   };
   App.run = () => {
   };
   return App;
})();