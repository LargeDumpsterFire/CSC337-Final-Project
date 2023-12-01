/*
    BUGS/NEEDS WORK:

    When you click on a text box and two shape's text boxes are
    over eachother it will click both


    ADDITIONS

    IMPORTANT: 
    Import to img (smaller images)
    Save to user/ mongo schema
    Arrows attach to shapes
    diamond borders are too big for grabbing

    MAJOR:
    Z index for shapes (slider)
    Resizing shapes (slider)
    Color changing RGB (slider)
    Remove shapes




    NOTES 11/30
    I have gotten the arrow to work again, but now it will change with direction. IE if you 
    make it face any direction it will draw correctly

    Next I need to make a function to check if its clicking on anchor points on the line
    and if so let the user drag from the anchor point only and dynamically update the section 
    point x y of the arrow at that anchor point
*/

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
    let isDragging = false;
    let dragOffsetX, dragOffsetY, currentShape;
    let selectedAnchorPoint = null;

    // Add an event listener for window resize
    window.addEventListener('resize', function() {
        let oldWidth = canvas.width;
        let oldHeight = canvas.height;
        // update canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // update shape positions
        shapes.forEach(shape => {
            shape.x = (shape.x / oldWidth) * canvas.width;
            shape.y = (shape.y / oldHeight) * canvas.height;
            
            updateAnchorPoints(shapes)
            
        });

        // Redraw the shapes
        drawShapes();
    });


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
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // depending on shape we will draw it a different way
        // using built in canvas function
        switch (shape.type) {
            case 'rectangle':
                ctx.moveTo(shape.x - shape.width / 2, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y - shape.height / 2);
                ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height / 2);
                ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height / 2);
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
            case "line":
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(shape.middle.x, shape.middle.y)
                ctx.lineTo(shape.end.x, shape.end.y);
                    // Calculate the angle of the line
                const angle = Math.atan2(shape.end.y - shape.y, shape.end.x - shape.x);

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

                break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // to draw anchor points
        if(shape.anchorPoints) {
            shape.anchorPoints.forEach(point => {
                ctx.beginPath();
                //ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Draw small circle for anchor point
                ctx.fill();
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
        const x1 = arrow.x;
        const y1 = arrow.y;
        const x2 = arrow.end.x;
        const y2 = arrow.end.y;
    
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
        
        // Define the 'nearness' margin
        const margin = 5; 
    
        // Check if the distance is within the margin
        return (dx * dx + dy * dy) <= margin * margin;
      }




    // event listener for mouse clicks in center rect for text
    canvas.addEventListener('mousedown', function (e) {
        let mouseX = e.clientX - canvas.getBoundingClientRect().left;
        let mouseY = e.clientY - canvas.getBoundingClientRect().top;
        let clickedInnerRect = false;

        shapes.forEach(function (shape) {
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
                } else { // for rectangles 
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


    // update anchor function
    function updateAnchorPoints(shapes){
        // makes anchor points follow shape as its dragged
        shapes.forEach(function (shape) {
            if (shape.type === 'rectangle') {
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
                    { x: shape.x, y: shape.y}, // Start point
                    { x: shape.end.x, y: shape.end.y},// End point
                    { x: shape.x + 30, y: shape.y}, // middle 
                    //{ x: shape.x + 60, y: shape.y}, // middle right
                ];
            
            }
        });
                        
    }


    // event listener for moving the shapes
    // checks if a user is moving the mouse
    // if yes checks if isDragging is true to verify
    // the user is also holding the shape so it knows when to
    // drag or when not to
    canvas.addEventListener('mousemove', function (e) {
        if (isDragging) {
            let mouseX = e.clientX - canvas.getBoundingClientRect().left;
            let mouseY = e.clientY - canvas.getBoundingClientRect().top;
            let deltaX = mouseX - dragOffsetX - currentShape.x;
            let deltaY = mouseY - dragOffsetY - currentShape.y;
            currentShape.x = mouseX - dragOffsetX;
            currentShape.y = mouseY - dragOffsetY;
    
            if (currentShape.type === "line") {
                // Update the end point of the line as well
                currentShape.end.x += deltaX;
                currentShape.end.y += deltaY;
                currentShape.middle.x += deltaX;
                currentShape.middle.y += deltaY;
            }

            // makes anchor points follow shape as its dragged
            shapes.forEach(function (shape) {
                if (shape.type === 'rectangle') {
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
                        { x: shape.x, y: shape.y}, // Start point
                        { x: shape.end.x, y: shape.end.y},// End point
                        { x: shape.middle.x, y: shape.middle.y}, // middle 
                    ];
                    
                }
                
            });
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
            type: 'circle', x: 500, y: 500, radius: 50, 
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
            type: 'triangle', x: 500, y: 500, width: 98, height: 85, 
            innerRect: { width: 30, height: 20, text: '' },
            anchorPoints: [
                { x: 500, y: 460 }, // top center
                { x: 545, y: 540 }, // right bottom
                { x: 455, y: 540 }, // left bottom
                { x: 500, y: 540 }, // bottom middle
            ]
        });
        drawShapes();
    });

    document.getElementById('diamond').addEventListener('click', function () {
        shapes.push({
            type: 'diamond', x: 500, y: 500, width: 100, height: 100, 
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
            { x: 500, y: 500}, // far left
            { x: 550, y: 500 }, // middle 
            //{ x: 560, y: 500 }, // middle right
            { x: 600, y: 500} // far right
        ]
        });
        drawShapes();
      });
});
