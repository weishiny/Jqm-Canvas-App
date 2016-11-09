var canvasDrawerApi = (function () {
    "use strict";
    
    var htmlCanvas;
    var contexts = {};
    var context;
    var outlineImage = new Image();
    var paint = false;
    var color;
    var LIST_DATA = [], PREV_X, PREV_Y; //this index is record which sub canvas is in-use.

    // Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
    var init = function (imageURL, width, height) {
        // Obtain a reference to the canvas element using its id.
        htmlCanvas = document.getElementById('mycanvas');
        // Obtain a graphics context on the canvas element for drawing.
        context = htmlCanvas.getContext('2d');
        resizeCanvas(imageURL, width, height);
    };

    var resizeCanvas = function (imageURL, width, height) {
        htmlCanvas.width = width;
        htmlCanvas.height = height;
        initdraw(imageURL, htmlCanvas.width, htmlCanvas.height);
        createUserEvents();
    };

    var initdraw = function (imageURL, width, height) {
        var strvalue = $("#color_value").val();
        context.strokeStyle = "#" + strvalue;
        context.lineWidth = '5';
        context.strokeRect(0, 0, width, height);

        // Load images (會有Image Cache問題)
        outlineImage.src = imageURL; //"images/DrawerPanelImg.png";
        /**Method1 Start**/
        outlineImage.onload = function () {
            context.drawImage(outlineImage, 0, 0, width, height);            
        };
        if (outlineImage.complete) {
            $(outlineImage).load();
        }
        /**Method1 End**/

        /**Method2 Start**/
        //$(outlineImage).one("load", function () {
        //    context.drawImage(outlineImage, 0, 0, width, height);
        //}).each(function () {
        //    if (this.complete) $(this).load();
        //});
        /**Method2 End**/


        //outlineImage.src = imageURL; //"images/DrawerPanelImg.png";

        //第一次畫時,圖片皆可載入,但之後如Clear, 轉向等動作進來時, 圖片皆消失, 因為Image caching!導致load事件只執行一次,使得圖片無法再載入了 => 無法執行context.drawImage(outlineImage, 0, 0, width, height);
        //the load event only ever fires once for an image, Once that image is loaded and cached by the browser, 
        //that event will never automatically fire again, even if the DOM element itself has been destroyed and inserted again into the page.

        /**Solution: **/
        //If the image element has the complete property set, we need to manually trigger a load event on the 
        //image. That way, if the image has been cached, we call .load()
        //the event is firing in the cached case, before you even get the event handler bound. 
        //To fix this, you can loop through checking and triggering the event based on .complete property
        
    };               

    var draw = function (obj, data) {
        obj.lineJoin = "round";
        obj.lineWidth = 5;
        obj.beginPath();
        obj.strokeStyle = data.color;
        obj.moveTo(data.prev_x, data.prev_y);
        obj.lineTo(data.x, data.y);
        obj.closePath();
        obj.stroke();
    };

    var generateObject = function (x, y, dragging) {
        console.log("generateObject:" + $("#color_value").val())
        var data = {
            x: x,
            y: y,
            prev_x: dragging ? PREV_X : x,
            prev_y: dragging ? PREV_Y : y,
            color: "#" + $("#color_value").val()
        };
        PREV_X = x;
        PREV_Y = y;
        return data;
    };
   
    var clear = function (imageURL, width, height) {
        context.clearRect(0, 0, width, height); // Clears the canvas
        init(imageURL, width, height);
    };

    var savetoURL = function () {
        var canvasImageURL = htmlCanvas.toDataURL();
        return canvasImageURL;
    };
    // Add mouse and touch event listeners to the canvas
    var createUserEvents = function () {

        var press = function (e) {
            var mouseX = e.targetTouches[0].pageX - this.offsetLeft;
            var mouseY = e.targetTouches[0].pageY - this.offsetTop;
            var data = generateObject(mouseX, mouseY, false);            
            paint = true;
            
            draw(context, data);
        };

        var drag = function (e) {
            if (paint) {
                var mouseX = e.targetTouches[0].pageX - this.offsetLeft;
                var mouseY = e.targetTouches[0].pageY - this.offsetTop;
                var data = generateObject(mouseX, mouseY, true);                
                draw(context, data);                
            }
            // Prevent the whole page from dragging if on mobile
            e.preventDefault();
        };

        var release = function () {
            console.log('paint completed');
            paint = false;
            var mouseX = e.targetTouches[0].pageX - this.offsetLeft;
            var mouseY = e.targetTouches[0].pageY - this.offsetTop;
            var data = generateObject(mouseX, mouseY, false);
            draw(context, data);
        };

        var cancel = function () {
            paint = false;
        };

        // Add mouse event listeners to canvas element
        htmlCanvas.addEventListener("mousedown", press, false);
        htmlCanvas.addEventListener("mousemove", drag, false);
        htmlCanvas.addEventListener("mouseup", release);
        htmlCanvas.addEventListener("mouseout", cancel, false);

        // Add touch event listeners to canvas element
        htmlCanvas.addEventListener("touchstart", press, false);
        htmlCanvas.addEventListener("touchmove", drag, false);
        htmlCanvas.addEventListener("touchend", release, false);
        htmlCanvas.addEventListener("touchcancel", cancel, false);               
    };

    return {
        init: init,
        clear: clear,
        savetoURL: savetoURL
    };
}());