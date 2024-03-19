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
    const container = document.querySelector('.image-canvas');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const padding = { top: 100, bottom: 100, left: 50, right: 50 };

    const maxWidth = containerWidth - padding.left - padding.right;
    const maxHeight = containerHeight - padding.top - padding.bottom;

    const scaleX = maxWidth / img.width;
    const scaleY = maxHeight / img.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    const canvas = document.createElement('canvas');
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    canvas.classList.add('main-canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    const thumbnailCanvas = document.getElementById('thumbnailCanvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    thumbnailCanvas.width = img.width / 5;
    thumbnailCanvas.height = img.height / 5;
    thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

    const scaleSelect = document.getElementById('scaleSelect');
    scaleSelect.value = scale.toString();

    const canvasSize = `${canvas.width}x${canvas.height}`;
    document.querySelector('.img-size').textContent = `Размеры: ${canvasSize}`;

    scaleSelect.addEventListener('change', function() {
        const selectedScale = parseFloat(scaleSelect.value);
        renderCanvasWithScale(img, selectedScale);
    });

    showCoordinatesInSidebar();
    showColorInSidebar();

    const previousOption = scaleSelect.querySelector('.custom');
    if (previousOption) {
        previousOption.remove();
    }

    // Создаем новый option для текущей картинки
    const initialScale = calculateInitialScale(img);
    const newOption = document.createElement('option');
    newOption.classList.add('custom')
    newOption.value = initialScale.toString();
    newOption.textContent = Math.round(initialScale * 100) + '%';
    newOption.selected = true;

    // Добавляем новый option в селект
    scaleSelect.appendChild(newOption);
}

function calculateInitialScale(img) {
    const container = document.querySelector('.image-canvas');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const padding = { top: 100, bottom: 100, left: 50, right: 50 };

    const maxWidth = containerWidth - padding.left - padding.right;
    const maxHeight = containerHeight - padding.top - padding.bottom;

    const scaleX = maxWidth / img.width;
    const scaleY = maxHeight / img.height;
    return Math.min(scaleX, scaleY);
}

function renderCanvasWithScale(img, scale) {
    const container = document.querySelector('.image-canvas');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    const canvas = document.createElement('canvas');
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    canvas.classList.add('main-canvas');
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

    showCoordinatesInSidebar();
    showColorInSidebar();
}

function showCoordinatesInSidebar() {
    const canvas = document.querySelector('.main-canvas');
    const sidebar = document.querySelector('.img-coordinates');

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        
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
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        const color = getColorAtPixel(canvas, x, y);
        
        const rectangleCanvas = createColorRectangle(color);
        const colorCode = createColorCodeElement(color);

        sidebar.innerHTML = '';
        sidebar.appendChild(rectangleCanvas);
        sidebar.appendChild(colorCode);
    });
}

function createColorRectangle(color) {
    const rectangleCanvas = document.createElement('canvas');
    rectangleCanvas.width = 20;
    rectangleCanvas.height = 20;
    rectangleCanvas.classList.add('color-mini')
    const rectCtx = rectangleCanvas.getContext('2d');
    rectCtx.fillStyle = color;
    rectCtx.fillRect(0, 0, 20, 20);
    return rectangleCanvas;
}

function createColorCodeElement(color) {
    const colorCode = document.createElement('div');
    colorCode.textContent = color;
    return colorCode;
}