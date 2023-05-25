var image = null;
var image1 = null;
var image2 = null;

document.getElementById("finput").addEventListener('change', handleImage, false);

async function save() {
	const canvasResult = document.getElementById("can2");
	var dataURL = canvasResult.toDataURL("image/png");
	// var newTab = window.open('about:blank', 'image from canvas');
	// newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");

	const response = await fetch(dataURL);

	const blobImage = await response.blob();

	const href = URL.createObjectURL(blobImage);

	const anchorElement = document.createElement('a');
	anchorElement.href = href;
	anchorElement.download = 'output';

	document.body.appendChild(anchorElement);
	anchorElement.click();

	document.body.removeChild(anchorElement);
	window.URL.revokeObjectURL(href);
}

function resizeImage(width, height) {
	while (width > 800) {
		width *= 0.9;
		height *= 0.9;
	}

	return { width, height };
}

async function handleImage(e) {

	let canvas = document.getElementById("can1");
	let canvas2 = document.getElementById("can2");
	let ctx = canvas.getContext('2d');

	var reader = new FileReader();
	reader.onload = function (event) {
		var img = new Image();
		img.onload = function () {
			console.log('original w: ', img.width, ' h: ', img.height);
			const sizeImage = resizeImage(img.width, img.height);
			console.log(sizeImage);

			canvas.width = sizeImage.width;
			canvas.height = sizeImage.height;
			ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

			canvas2.width = canvas.width;
			canvas2.height = canvas.height;
			const sourceUrl = canvas.toDataURL("image/png");
			image1 = new SimpleImage(sourceUrl);

		}
		img.src = event.target.result;
	}
	reader.readAsDataURL(e.target.files[0]);
}

function clearCanvas() {
	var a = document.getElementById("can1");
	var b = document.getElementById("can2");
	console.log(a.width)

	var c = a.getContext("2d");
	var d = b.getContext("2d");

	c.clearRect(0, 0, a.width, a.height);
	d.clearRect(0, 0, b.width, b.height);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function bgchangegr() {

	const canvasResult = document.getElementById('can2');
	let ctx = canvasResult.getContext('2d');
	let imageData = ctx.createImageData(1, 1);

	let selectedColor = hexToRgb(document.getElementById("selectedColor").value);
	console.log("selected color: ", selectedColor);
	// Iterate through every pixel
	for (let i = 0; i < imageData.data.length; i += 4) {
		imageData.data[i + 0] = selectedColor.r;  // R value
		imageData.data[i + 1] = selectedColor.g;    // G value
		imageData.data[i + 2] = selectedColor.b;  // B value
		imageData.data[i + 3] = 255;  // A value
	}

	console.log(image1, image2);
	let arrayTranspX = [];
	let arrayTranspY = [];
	for (let pixel of image1.values()) {
		// console.log('alpha ',pixel.getAlpha());
		// console.log('r ', pixel.getRed(), 'g ', pixel.getGreen(), 'b ', pixel.getBlue());
		if (pixel.getAlpha() < 200) {
			var pixelX = pixel.getX();
			var pixelY = pixel.getY();
			arrayTranspX.push(pixelX);
			arrayTranspY.push(pixelY);
		}

	}

	image1.drawTo(canvasResult);
	console.log("coloring");
	for (let i = 0; i < arrayTranspX.length; i++) {
		ctx.putImageData(imageData, arrayTranspX[i], arrayTranspY[i]);
	}
	console.log("done");
}

function removebg() {
	console.log("removing bg");
	const sourceCanvas = document.getElementById("can1");
	const sourceUrl = sourceCanvas.toDataURL("image/png");
	var fd = new FormData();
	var files = dataURLtoFile(sourceUrl, 'input.png');
	console.log(files);
	fd.append('file', files);
	// var files = $('#finput')[0].files;
	// console.log(files);
	// fd.append('file', files[0]);
	$.ajax({
		type: "POST",
		url: "http://localhost:5000/api",
		data: fd,
		contentType: false,
		processData: false,
		success: function (response) {
			console.log("success");

			const can2 = document.getElementById("can2");
			let context = can2.getContext('2d');

			base_image = new Image();
			base_image.src = 'data:image/png;base64, ' + response;
			base_image.onload = function () {
				console.log('drawing');
				// console.log('image ', base_image);
				context.drawImage(base_image, 0, 0);
			}
		},
		error: function (response) {
			console.log("failed");
			console.log(response)
		}

	});
	// newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
}

function swap() {
	const destinationCanvas = document.getElementById("can1");
	const sourceCanvas = document.getElementById("can2");

	const destinationCtx = destinationCanvas.getContext('2d');
	const sourceCtx = sourceCanvas.getContext('2d');

	const sourceUrl = sourceCanvas.toDataURL("image/png");
	const destinationUrl = destinationCanvas.toDataURL("image/png");

	destinationCtx.clearRect(0, 0, destinationCanvas.width, destinationCanvas.height);
	sourceCtx.clearRect(0, 0, sourceCtx.width, sourceCtx.height);

	let destinationImage = new Image();
	destinationImage.src = sourceUrl;
	destinationImage.onload = function () {
		destinationCtx.drawImage(destinationImage, 0, 0);
	}

	let sourceImage = new Image();
	sourceImage.src = destinationUrl;
	sourceImage.onload = function () {
		sourceCtx.drawImage(sourceImage, 0, 0);
	}

	image1 = new SimpleImage(sourceUrl);
	image2 = new SimpleImage(destinationUrl);
	console.log('done swap');

}

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}