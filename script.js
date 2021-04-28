// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
var form = document.getElementById('generate-meme');
var submit = form.querySelectorAll('button')[0];
var canvas = document.getElementById('user-image');
var context = canvas.getContext('2d');
var buttonGroup = document.getElementById('button-group').querySelectorAll('button'); 
var clear = buttonGroup[0];
var read = buttonGroup[1];
var voiceSelection = document.getElementById('voice-selection');
var synth = window.speechSynthesis;
var voices = [];
var volumeGroup = document.getElementById('volume-group');
var slider = volumeGroup.querySelectorAll('input');

let fileInput = document.getElementById('image-input');
fileInput.addEventListener('change', function(ev) {
   if(ev.target.files) {
      let file = ev.target.files[0];
      //console.log(file);
      let reader  = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function (e) {
          img.src = e.target.result;
          //console.log(img.src);
          img.alt = file.name;
          //console.log(img.alt);
      }
   }
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  form.reset();

  const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// generate meme on submit
form.addEventListener('submit', (e) => {
  console.log("here");
  const topText = document.getElementById('text-top').value;
  const bottomText = document.getElementById('text-bottom').value;
  context.textAlign = "center";
  context.font = "30px Arial";
  context.strokeStyle = 'black';
  context.lineWidth = 5;
  context.fillStyle = 'white';
  context.strokeText(topText, canvas.width/2, canvas.height/10);
  context.strokeText(bottomText, canvas.width/2, canvas.height-canvas.height/10);
  context.fillText(topText, canvas.width/2, canvas.height/10);
  context.fillText(bottomText, canvas.width/2, canvas.height-canvas.height/10);
  clear.disabled = false;
  read.disabled = false;
  voiceSelection.disabled = false;
  submit.disabled = true;
  populateVoiceList();
  e.preventDefault();
});

// clear form
clear.addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  form.reset();
  clear.disabled = true;
  read.disabled = true;
  submit.disabled = false;
});

read.addEventListener('click', () => {
  const topText = document.getElementById('text-top').value;
  const bottomText = document.getElementById('text-bottom').value;
  let utterTop = new SpeechSynthesisUtterance(topText);
  let utterBottom = new SpeechSynthesisUtterance(bottomText);
  let selectedOption = voiceSelection.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterTop.voice = voices[i];
      utterBottom.voice = voices[i];
    }
  }
  synth.speak(utterTop);
  synth.speak(utterBottom);
})

function populateVoiceList() {
  voices = synth.getVoices();

  for(let i = 0; i < voices.length ; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelection.appendChild(option);
  }
}

