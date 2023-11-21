
// set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// wait for dom content to load
document.addEventListener('DOMContentLoaded', function () {
    // set up our canvas
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var shapes = [];
    var isDragging = false;
    var dragOffsetX, dragOffsetY, currentShape;



    document.getElementById('download').addEventListener('click', function(e) {
        // convert canvas to data url
        let canvasUrl = canvas.toDataURL();
        const createEl = document.createElement('a');
        createEl.href = canvasUrl;
    
        // name download
        createEl.download = "diagram";
    
        // click download button to download, dont want to download it twice
        createEl.click();
        createEl.remove();
    });
    



    // Function to draw a specific shape
    function drawShape(shape) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // depending on shape we will draw it a different way
        // using built in canvas function
        switch (shape.type) {
            case 'rectangle':
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                break;
            case 'triangle':
                ctx.moveTo(shape.x, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height / 2);
                break;
            case 'diamond':
                ctx.moveTo(shape.x, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y);
                ctx.lineTo(shape.x, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y);
                break;
            case 'square':
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                break;
            case "line":
                const headlen = 10;
                const startX = shape.x;
                const endX = shape.x + shape.width; // Use shape.width for the length of the arrow
                const y = shape.y; // Assuming this is the central y-coordinate of the arrow
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(endX, y);
                ctx.lineTo(
                    endX - headlen * Math.cos(0 - Math.PI / 7),
                    y - headlen * Math.sin(0 - Math.PI / 7)
                );
                ctx.lineTo(
                    endX - headlen * Math.cos(0 + Math.PI / 7),
                    y - headlen * Math.sin(0 + Math.PI / 7)
                );
                ctx.lineTo(endX, y);
                break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // set the inner rectangle placement for each shape to house text box
        if (shape.innerRect) {
            var center = getCenter(shape);
            var innerX = shape.x;
            var innerY = shape.y;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0)'; // makes inner text box transparent
            ctx.strokeRect(innerX, innerY, shape.innerRect.width, shape.innerRect.height);
        
            if (shape.innerRect.text) {
                ctx.font = '12px Arial';
                ctx.fillStyle = 'black';
                // Center text horizontally and vertically
                var textWidth = ctx.measureText(shape.innerRect.text).width;
                var textX = center.x - textWidth / 2;
                var textY = center.y + 6; 
                ctx.fillText(shape.innerRect.text, textX, textY);
            }
        }
    }


    // gets the center for each shape type to use for
    // placing the inner rectangle that will house
    // text placement for our shapes
    function getCenter(shape) {
        let center = { x: 0, y: 0 };
    
        switch (shape.type) {
            case 'circle':
                center.x = shape.x;
                center.y = shape.y;
                break;
            case 'rectangle':
            case 'square':
                center.x = shape.x + shape.width / 2;
                center.y = shape.y + shape.height / 2;
                break;
            case 'triangle':
                center.x = (shape.x1 + shape.x2 + shape.x3) / 3;
                center.y = (shape.y1 + shape.y2 + shape.y3) / 3;
                break;
            case 'diamond':
                center.x = shape.x + shape.width / 2;
                center.y = shape.y + shape.height / 2;
                break;
        }
    
        return center;
    }
    






    // Function to draw shapes and redraw all shapes when user moves them around
    function drawShapes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        shapes.forEach(drawShape); // Redraw each shape
    }
    
    // Function to check if a point is inside a rectangle
    function isInsideRect(shape, x, y) {
        return x >= shape.x && x <= shape.x + shape.width &&
               y >= shape.y && y <= shape.y + shape.height;
    }

    // Function to check if a point is inside a circle
    function isInsideCircle(shape, x, y) {
        var dx = x - shape.x;
        var dy = y - shape.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
    }

    function isInsideDiamond(shape, x, y) {
        // Calculate the coordinates of the diamond's top, bottom, left, and right points
        var topX = shape.x;
        var topY = shape.y - shape.height / 2;
        var bottomY = shape.y + shape.height / 2;
        var leftX = shape.x - shape.width / 2;
        var rightX = shape.x + shape.width / 2;

    

        // Check if the point is inside the diamond by comparing the slopes
        if (
            (x >= leftX && x <= topX && y >= topY && y <= bottomY) ||
            (x >= topX && x <= rightX && y >= topY && y <= bottomY) ||
            (x >= leftX && x <= rightX && y >= topY && y <= topY + shape.height) ||
            (x >= leftX && x <= rightX && y >= bottomY - shape.height && y <= bottomY)
        ) {
            return true;
        }
    

    
        return false;
    }
    
    
    function isInsideTriangle(shape, x, y) {
        // Calculate the coordinates of the triangle's vertices
        var x1 = shape.x;
        var y1 = shape.y - shape.height / 2;
        var x2 = shape.x + shape.width / 2;
        var y2 = shape.y + shape.height / 2;
        var x3 = shape.x - shape.width / 2;
        var y3 = shape.y + shape.height / 2;
        
        // Calculate the areas of the three triangles formed by the point (x, y) and the vertices
        var area1 = Math.abs((x1*(y2-y) + x2*(y-y1) + x*(y1-y2)) / 2);
        var area2 = Math.abs((x2*(y3-y) + x3*(y-y2) + x*(y2-y3)) / 2);
        var area3 = Math.abs((x1*(y3-y) + x3*(y-y1) + x*(y1-y3)) / 2);
        
        // Calculate the total area of the triangle
        var totalArea = Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
        
        // Check if the point is inside the triangle using the areas
        return Math.abs(totalArea - (area1 + area2 + area3)) < 1;
    }
    
    function isOnArrow(arrow, x, y) {
        // Inner function to check if a point is on a line segment
        const isOnLine = (x, y, x1, y1, x2, y2, lineWidth) => {
          const A = x - x1;
          const B = y - y1;
          const C = x2 - x1;
          const D = y2 - y1;
    
          const dot = A * C + B * D;
          const len_sq = C * C + D * D;
          const param = len_sq !== 0 ? dot / len_sq : -1;
    
          let xx, yy;
    
          if (param < 0) {
            xx = x1;
            yy = y1;
          } else if (param > 1) {
            xx = x2;
            yy = y2;
          } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
          }
    
          const dx = x - xx;
          const dy = y - yy;
          return dx * dx + dy * dy <= lineWidth * lineWidth;
        };
    
        const startX = arrow.x;
        const endX = arrow.x + arrow.width; // End point based on the width
        const yCoord = arrow.y;
    
        return isOnLine(x, y, startX, yCoord, endX, yCoord, arrow.lineWidth || 2);
      }

    // event listener for mouse clicks in center rect for text
    canvas.addEventListener('mousedown', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;
        var clickedInnerRect = false;

        shapes.forEach(function (shape) {
            if (shape.innerRect) {
                var innerX = shape.x + shape.width / 2 - shape.innerRect.width / 2;
                var innerY = shape.y + shape.height / 2 - shape.innerRect.height / 2;

                if (mouseX >= innerX && mouseX <= innerX + shape.innerRect.width &&
                    mouseY >= innerY && mouseY <= innerY + shape.innerRect.height) {
                    var text = prompt("Enter text here:");
                    if (text) {
                        shape.innerRect.text = text;
                        drawShapes();
                    }
                    clickedInnerRect = true;
                }
            }
        });

        // if not clicking in inner rectangle used for text
        // it will check if the users cursor is inside the shape
        // by comparing x y coordinates
        // then if it is it will make the shape draggable
        if (!clickedInnerRect) {
            shapes.forEach(function (shape) {
                if (shape.type === "line") {
                    if (isOnArrow(shape, mouseX, mouseY)) {
                      isDragging = true;
                      currentShape = shape;
                      dragOffsetX = mouseX - shape.x;
                      dragOffsetY = mouseY - shape.y;
                    }
                }else if (shape.type === 'circle') { // for circles
                    if (isInsideCircle(shape, mouseX, mouseY)) {
                        isDragging = true;
                        currentShape = shape;
                        dragOffsetX = mouseX - shape.x;
                        dragOffsetY = mouseY - shape.y;
                    }
                }else if(shape.type === 'triangle'){
                    if (isInsideTriangle(shape, mouseX, mouseY)) {
                        isDragging = true;
                        currentShape = shape;
                        dragOffsetX = mouseX - shape.x;
                        dragOffsetY = mouseY - shape.y;
                    }
                }else if(shape.type === 'diamond'){
                    if (isInsideDiamond(shape, mouseX, mouseY)) {
                        isDragging = true;
                        currentShape = shape;
                        dragOffsetX = mouseX - shape.x;
                        dragOffsetY = mouseY - shape.y;
                    }
                } else { // for rectangles and squares
                    if (isInsideRect(shape, mouseX, mouseY)) {
                        isDragging = true;
                        currentShape = shape;
                        dragOffsetX = mouseX - shape.x;
                        dragOffsetY = mouseY - shape.y;
                    }
                }
            });
        }
    });

    // event listener for moving the shapes
    // checks if a user is moving the mouse
    // if yes checks if isDragging is true to verify
    // the user is also holding the shape so it knows when to
    // drag or when not to
    canvas.addEventListener('mousemove', function (e) {
        if (isDragging) {
            var mouseX = e.clientX - canvas.getBoundingClientRect().left;
            var mouseY = e.clientY - canvas.getBoundingClientRect().top;
            currentShape.x = mouseX - dragOffsetX;
            currentShape.y = mouseY - dragOffsetY;
            drawShapes();
        }
    });

    // checks for non clicking and makes shapes non draggable
    // if the user is not clicking anything
    canvas.addEventListener('mouseup', function (e) {
        isDragging = false;
    });

    // Event listeners for buttons to create the different shapes
    document.getElementById('rectangle').addEventListener('click', function () {
        shapes.push({
            type: 'rectangle', x: 500, y: 500, width: 120, height: 80, 
            innerRect: { width: 30, height: 20, text: '' }
        });
        drawShapes();
    });

    document.getElementById('square').addEventListener('click', function () {
        shapes.push({
            type: 'square', x: 500, y: 500, width: 50, height: 50, 
            innerRect: { width: 30, height: 20, text: '' }
        });
        drawShapes();
    });

    document.getElementById('circle').addEventListener('click', function () {
        shapes.push({
            type: 'circle', x: 500, y: 500, radius: 50, 
            innerRect: { width: 30, height: 20, text: '' }
        });
        drawShapes();
    });

    document.getElementById('triangle').addEventListener('click', function () {
        shapes.push({
            type: 'triangle', x: 500, y: 500, width: 100, height: 100, 
            innerRect: { width: 30, height: 20, text: '' }
        });
        drawShapes();
    });

    document.getElementById('diamond').addEventListener('click', function () {
        shapes.push({
            type: 'diamond', x: 500, y: 500, width: 100, height: 100, 
            innerRect: { width: 30, height: 20, text: '' }
        });
        drawShapes();
    });

    document.getElementById("line").addEventListener("click", function () {
        shapes.push({ type: "line", x: 500, y: 500, width: 100, height: 100 });
        drawShapes();
      });
});
