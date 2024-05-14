document.getElementById("detectBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];
  
    if (!file) {
        alert("Please select an image.");
        return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    axios({
        method: "POST",
        url: "https://detect.roboflow.com/tire-tread/5",
        params: {
            api_key: "XMX72TmgjNd3rQlb4BAj",
        },
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    .then(function (response) {
        // Display response
        displayResponse(response.data);
  
        // Draw image and bounding boxes
        drawImageWithBoundingBoxes(file, response.data.predictions);
  
        // Show the canvas
        document.getElementById("canvasContainer").style.display = "flex";
    })
    .catch(function (error) {
        console.log(error.message);
    });
});
  
function displayResponse(responseData) {
    const responseContainer = document.getElementById("responseContainer");
    if (responseData.predictions.length > 0) {
        const prediction = responseData.predictions[0];
        const confidence = (prediction.confidence * 100).toFixed(2);
        const className = prediction.class;
        const resultString = `The class of the image is ${className} with a confidence level of ${confidence}%`;
        responseContainer.innerHTML = `<p>${resultString}</p>`;
    } else {
        responseContainer.innerHTML = "<p>No predictions found.</p>";
    }
}
  
function drawImageWithBoundingBoxes(imageFile, predictions) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const reader = new FileReader();
  
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            // Adjust canvas size to match the image size
            canvas.width = img.width;
            canvas.height = img.height;
  
            // Calculate the scale factor
            const maxCanvasWidth = window.innerWidth * 0.5;
            const maxCanvasHeight = window.innerHeight * 0.5;
            const scale = Math.min(maxCanvasWidth / img.width, maxCanvasHeight / img.height);
  
            // Apply scaling
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
  
            // Draw the scaled image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
            // Draw bounding boxes
            predictions.forEach((prediction) => {
            // Calculate corner points of the bounding box
            const x1 = (prediction.x - prediction.width / 2) * scale;
            const y1 = (prediction.y - prediction.height / 2) * scale;
            const width = prediction.width * scale;
            const height = prediction.height * scale;
  
            // Draw bounding box
            ctx.beginPath();
            ctx.rect(x1, y1, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.closePath();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
}