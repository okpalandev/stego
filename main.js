

function showMessage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let binaryMessage = '';
    for (let i = 0; i < data.length; i++) {
        binaryMessage += data[i] & 1;
    }
    
    let message = '';
    for (let i = 0; i < binaryMessage.length; i += 8) {
        message += String.fromCharCode(parseInt(binaryMessage.substr(i, 8), 2));
    }
    
    alert(message);
}

function stringToBinary(string) {
    return string.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

let canvas, ctx, imageData, slider;

function encodeImage() {
    const imageInput = document.getElementById('imageInput');
    const messageInput = document.getElementById('messageInput');
    
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const message = messageInput.value;
            hideMessage(message);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function hideMessage(message) {
    const binaryMessage = stringToBinary(message);
    let dataIndex = 0;
    
    for (let i = 0; i < binaryMessage.length; i++) {
        imageData.data[dataIndex] = (imageData.data[dataIndex] & ~1) | binaryMessage[i];
        dataIndex += 4; // Move to the next pixel
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function decodeImage() {
    const sliderValue = parseInt(slider.value);
    const binaryMessage = [];

    // Get the modified image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const bit = imageData.data[i] & 1;
        binaryMessage.push(bit);

        // Update data index based on slider value
        if ((i / 4) / imageData.width > sliderValue / 100) {
            break;
        }
    }

    let message = '';
    for (let i = 0; i < binaryMessage.length; i += 8) {
        message += String.fromCharCode(parseInt(binaryMessage.slice(i, i + 8).join(''), 2));
    }

    document.getElementById('decodedMessage').innerText = message;
}

document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the Encode button
    const encodeButton = document.getElementById('encode');
    // Add event listener to the Encode button
    encodeButton.addEventListener('click', encodeImage);

    // Get reference to the Decode button
    const decodeButton = document.getElementById('decode');
    // Add event listener to the Decode button
    decodeButton.addEventListener('click', decodeImage);

    // Get reference to the slider
    slider = document.getElementById('slider');
    // Add event listener to the slider
    slider.addEventListener('input', decodeImage);

    const hideButton = document.getElementById('hide');
    hideButton.addEventListener('click', function() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value;
        hideMessage(message);
    });

    const showButton = document.getElementById('show');
    showButton.addEventListener('click', showMessage);
});
