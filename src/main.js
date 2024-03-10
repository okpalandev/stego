document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let imageData;

    const encodeButton = document.getElementById('encode');
    encodeButton.addEventListener('click', encodeImage);

    const decodeButton = document.getElementById('decode');
    decodeButton.addEventListener('click', decodeImage);

    const slider = document.getElementById('slider');
    slider.addEventListener('input', decodeImage);

    const hideButton = document.getElementById('hide');
    hideButton.addEventListener('click', function() {
        encodeImage(document.getElementById('messageInput').value);
    });

    const showButton = document.getElementById('show');
    showButton.addEventListener('click', showMessage);

    function showMessage() {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const binaryMessage = extractBinaryMessage(imageData);
        const message = binaryToString(binaryMessage);
        document.getElementById('message').innerText = message;
    }

    function extractBinaryMessage(imageData) {
        const data = imageData.data;
        const binaryMessage = [];
        for (let i = 0; i < data.length; i += 4) {
            binaryMessage.push(data[i] & 1);
        }
        return binaryMessage;
    }

    function binaryToString(binaryMessage) {
        let message = '';
        for (let i = 0; i < binaryMessage.length; i += 8) {
            message += String.fromCharCode(parseInt(binaryMessage.slice(i, i + 8).join(''), 2));
        }
        return message;
    }

    function encodeImage(message) {
        const imageInput = document.getElementById('imageInput');
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                hideMessage(message);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageInput.files[0]);
    }
    
    function hideMessage(message) {
        if (typeof message !== 'string') {
            message = message.toString();
        }

        if (message.length * 8 > imageData.data.length) {
            console.error("Message is too long to be hidden in the image.");
            return;
        }
        message = message.trim();

        const binaryMessage = stringToBinary(message);
        let dataIndex = 0;
        for (let i = 0; i < binaryMessage.length; i++) {
            imageData.data[dataIndex] = (imageData.data[dataIndex] & ~1) | binaryMessage[i];
            dataIndex += 4;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    
    function decodeImage() {
        if (!imageData) {
            console.error("Image data not available. Please encode an image first.");
            return;
        }

        const sliderValue = parseInt(slider.value);
        const binaryMessage = extractBinaryMessage(imageData).slice(0, sliderValue / 100 * imageData.data.length / 4);
        const message = binaryToString(binaryMessage);
        document.getElementById('message').innerText = message;
    }
    
    function stringToBinary(string) {
        return string.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    }

    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', function() {
        document.getElementById('messageInput').value = '';
        document.getElementById('imageInput').value = '';
        document.getElementById('message').innerText = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        imageData = null;
    });
});
