$(document).ready(function() {
  
  Titus.init('dist/audio/redforest.mp3');

  document.addEventListener('beat', function(e) {
    console.log("Beat fired!");
  });

});