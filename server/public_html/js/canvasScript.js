/*
    BUGS/NEEDS WORK:



    diamond borders are too big for grabbing

    shape resizing

    text rectangle more centered




    
*/

const SNAP_THRESHOLD = 10;



// set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// draws white background
function drawBackground(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// wait for dom content to load
document.addEventListener('DOMContentLoaded', function () {
    // set up our canvas
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let shapes = []; // store current shapes
    let deletedShapes = [];
    let isDragging = false;
    let dragOffsetX, dragOffsetY, currentShape;
    let currentColor = document.getElementById('shapecolor').value; 
    const defaultColor = "#FFFFFF";

    // Add an event listener for window resize
    window.addEventListener('resize', function() {
        let oldWidth = canvas.width;
        let oldHeight = canvas.height;
        // update canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // update shape positions
        shapes.forEach(shape => {
            let scaleX = canvas.width / oldWidth;
            let scaleY = canvas.height / oldHeight;
    
            if(shape.type === 'line'){
                // Scale the start, middle, and end points of the line
                shape.start.x *= scaleX;
                shape.start.y *= scaleY;
                shape.middle.x *= scaleX;
                shape.middle.y *= scaleY;
                shape.end.x *= scaleX;
                shape.end.y *= scaleY;
            } else {
                // Scale the position of other shapes using default x y
                shape.x *= scaleX;
                shape.y *= scaleY;
            }   
            updateAnchorPoints(shapes); 
        });

        // Redraw the shapes
        drawShapes();
    });

    // allows user to download their diagram
    document.getElementById('download').addEventListener('click', function(e) {
        // convert canvas to data url
        let canvasUrl = canvas.toDataURL("image/jpeg", 1);
        const imgElement = document.createElement('a');
        imgElement.href = canvasUrl;
    
        // name download
        imgElement.download = "diagram";
    
        // click download button to download, dont want to download it twice
        imgElement.click();
        imgElement.remove();
    });

    // Function to draw a specific shape
    function drawShape(shape) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;


        // depending on shape we will draw it a different way
        switch (shape.type) {
            case 'rectangle':
                ctx.fillStyle = shape.color;
                ctx.beginPath();
                ctx.moveTo(shape.x - shape.width / 2, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'circle':
                ctx.fillStyle = shape.color;
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'triangle':
                ctx.fillStyle = shape.color;
                ctx.beginPath();
                ctx.moveTo(shape.x, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'diamond':
                ctx.fillStyle = shape.color;
                ctx.beginPath();
                ctx.moveTo(shape.x, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y);
                ctx.lineTo(shape.x, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'line':
                ctx.fillStyle = defaultColor;
                ctx.beginPath();
                ctx.moveTo(shape.start.x, shape.start.y);
                ctx.lineTo(shape.middle.x, shape.middle.y)
                ctx.lineTo(shape.end.x, shape.end.y);
                // Calculate the angle of the line for arrow point creation
                const angle = Math.atan2(shape.end.y - shape.middle.y, shape.end.x - shape.middle.x);

                // Length and width of the arrow head
                const arrowLength = 10; // Length of the arrow head lines
                const arrowWidth = Math.PI / 8; // Width of the arrow head (in radians)
            
                // Draw one side of the arrow head
                ctx.lineTo(shape.end.x - arrowLength * Math.cos(angle - arrowWidth), 
                        shape.end.y - arrowLength * Math.sin(angle - arrowWidth));
            
                // Move back to the tip of the arrow
                ctx.moveTo(shape.end.x, shape.end.y);
            
                // Draw the other side of the arrow head
                ctx.lineTo(shape.end.x - arrowLength * Math.cos(angle + arrowWidth), 
                        shape.end.y - arrowLength * Math.sin(angle + arrowWidth));
            
                ctx.closePath();
                ctx.stroke();
                break;
        }


        // to draw anchor points
        if(shape.anchorPoints) {
            shape.anchorPoints.forEach(point => {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Draw small circle for anchor point
                ctx.stroke();
            });
        }


        // set the inner rectangle placement for each shape to house text box
        if (shape.innerRect) {
            let innerX = shape.x-14;
            let innerY = shape.y-9;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0)'; // makes inner text box transparent
            ctx.strokeRect(innerX, innerY, shape.innerRect.width, shape.innerRect.height);
        
            if (shape.innerRect.text) {
                ctx.font = '12px Arial';
                ctx.fillStyle = 'black';
                // Center text horizontally and vertically
                let textWidth = ctx.measureText(shape.innerRect.text).width;
                let textX = shape.x - textWidth / 2;
                let textY = shape.y + 6; 
                ctx.fillText(shape.innerRect.text, textX, textY);
            }
        }
    }

    // Function to draw shapes and redraw all shapes when user moves them around
    function drawShapes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawBackground(ctx);
        shapes.forEach(drawShape); // Redraw each shape
    }

    // Function to check if a point is inside a rectangle
    function isInsideRect(shape, x, y) {
        let rightX = shape.x + shape.width/2;
        let leftX = shape.x - shape.width/2;
        let topY = shape.y - shape.height/2;
        let bottomY = shape.y + shape.height/2;

        return x >= leftX && x <= rightX &&
               y >= topY && y <= bottomY;
    }

    // Function to check if a point is inside a circle
    function isInsideCircle(shape, x, y) {
        let dx = x - shape.x;
        let dy = y - shape.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
    }

    function isInsideDiamond(shape, x, y) {
        // Calculate the coordinates of the diamond's top, bottom, left, and right points
        let topX = shape.x;
        let topY = shape.y - shape.height / 2;
        let bottomY = shape.y + shape.height / 2;
        let leftX = shape.x - shape.width / 2;
        let rightX = shape.x + shape.width / 2;
    
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
        let x1 = shape.x;
        let y1 = shape.y - shape.height / 2;
        let x2 = shape.x + shape.width / 2;
        let y2 = shape.y + shape.height / 2;
        let x3 = shape.x - shape.width / 2;
        let y3 = shape.y + shape.height / 2;
        
        // Calculate the areas of the three triangles formed by the point (x, y) and the vertices
        let area1 = Math.abs((x1*(y2-y) + x2*(y-y1) + x*(y1-y2)) / 2);
        let area2 = Math.abs((x2*(y3-y) + x3*(y-y2) + x*(y2-y3)) / 2);
        let area3 = Math.abs((x1*(y3-y) + x3*(y-y1) + x*(y1-y3)) / 2);
        
        // Calculate the total area of the triangle
        let totalArea = Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
        
        // Check if the point is inside the triangle using the areas
        return Math.abs(totalArea - (area1 + area2 + area3)) < 1;
    }

    function isOnArrow(arrow, mouseX, mouseY) {
        // Define grab margin
        const margin = 5;
    
        // Function to check proximity to a line segment
        function isNearSegment(x1, y1, x2, y2) {
            // Calculate the distance from the point to the line segment
            const A = mouseX - x1;
            const B = mouseY - y1;
            const C = x2 - x1;
            const D = y2 - y1;
    
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;
    
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
    
            const dx = mouseX - xx;
            const dy = mouseY - yy;
    
            // Check if the distance is within the margin
            return (dx * dx + dy * dy) <= margin * margin;
        }
    
        // Check both segments of the arrow
        return isNearSegment(arrow.start.x, arrow.start.y, arrow.middle.x, arrow.middle.y) ||
               isNearSegment(arrow.middle.x, arrow.middle.y, arrow.end.x, arrow.end.y);
    }

    // event listener for mouse clicks on shapes, also determines the location of the click
    canvas.addEventListener('mousedown', function (e) {
        let mouseX = e.clientX - canvas.getBoundingClientRect().left;
        let mouseY = e.clientY - canvas.getBoundingClientRect().top;
        let clickedInnerRect = false;

        // check for click on a text box
        // iterate through shapes to find individual inner rectangle
        // to avoid double clicking overlayed shapes
        for (let i = shapes.length - 1; i >= 0; i--) {
            let shape = shapes[i];
            if (shape.innerRect) {
                let innerX = shape.x;
                let innerY = shape.y;
    
                if (mouseX >= innerX && mouseX <= innerX + shape.innerRect.width &&
                    mouseY >= innerY && mouseY <= innerY + shape.innerRect.height) {
                    let text = prompt("Enter text here:");
                    if (text) {
                        shape.innerRect.text = text;
                        drawShapes();
                    }
                    clickedInnerRect = true;
                    break; // Break the loop once the topmost shape is found and handled
                }
            }
        }

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
                } else if(shape.type === 'rectangle'){ // for rectangles 
                    if (isInsideRect(shape, mouseX, mouseY)) {
                        console.log("shape type identified at else staement for is inside rect");
                        isDragging = true;
                        currentShape = shape;
                        dragOffsetX = mouseX - shape.x;
                        dragOffsetY = mouseY - shape.y;
                    }
                }
            });
        }
    });    

    // update anchor function
    function updateAnchorPoints(shapes){
        // makes anchor points follow shape as its dragged
        shapes.forEach(function (shape) {
            if (shape.type === 'rectangle') {
                console.log("shape type identified at anchor point");
                shape.anchorPoints = [
                    { x: shape.x - shape.width / 2, y: shape.y }, // Left middle
                    { x: shape.x + shape.width / 2, y: shape.y }, // Right middle
                    { x: shape.x, y: shape.y - shape.height / 2 }, // Top middle
                    { x: shape.x, y: shape.y + shape.height / 2 }  // Bottom middle
                ];
            }else if (shape.type === 'circle') {
                shape.anchorPoints = [
                    { x: shape.x, y: shape.y - shape.radius }, // Top
                    { x: shape.x + shape.radius, y: shape.y }, // Right
                    { x: shape.x, y: shape.y + shape.radius }, // Bottom
                    { x: shape.x - shape.radius, y: shape.y }  // Left
                ];
            } else if (shape.type === 'triangle') {
                shape.anchorPoints = [
                    { x: shape.x, y: shape.y - shape.height / 2 }, // Top vertex
                    { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 }, // Bottom right vertex
                    { x: shape.x - shape.width / 2, y: shape.y + shape.height / 2 },  // Bottom left vertex
                    { x: shape.x, y: shape.y + shape.height / 2 }// center point
                ];
            } else if (shape.type === 'diamond') {
                shape.anchorPoints = [
                    { x: shape.x, y: shape.y - shape.height / 2 }, // Top vertex
                    { x: shape.x + shape.width / 2, y: shape.y }, // Right vertex
                    { x: shape.x, y: shape.y + shape.height / 2 }, // Bottom vertex
                    { x: shape.x - shape.width / 2, y: shape.y }  // Left vertex
                ];
            } else if (shape.type === "line"){
                shape.anchorPoints = [
                    { x: shape.start.x, y: shape.start.y}, // Start point
                    { x: shape.end.x, y: shape.end.y},// End point
                    { x: shape.middle.x, y: shape.middle.y}, // middle 
                    //{ x: shape.x + 60, y: shape.y}, // middle right
                ];
            }
        });                  
    }
    // function to calculate distance, helper function
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // event listener to check for click on delete button, if yes will delete current shape
    document.getElementById('removeElement').addEventListener('click', function () {
        if (shapes.length > 0) {
            let removedShape = shapes.pop(); // Remove the last shape from the array
            deletedShapes.push(removedShape); // Save a copy to deletedShapes
            drawShapes(); // Redraw the canvas
        } else {
            alert("No shapes to delete!");
        }
    });

    // restores previously deleted shape
    document.getElementById('undo').addEventListener('click', function () {
        if (deletedShapes.length > 0) {
            let shapeToRestore = deletedShapes.pop(); // Get the last deleted shape
            shapes.push(shapeToRestore); // Restore it to the shapes array
            drawShapes(); // Redraw the canvas
        }
    });

    // event listener for moving the shapes
    // checks if a user is moving the mouse
    // if yes checks if isDragging is true to verify
    // the user is also holding the shape so it knows when to
    // drag or when not to
    canvas.addEventListener('mousemove', function (e) {

        if (isDragging) {
            let clickedShapeIndex = -1;
            shapes.forEach(function (shape, index) {
                if(currentShape === shape){
                    clickedShapeIndex = index;
                }
            });
            console.log("Clicked Shape Index: " + clickedShapeIndex);
            if(currentShape.type === "line"){

                let mouseX = e.clientX - canvas.getBoundingClientRect().left;
                let mouseY = e.clientY - canvas.getBoundingClientRect().top;
                

                // Calculate distances to start, middle, and end points
                let distanceToStart = distance(mouseX, mouseY, currentShape.start.x, currentShape.start.y);
                let distanceToMiddle = distance(mouseX, mouseY, currentShape.middle.x, currentShape.middle.y);
                let distanceToEnd = distance(mouseX, mouseY, currentShape.end.x, currentShape.end.y);

                // Find the minimum distance
                let minDistance = Math.min(distanceToStart, distanceToMiddle, distanceToEnd);

                // check which point to use cant figure it out

                const threshold = 20;
                let closestPoint;
                if (distanceToStart <= threshold && minDistance === distanceToStart) {
                    closestPoint = 'start';
                } else if (distanceToMiddle <= threshold && minDistance === distanceToMiddle) {
                    closestPoint = 'middle';
                } else if (distanceToEnd <= threshold && minDistance === distanceToEnd) {
                    closestPoint = 'end';
                } else {
                    closestPoint = 'none'; // No point is near the mouse pointer
                }
    


                if(closestPoint === 'start'){
                    currentShape.start.x = mouseX;
                    currentShape.start.y = mouseY;
                }else if(closestPoint === 'middle'){
                    currentShape.middle.x = mouseX;
                    currentShape.middle.y = mouseY;
                }else if(closestPoint === 'end'){
                    currentShape.end.x = mouseX;
                    currentShape.end.y = mouseY;
                }else if(closestPoint === 'none'){
                    // move entire arrow
                    
                    let deltaX = mouseX - dragOffsetX - currentShape.x;
                    let deltaY = mouseY - dragOffsetY - currentShape.y;
                        
                    currentShape.x = mouseX - dragOffsetX;
                    currentShape.y = mouseY - dragOffsetY;
                    currentShape.start.x += deltaX;
                    currentShape.start.y += deltaY;
                    currentShape.middle.x += deltaX;
                    currentShape.middle.y += deltaY;
                    currentShape.end.x += deltaX;
                    currentShape.end.y += deltaY;
                }

                if (clickedShapeIndex > -1) {
                    // Move the clicked shape to the back of the array
                    let clickedShape = shapes.splice(clickedShapeIndex, 1)[0];
                    shapes.push(clickedShape);
                }

                // update anchor points
                updateAnchorPoints(shapes);
        
                drawShapes();
            }else{ // shape dragging for all other shapes
                let mouseX = e.clientX - canvas.getBoundingClientRect().left;
                let mouseY = e.clientY - canvas.getBoundingClientRect().top;
        
                if (clickedShapeIndex > -1) {
                    console.log("Before Splice, Shapes Length: " + shapes.length);
                    // Move the clicked shape to the back of the array
                    let clickedShape = shapes.splice(clickedShapeIndex, 1)[0];
                    shapes.push(clickedShape);
                    console.log("After Splice, Shapes Length: " + shapes.length);
                }
                currentShape.x = mouseX - dragOffsetX;
                currentShape.y = mouseY - dragOffsetY;

                // update anchor points
                updateAnchorPoints(shapes);

                drawShapes();
                }
        } 
    });



    // event listener color input
    document.getElementById('shapecolor').addEventListener('input', function() {
        currentColor = this.value;
    });



    // checks for non clicking and makes shapes non draggable
    // if the user is not clicking anything
    canvas.addEventListener('mouseup', function (e) {
        isDragging = false;
    });

    // Event listeners for buttons to create the different shapes
    document.getElementById('rectangle').addEventListener('click', function () {
        shapes.push({
            type: 'rectangle', x: 500, y: 500, width: 120, height: 80, color: currentColor,
            innerRect: { width: 30, height: 20, text: '' },
            anchorPoints: [
                { x: 500, y: 460 }, // top center
                { x: 560, y: 500 }, // right middle
                { x: 500, y: 540 }, // bottom center
                { x: 440, y: 500 } // left middle
            ]
        });
        drawShapes();
    });

    document.getElementById('circle').addEventListener('click', function () {
        shapes.push({
            type: 'circle', x: 500, y: 500, radius: 50, color: currentColor,
            innerRect: { width: 30, height: 20, text: '' },
            anchorPoints: [
                { x: 500, y: 450 }, // top center
                { x: 550, y: 500 }, // right middle
                { x: 500, y: 550 }, // bottom center
                { x: 450, y: 500 } // left middle
            ]
        });
        drawShapes();
    });

    document.getElementById('triangle').addEventListener('click', function () {
        shapes.push({
            type: 'triangle', x: 500, y: 500, width: 98, height: 85, color: currentColor,
            innerRect: { width: 30, height: 20, text: '' },
            anchorPoints: [
                { x: 500, y: 460 }, // top center
                { x: 545, y: 540 }, // right bottom
                { x: 455, y: 540 }, // left bottom
                { x: 500, y: 543 }, // bottom middle
            ]
        });
        drawShapes();
    });

    document.getElementById('diamond').addEventListener('click', function () {
        shapes.push({
            type: 'diamond', x: 500, y: 500, width: 100, height: 100, color: currentColor,
            innerRect: { width: 30, height: 20, text: '' },
            anchorPoints: [
                { x: 500, y: 450 }, // top center
                { x: 550, y: 500 }, // right middle
                { x: 500, y: 550 }, // bottom center
                { x: 450, y: 500 } // left middle
            ]
        });
        drawShapes();
    });

    document.getElementById("line").addEventListener("click", function () {
        shapes.push({ type: "line", x: 500, y: 500, width: 100, height: 100, 
        start: { x: 500, y: 500},// keep track of start middle and end of arrow
        middle: { x: 550, y: 500},
        end: { x: 600, y: 500},
        anchorPoints: [
            { x: 500, y: 500, type: 'start' }, // Label for start
            { x: 550, y: 500, type: 'middle' }, // Label for middle
            { x: 600, y: 500, type: 'end' } // Label for end
        ]
        });
        drawShapes();
      });

    // function to stringify shapes, to store in user
    // function getCanvasJson(shapes) {
    //     return JSON.stringify(shapes);
    // }

    // loads json canvas data and draws it to current window
    // document.getElementById('load').addEventListener('click', function() {

    //     const jsonString = getCanvasJson(shapes);
    //     // tester json
    //     //const jsonString = '[{"type":"circle","x":557,"y":369,"radius":50,"innerRect":{"width":30,"height":20,"text":"asdfasdfasdfasdf"},"anchorPoints":[{"x":557,"y":319},{"x":607,"y":369},{"x":557,"y":419},{"x":507,"y":369}]},{"type":"rectangle","x":404,"y":207,"width":120,"height":80,"innerRect":{"width":30,"height":20,"text":"asdfasdfasdfasdfasdf"},"anchorPoints":[{"x":344,"y":207},{"x":464,"y":207},{"x":404,"y":167},{"x":404,"y":247}]},{"type":"triangle","x":800,"y":257,"width":98,"height":85,"innerRect":{"width":30,"height":20,"text":"MANUALLY ENETERED JSON DATA"},"anchorPoints":[{"x":800,"y":214.5},{"x":849,"y":299.5},{"x":751,"y":299.5},{"x":800,"y":299.5}]},{"type":"diamond","x":743,"y":180,"width":100,"height":100,"innerRect":{"width":30,"height":20,"text":"THIS PICTURE WAS CREATED AFTER LOADING FOR"},"anchorPoints":[{"x":743,"y":130},{"x":793,"y":180},{"x":743,"y":230},{"x":693,"y":180}]},{"type":"line","x":500,"y":500,"width":100,"height":100,"start":{"x":1052,"y":506},"middle":{"x":644,"y":89},"end":{"x":1138,"y":102},"anchorPoints":[{"x":1052,"y":506},{"x":1138,"y":102},{"x":644,"y":89}]},{"type":"line","x":500,"y":500,"width":100,"height":100,"start":{"x":500,"y":500},"middle":{"x":392,"y":64},"end":{"x":600,"y":500},"anchorPoints":[{"x":500,"y":500},{"x":600,"y":500},{"x":392,"y":64}]}]';
    //     console.log(jsonString);
    //     const shapesData = JSON.parse(jsonString);

    //     // Clear existing shapes on canvas if needed
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     shapes = [];
    //     // clearCanvas();
    //     drawBackground(ctx);
    //     // Iterate over each shape data and draw it on the canvas
    //     shapesData.forEach(shapeData => {
    //         shapes.push(shapeData);
    //         drawShape(shapeData);
    //     });
    // });

    // Function to load canvas based on projectId
    function loadCanvasFromProjectId() {
    // Get the projectId from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');

        fetch(`/canvas?projectId=${projectId}`)
            .then(response => response.json())
            .then(data => {
                const shapesData = data.shapesData;             
                // Clear existing shapes on canvas if needed
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                shapes = [];
                drawBackground(ctx);

                // Iterate over each shape data and draw it on the canvas
                shapesData.forEach(shapeData => {
                    shapes.push(shapeData);
                    drawShape(shapeData);
                });
            })
            .catch(error => {
                console.error('Error fetching shapes data:', error);
            });
}
    // When the canvas page loads, call the function to load canvas based
    // on the projectId from the URL
    loadCanvasFromProjectId();

    // Function to save canvas data
    function saveCanvasData() {
        // Gather canvas data to be saved
        const canvas = document.getElementById('canvas');
        const imageData = canvas.toDataURL(); 
        // Get canvas image data (base64 encoded)

        // Make request to save canvas data to server
        fetch('/save-canvas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData })
        })
        .then(response => {
            // Handle the response after saving
            if (response.ok) {
                console.log('Canvas data saved successfully.');
            } else {
                console.error('Failed to save canvas data.');
            }
        })
        .catch(error => {
            console.error('Error while saving canvas data:', error);
        });
    }

    document.getElementById('saveDocument').addEventListener('click', () => {
        saveCanvasData();
    });
});
//section below is for the dropdown menu for the canvas page
document.addEventListener("DOMContentLoaded", function () {
    const dropdowns = document.querySelectorAll('.dropdown');
    let activeIcon = null;
  
    function toggleDropdown(dropdown) {
      const dropdownContent = dropdown.querySelector('.dropdown-content');
      if (dropdownContent) {
        dropdownContent.classList.toggle('show');
        //console.log('Dropdown content toggled');
      }
    }
  
    function resetIcon(icon) {
      icon.style.transition = 'transform 0.5s ease-in-out';
      icon.style.transform = 'rotate(0) scale(1)';
    }
  
    function animateIcon(icon, transformValue) {
      icon.style.transition = 'transform 0.5s ease-in-out';
      icon.style.transform = icon.style.transform === transformValue ? 'rotate(0) scale(1)' : transformValue;
    }
  
    function handleGlobalClick(event) {
      dropdowns.forEach(function (dropdown) {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const icon = dropdown.querySelector('.dropdown i');
  
        // Check if the clicked target is outside the entire dropdown
        if (!dropdown.contains(event.target)) {
          // Close dropdown and reset icon animations
          if (dropdownContent && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
           // console.log('Dropdown content hidden');
          }
  
          if (icon) {
           // console.log('Resetting icon:', icon.className);
            resetIcon(icon);
          }
        }
      });
    }
  
    window.addEventListener('click', handleGlobalClick);
  
    dropdowns.forEach(function (dropdown) {
      dropdown.addEventListener('click', function (event) {
        event.stopPropagation();
        //console.log('Dropdown clicked');
  
        // Reset previous active icon and close its dropdown
        if (activeIcon && activeIcon !== dropdown.querySelector('.dropdown i')) {
          //console.log('Resetting active icon');
          resetIcon(activeIcon);
  
          const prevDropdown = activeIcon.parentElement.parentElement;
          if (prevDropdown) {
            prevDropdown.querySelector('.dropdown-content').classList.remove('show');
            //console.log('Previous dropdown content hidden');
          }
        }
  
        toggleDropdown(this);
  
        const icon = this.querySelector('.dropdown i');
        if (icon) {
          //console.log('Icon clicked:', icon.className);
          // Reset animations for clicked icon
          if (icon.classList.contains('fa-cog')) {
            animateIcon(icon, 'rotate(135deg)');
          } else if (icon.classList.contains('fa-home')) {
            animateIcon(icon, 'scale(1.5)');
          }
  
          // Set the clicked icon as the active icon
          activeIcon = icon;
        }
      });
    });
  });
