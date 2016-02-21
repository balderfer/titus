var Titus, audio, context, analyser, source, fbcArray, iteration, volume, pVolume, beatHold, beatDecay, beatHoldSetTime, currentTime, beatDiff, avgBeatDiff, deltaBeatDiff;
var canvas, ctx;
var bassSum, bassVolume;

var accBeatDiff, accBeatDiffMin, audioStartTime;

var waveformHeight = 100;

var BeatDiff = function(value, volume){
  this.value = value;
  this.volume = volume;
};

var audioLoop = function() {
  iteration++;
  currentTime = Date.now();
  fbcArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbcArray);
  cleanFbcArray();

  Titus.updateVisualizer();
};

var cleanFbcArray = function() {
  var i = fbcArray.length - 1;
  while (i >= 0) {
    if (fbcArray[i] > 0) {
      break;
    }
    i--;
  }
  fbcArray = fbcArray.slice(0, i+1);
}

var Titus = {
  init: function(pathToSong) {
    
    // Initialize audio file
    this.initAudio(pathToSong);
    // Initialize the audio statistics
    this.initAudioStats();
    // Initialize the canvas
    this.initCanvas();
    // Append the control player to div
    this.createControlPlayer(audio);

    context = new AudioContext();
    analyser = context.createAnalyser();
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    iteration = 0;

    var loop = setInterval(function() {
      audioLoop();
    }, 1000 / 60);
  },

  initAudio: function(pathToSong) {
    audio = new Audio();
    audio.src = pathToSong;
    audio.controls = true;
    audio.loop = false;
    audio.autoplay = true;
  },

  initAudioStats: function() {
    beatHold = 0;
    pVolume = 0;
    volume = 0;
    beatDecay = -0.25;
    beatHoldSetTime = Date.now();
    beatDiff = [];
    accBeatDiff = [];
    accBeatDiffMin = 10000000;
  },

  initCanvas: function() {
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');
    canvas.width = 5000;
    canvas.height = 300 + waveformHeight;
  },

  updateVisualizer: function() {
    var i, levels, sum;
    ctx.clearRect(0, waveformHeight, canvas.width, canvas.height-100);
    ctx.fillStyle = '#00CCFF';
    
    i = 0;
    levels = fbcArray.length;
    sum = 0;
    bassSum = 0;

    while (i < levels) {
      // Draw bar for sound levels
      ctx.fillRect(i, canvas.height-fbcArray[i], 1, fbcArray[i]);
      
      // Sum array values
      sum += fbcArray[i];

      // Sum bass values
      if (i < levels / 8) bassSum += fbcArray[i];
      i += 1;
    }

    // Calculate volume
    volume = sum / levels;
    this.updateVolume();
    // Update beat hold
    this.updateBeatHold();
  },

  updateVolume: function() {
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(canvas.width-30, canvas.height-volume, 30, volume);
    var scaledVolume = volume*(100/256);
    ctx.fillRect(context.currentTime*40, 100-scaledVolume, 1, scaledVolume);
  },

  updateBeatHold: function() {
    var tempBeatDiff = Math.abs(currentTime - beatHoldSetTime);
    // Update BH if volume surpasses previous BH, is no longer increasing,
    // and is greater than 20 frames from previous beat detection.
    // Otherwise decay the previous BH.
    if (volume > beatHold && volume < pVolume && tempBeatDiff >= (60000 / 180)) {
      // since volume is less than pVolume that means pVolume is actually
      // the highest value we've seen so far
      beatHold = pVolume;
      beatHoldSetTime = currentTime;
      beatDiff.push(new BeatDiff(tempBeatDiff, pVolume));
      this.calcAvgBeatDiff();
      ctx.fillStyle = 'yellow';
      ctx.fillRect(0, waveformHeight, canvas.width, canvas.height - waveformHeight)
    } else {
      beatHold += beatDecay
    }
    ctx.fillRect(0, canvas.height-beatHold, canvas.width, 1)
    pVolume = volume;
  },

  calcAvgBeatDiff: function() {
    var i = beatDiff.length - 1;
    if (i < 0) i = 0;
    var j = 0;
    var fireBeat = false;
    var epsilon = 0.1;
    var totalAverageVolume = 0;
    for (var i = 0; i < currentIndex; i++){
      var current = beatDiff[currentIndex];
      var past = beatDiff[i];
      var avgValue = (current.value + past.value) / 2;
      var avgVolume = (current.volume + past.volume) / 2;
      totalAverageVolume += current.volume;
      totalAverageVolume * ((i - 1) / i);


      if (Math.abs(avgVolume - totalAverageVolume) < epsilon * totalAverageVolume){
        // lol idk maybe this is useful
      }

      if (Math.abs(current.value - past.value) < epsilon * avgValue
          || Math.abs(current.volume - past.volume) < epsilon * avgVolume){
        // accBeatDiff.push(avg);
        fireBeat = true;
        break;
        //this.fireBeatEvent();
      }
    }
    if (fireBeat) {
      // this.fireBeatEvent();
      this.addEventToGraph('black');
    } else {
      this.addEventToGraph('blue');
    }
  },

  fireBeatEvent: function() {
    var event = new CustomEvent('beat');
    document.dispatchEvent(event);
    this.addEventToGraph();
  },

  addEventToGraph: function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(context.currentTime*40, 20, 1, 80);
    ctx.font="8px Georgia";
    ctx.fillText(beatDiff[beatDiff.length-1].value, context.currentTime*40 - 8, 10);
  },

  createControlPlayer: function(audio) {
    document.getElementById('titus-controls').appendChild(audio);
  }
};
