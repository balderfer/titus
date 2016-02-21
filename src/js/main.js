var canvas, ctx;
var waveformHeight = 100;

$(document).ready(function() {
  
  Titus.init('dist/audio/sweetdreams.mp3');

  document.addEventListener('beat', function(e) {
    ctx.fillStyle = '#333333';
    ctx.fillRect(Titus.getCurrentTime()*40, 20, 1, 80);
  });
  document.addEventListener('bass', function(e) {
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(Titus.getCurrentTime()*40, 20, 3, 80);
  });

  canvas = document.getElementById('visualizer');
  ctx = canvas.getContext('2d');
  canvas.width = 5000;
  canvas.height = 300 + waveformHeight;

  canvasLoop();
});

var canvasLoop = function() {
  window.requestAnimationFrame(canvasLoop);

  var currentTime = Titus.getCurrentTime();
  ctx.clearRect(0, waveformHeight, canvas.width, canvas.height-100);
  ctx.fillStyle = '#00CCFF';

  var fbcArray = Titus.getWaveformArray();
  if (!fbcArray) {
    fbcArray = [];
  }
  
  // Draw waveform
  var sum = 0;
  for (var i = 0; i < fbcArray.length; i++) {
    sum += fbcArray[i];
    ctx.fillRect(i, canvas.height-fbcArray[i], 1, fbcArray[i]);
  }

  // Draw volume
  var volume = sum / fbcArray.length;
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(canvas.width-30, canvas.height-volume, 30, volume);
  var scaledVolume = volume*(100/256);
  ctx.fillRect(Titus.getCurrentTime()*40, 100-scaledVolume, 1, scaledVolume);

}