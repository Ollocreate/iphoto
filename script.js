async function loadImageFromURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ошибка загрузки изображения');
        }

        const blob = await response.blob();
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = function() {
            renderCanvas(img);
            $('#importModal').modal('hide');
            showCoordinatesInSidebar();
            showColorInSidebar();
        };
    } catch (error) {
        console.error(error);
    }
}

function renderCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.classList.add('main-canvas');

    const container = document.querySelector('.image-canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    const thumbnailCanvas = document.getElementById('thumbnailCanvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    thumbnailCanvas.width = img.width / 5;
    thumbnailCanvas.height = img.height / 5;
    thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

    const canvasSize = `${canvas.width}x${canvas.height}`;
    document.querySelector('.img-size').textContent = `Размеры: ${canvasSize}`;
}

document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const url = document.getElementById('urlInput').value.trim();
    if (url) {
        loadImageFromURL(url);
    } else {
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    renderCanvas(img);
                    $('#importModal').modal('hide');
                    showCoordinatesInSidebar();
                    showColorInSidebar();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    document.getElementById('importForm').reset();
});

function showCoordinatesInSidebar() {
    const canvas = document.querySelector('.main-canvas');
    const sidebar = document.querySelector('.img-coordinates');

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(event.clientX - rect.left);
        const y = Math.floor(event.clientY - rect.top);
        
        sidebar.innerHTML = `X: ${x}, Y: ${y}`;
    });
}

function getColorAtPixel(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
}

function showColorInSidebar() {
    const canvas = document.querySelector('.main-canvas');
    const sidebar = document.querySelector('.img-color');

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(event.clientX - rect.left);
        const y = Math.floor(event.clientY - rect.top);
        const color = getColorAtPixel(canvas, x, y);
        
        const rectangleCanvas = createColorRectangle(color);
        const colorCode = createColorCodeElement(color);

        sidebar.innerHTML = '';
        sidebar.appendChild(colorCode);
        sidebar.appendChild(rectangleCanvas);
    });
}

function createColorRectangle(color) {
    const rectangleCanvas = document.createElement('canvas');
    rectangleCanvas.width = 100;
    rectangleCanvas.height = 50;
    const rectCtx = rectangleCanvas.getContext('2d');
    rectCtx.fillStyle = color;
    rectCtx.fillRect(0, 0, 100, 50);
    return rectangleCanvas;
}

function createColorCodeElement(color) {
    const colorCode = document.createElement('div');
    colorCode.textContent = color;
    return colorCode;
}