# Jqm-Canvas-App
An app integrated with canvas painting using jqm

##Usage

### Initial your canvas whenever you enter your image page
```javascript
$(document).on("pagebeforeshow", "#imageEditorPaintingPage", function (e, ui) {        
    var imageURL = "Your Image Path";
    var screenWidth = window.innerWidth - 65;
    var screenHeight = window.innerHeight - 220;
    //var imageURL = "images/DrawerPanelImg.png";
    canvasDrawerApi.init(imageURL, screenWidth, screenHeight);
});
```

### Initial your canvas whenever you change orientation
```javascript
$(window).on("orientationchange", function () {
    window.setTimeout(function () {
        if (typeof $("#mycanvas") !== "undefined" && $("#mycanvas") !== null) {
            var imageURL = "Your Image Path";
            var screenWidth = window.innerWidth - 65;
            var screenHeight = window.innerHeight - 220;
            canvasDrawerApi.init(imageURL, screenWidth, screenHeight);
        }
    }, 500);
});
```

### Clear your painting on picture (Clear Button)
```javascript
$("#btnClearColor").click(function () {
    var imageURL = "Your Image Url Path";
    var screenWidth = window.innerWidth - 65;
    var screenHeight = window.innerHeight -220;
    canvasDrawerApi.clear(imageURL, screenWidth, screenHeight);
});
```       

### Use cordova plugin to save image to jpg or png (Originally it's base64 format)
Please refer to (https://github.com/wbt11a/Canvas2ImagePlugin)

```javascript
$("#btnSavePainting").click(function () {
      navigator.notification.confirm("Please make sure you would like to save current version of the picture, original picture will be replaced after the save action occur! \n\n請先確定您是否要儲存此版照片!儲存後,原照片將被取代!", function (buttonindex) {
          if (buttonindex == 1) {              
              var canvasSourceURL = canvasDrawerApi.savetoURL(); //for debugging you can see the base64 format of this image

              //... format: jpg   ... quality 50% ...
              window.canvas2ImagePlugin.saveImageDataToLibrary(
                  function (imagePath) {
                      //imagePath is the filename path (for android and iOS)
                      //let's say => imagePath: "/storage/sdcard/Pictures/c2i_2972016103744.jpg"
                      //but we need this kind of format => "file:///storage/sdcard/Android/data/io.cordova.myapp15db39/cache/1472438459303.jpg"
                      //so we append "file://" to imagePath                            
                      if (imagePath.indexOf("file://") == -1 ) {
                          imagePath = "file://" + imagePath;
                      }

                      //File Operation
                      window.resolveLocalFileSystemURI(imagePath, function (entry) {                          
                          //make a new image path
                          var CurrentDateTime = new Date();
                          var CurrentFormattedDate = CurrentDateTime.getFullYear().toString() + padZeroLeftSide((CurrentDateTime.getMonth() + 1).toString(), 2) + padZeroLeftSide(CurrentDateTime.getDate().toString(), 2) + padZeroLeftSide(CurrentDateTime.getHours().toString(), 2) + padZeroLeftSide(CurrentDateTime.getMinutes().toString(), 2) + padZeroLeftSide(CurrentDateTime.getSeconds().toString(), 2) + CurrentDateTime.getMilliseconds().toString();

                          var newFileName = "Your File Name" + "_" + CurrentFormattedDate + "_" + ".jpg";                                
                          var myFolderApp = "PicFolder";

                          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) { //get directory path
                              //The folder is created if doesn't exist
                              fileSystem.root.getDirectory(myFolderApp, { create: true, exclusive: false }, function (directory) {                                        
                                  entry.moveTo(directory, newFileName, function (entry) {                                            
                                      var DetailURL = entry.toURL();                                      
                                      //use your WebSQL to update your picture path if necessary                                                                            
                                      
                                      navigator.notification.alert('This Picture has already be saved!\n\n此相片已儲存完畢!', alertDismissed, 'Message', 'OK');                                            
                                  }, fileOperErrorMsg);
                              }, fileOperErrorMsg);
                          },
                          fileOperErrorMsg);
                      }, fileOperErrorMsg); //get file                                                          
                  },
                  function (err) {
                      alert(err);
                  },
                  document.getElementById('mycanvas'),
                  '.jpg',
                  50
              );
          }
      }, "Confirm Message", ["確定儲存", "稍後儲存"]);            
  });
```