//this code section is for the left navbar resizing by user 
var resizer = document.querySelector(".resizer"),
  sidebar = document.querySelector(".left-navbar-container"),
  projectCardContainer = document.querySelector(".project-card-container");

function initResizerFn(resizer, sidebar, projectCardContainer) {

  var x, w;

  function rs_mousedownHandler(e) {

    x = e.clientX;

    var sbWidth = window.getComputedStyle(sidebar).width;
    w = parseInt(sbWidth, 10);

    document.addEventListener("mousemove", rs_mousemoveHandler);
    document.addEventListener("mouseup", rs_mouseupHandler);
  }

  function rs_mousemoveHandler(e) {
    var dx = e.clientX - x;

    var cw = w + dx; // complete width

    if (cw <= 450 && cw >= 250) {
      sidebar.style.width = `${cw}px`;
      projectCardContainer.style.left = `${cw + 30}px`; // Add the width of the .left-navbar-container and any additional spacing
    }
  }

  function rs_mouseupHandler() {
    document.removeEventListener("mouseup", rs_mouseupHandler);
    document.removeEventListener("mousemove", rs_mousemoveHandler);
  }

  resizer.addEventListener("mousedown", rs_mousedownHandler);
}

initResizerFn(resizer, sidebar, projectCardContainer);
/* Optional: Add active class to the current button (highlight it) */

//end of left navbar resizing code section  