var canvas, ctx;
var waveformHeight = 100;

  
var startPlayer = function(e) {
  e.preventDefault();
  var sourceUrl = document.getElementById("musicsource").value || 'http://benalderfer.com/boombox/sounds/sweetdreams.mp3';
  Titus.init(sourceUrl);

  document.addEventListener('beat', function(e) {
    ctx.fillStyle = '#333333';
    ctx.fillRect(canvas.width-1, 0, 1, waveformHeight);
    var elm = document.getElementById("animationContainer");
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);
    newone.classList.add("beat");
  });
  document.addEventListener('bass', function(e) {
    // ctx.fillStyle = 'green';
    // ctx.fillRect(canvas.width-1, 0, 1, waveformHeight);
  });

  canvas = document.getElementById('visualizer');
  ctx = canvas.getContext('2d');

  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  requestAnimationFrame(canvasLoop);

  return false;
};

var canvasLoop = function() {
  var currentTime = Titus.getCurrentTime();
  var imageData = ctx.getImageData(1, 0, canvas.width-1, waveformHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);

  ctx.fillStyle = '#333333';
  ctx.fillRect(0, waveformHeight, canvas.width, 1);

  var fbcArray = Titus.getWaveformArray();
  if (!fbcArray) {
    fbcArray = [];
  }
  var volumeHeight = canvas.height - waveformHeight;
  
  // Draw waveform
  var sum = 0;
  for (var i = 0; i < fbcArray.length; i++) {
    sum += fbcArray[i];
    ctx.fillRect(i, canvas.height-(volumeHeight*fbcArray[i]/256), 1, fbcArray[i]);
  }

  // Draw volume
  var volume = sum / fbcArray.length;
  var scaledVolume = volume / 256;
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(canvas.width-1, waveformHeight * (1-scaledVolume), 1, scaledVolume * waveformHeight);
  ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
  var calculatedHeight = Math.round(volumeHeight * scaledVolume);
  ctx.fillRect(0, canvas.height - calculatedHeight, canvas.width, calculatedHeight);

  requestAnimationFrame(canvasLoop);
}