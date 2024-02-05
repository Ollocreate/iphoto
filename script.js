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
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, img.width, img.height);
            ctx.drawImage(img, 0, 0);

            const container = document.querySelector('.d-grid.justify-content-center');
            container.innerHTML = '';
            container.appendChild(canvas);

            const thumbnailCanvas = document.getElementById('thumbnailCanvas');
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            thumbnailCanvas.width = img.width / 5;
            thumbnailCanvas.height = img.height / 5;
            thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
            thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

            $('#importModal').modal('hide');
        };
    } catch (error) {
        console.error(error);
    }
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
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, img.width, img.height);
                    ctx.drawImage(img, 0, 0);
        
                    const container = document.querySelector('.d-grid.justify-content-center');
                    container.innerHTML = '';
                    container.appendChild(canvas);

                    const thumbnailCanvas = document.getElementById('thumbnailCanvas');
                    const thumbnailCtx = thumbnailCanvas.getContext('2d');
                
                    thumbnailCanvas.width = img.width / 5;
                    thumbnailCanvas.height = img.height / 5;
                
                    thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
                    thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

                    $('#importModal').modal('hide');
                };
            };
            reader.readAsDataURL(file);
        }
    }

    document.getElementById('importForm').reset();
})
