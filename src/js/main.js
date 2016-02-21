$(document).ready(function() {
  
  Titus.init('dist/audio/bangarang.mp3');

  document.addEventListener('beat', function(e) {
    console.log("Beat fired!");
  });

});