
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var shapes = [];
    var isDragging = false;
    var dragOffsetX, dragOffsetY, currentShape;

    // Function to draw a specific shape
    function drawShape(shape) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2; 
        ctx.beginPath();
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
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Function to redraw all shapes
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

    
    // event listener for holding a mouse click
    canvas.addEventListener('mousedown', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;
        shapes.forEach(function (shape) {
            if (shape.type === 'circle') {// for circles
                if (isInsideCircle(shape, mouseX, mouseY)) {
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
    });

    canvas.addEventListener('mousemove', function (e) {
        if (isDragging) {
            var mouseX = e.clientX - canvas.getBoundingClientRect().left;
            var mouseY = e.clientY - canvas.getBoundingClientRect().top;
            currentShape.x = mouseX - dragOffsetX;
            currentShape.y = mouseY - dragOffsetY;
            drawShapes();
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        isDragging = false;
    });

    // event listeners for buttons to create the different shapes
    document.getElementById('rectangle').addEventListener('click', function () {
        shapes.push({ type: 'rectangle', x: 500, y: 500, width: 120, height: 80});
        drawShapes();
    });

    document.getElementById('square').addEventListener('click', function () {
        shapes.push({ type: 'square', x: 500, y: 500, width: 50, height: 50});
        drawShapes();
    });

    document.getElementById('circle').addEventListener('click', function () {
        shapes.push({ type: 'circle', x: 500, y: 500, radius: 50});
        drawShapes();
    });

    document.getElementById('triangle').addEventListener('click', function () {
        shapes.push({ type: 'triangle', x: 500, y: 500, width: 100, height: 100});
        drawShapes();
    });

    document.getElementById('diamond').addEventListener('click', function () {
        shapes.push({ type: 'diamond', x: 500, y: 500, width: 100, height: 100});
        drawShapes();
    });


});
