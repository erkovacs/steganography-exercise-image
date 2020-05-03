const App = (function(){

   const ENDPOINT = "/api/";
   const App = {};
   App.isLoading = false;

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

   let _validateForm = (model, params) => {
       let answer = true;
       if(!model.image || model.image.size <= 0){
           _addError("fileInput", "An image file is required.");
           answer = false;
       }
       if(!model.algorithm || model.algorithm.length <= 0){
            _addError("algorithmSelect", "An algorithm is required.");
            answer = false;
       }
       if(model.image && params.allowedImageTypes.indexOf(model.image.type) < 0){
            _addError("fileInput", `Only ${params.allowedImageTypes.join(' ')} images are supported.`);
            answer = false;
       }
       return answer;
   }; 

   let _displayFile = (id, url) => {
       const image = App._document.getElementById(id);
       image.src = url;
       if(image.src){
           const el = App._document.getElementById("downloadBtn");
           el.style = "display: flex";
       }
   };

   let _toggleLoad = () => {
       App.isLoading = !App.isLoading;
       const el = App._document.getElementById("loadingBar");
       const image = App._document.getElementById("imagePreview");
       if(App.isLoading){
           el.style = "display : flex";
           image.style = "opacity: 0.5";
       } else {
           el.style = "display : none";
           image.style = "opacity: 1";
       }
   }

   let _getFormData = () => {
        const form = App._document.getElementById("imageForm");
        const formData = new FormData(form);
        const text = formData.get("textInput");
        const image = formData.get("fileInput");
        const algorithm = formData.get("algorithmSelect");
        const model = {
            text: text,
            image: image,
            algorithm: algorithm,
            formData: formData
        };
        return model;
   };

   let _attemptParse = string => {
    const start = string.search(/\<MSG\>/gi);
    const end = string.search(/\<\/MSG\>/gi);
    if(start > -1 && end > -1){
        return string.substring(start + 5, end);
    } else {
        return "No message appears to be present. Raw data: \n\n" + string;
    }
   }

   let _setText = (id, text) => {
       const el = App._document.getElementById(id);
       el.value = text;
   };

   App.init = _document => {
       App._document = _document;
        
       _attachEventHandler("fileInput", "change", (el, event) => {
            _toggleLoad();
            event.preventDefault();
            const file = el.files[0];
            _displayFile("imagePreview", URL.createObjectURL(file));
            _toggleLoad();
        });
        
        _attachEventHandler("imageForm", "submit", async (el, event) => {});

        _attachEventHandler("encodeBtn", "click", async (el, event) => {
            event.preventDefault();
            const model = _getFormData();
            if(_validateForm(model, { 
                allowedImageTypes: [
                "image/jpeg",
                "image/bmp"
            ] })){
                _toggleLoad();
                try {
                    const response = await fetch(ENDPOINT + "encodeImage", {
                    method: 'POST',
                    body: model.formData
                    });
                    const json = await response.json();
                    if(json.success){
                        _displayFile("imagePreview", json.file);
                    } else {
                        _addError("imageForm", json.message);
                    }
                } catch(e){
                    _addError("imageForm", e.toString());
                }
                _toggleLoad();
           }
        });

        _attachEventHandler("decodeBtn", "click", async (el, event) => {
            event.preventDefault();
            const model = _getFormData();
            if(_validateForm(model, { allowedImageTypes : [ "image/bmp" ] })){
                _toggleLoad();
                _setText("textInput", "Loading...");
                try {
                    const response = await fetch(ENDPOINT + "decodeImage", {
                        method: 'POST',
                        body: model.formData
                    });
                    const json = await response.json();
                    if(json.success){
                        _displayFile("imagePreview", json.file);
                        const text = _attemptParse(json.text);
                        _setText("textInput", text);
                    } else {
                        _addError("imageForm", json.message);
                    }
                } catch(e){
                    _addError("imageForm", e.toString());
                }
                _toggleLoad();
           }
        });

        _attachEventHandler("downloadBtn", "click", (el, event) => {
            event.preventDefault();
            const link = App._document.createElement('a');
            const image = App._document.getElementById("imagePreview");
            link.href = image.src;
            link.download = `output_${_getRandomString(8)}.bmp`;
            App._document.body.appendChild(link);
            link.click();
            App._document.body.removeChild(link);
        });
   };
   App.run = () => {
   };
   return App;
})();