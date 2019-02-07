var audioContext, analyser, source, data, iteration, currentTime, isRunning;
// Initialize variables for beat detection on different levels.
var genVolume, genThreshold, genDecay, pGenVolume, genThresholdSetTime, genDiffArray;
var bassVolume, bassThreshold, bassDecay, pBassVolume, bassThresholdSetTime, bassDiffArray;

isRunning = false;

var BeatDiff = function(value, volume){
  this.value = value;
  this.volume = volume;
};

// Remove trailing zeros from end of data
var cleandata = function() {
  var i = data.length - 1;
  for (i; i >= 0; i--) {
    if (data[i] > 0) break;
  }
  data = data.slice(0, i+1);
}

var audioLoop = function() {
  iteration++;
  currentTime = audioContext.currentTime;
  analyser.getByteFrequencyData(data);
  // cleandata();

  Titus.updateTital();
  requestAnimationFrame(audioLoop);
};

var Titus = {
  getWaveformArray: function() {
    if (isRunning)
      return data;
    else
      return null;
  },

  getCurrentTime: function() {
    return currentTime;
  },

  init: function(pathToSong) {
    isRunning = true;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.initBeatData();

    if (!AudioContext) {
      alert("Sorry, the Web Audio API is not supported in this browser.");
      return;
    }
    
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    data = new Uint8Array(analyser.frequencyBinCount);

    iteration = 0;
    requestAnimationFrame(audioLoop);

    var audio = new Audio();
    audio.loop = true;
    audio.autoplay = false;
    audio.crossOrigin = "anonymous";
    audio.src = pathToSong;
    audio.controls = false;

    audio.addEventListener("canplay", function() {
      audio.play();
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    });

  },

  initBeatData: function() {
    var decay = -1;
    // General
    genThreshold = 0;
    genDecay = decay;
    pGenVolume = 0;
    genThresholdSetTime = 0;
    genDiffArray = [];
    // Bass
    bassThreshold = 0;
    bassDecay = decay / 50;
    pBassVolume = 0;
    bassThresholdSetTime = 0;
    bassDiffArray = [];
  },

  updateTital: function() {    
    var i = 0;
    var genSum = 0;
    var bassSum = 0;

    for (i; i < data.length; i++) {
      genSum += data[i];
      if (i < data.length / 48) bassSum += data[i];
    }
    // Detect general beat
    genVolume = genSum / data.length;
    this.detectBeat(genVolume, genThreshold, genDecay, pGenVolume, genThresholdSetTime, genDiffArray, function(genDetectionResults) {
      genThreshold = genDetectionResults[3];
      pGenVolume = genDetectionResults[4];
      genThresholdSetTime = genDetectionResults[5];
      genDiffArray = genDetectionResults[6];
      if (genDetectionResults[0] && genDetectionResults[1]) {
        this.fireEvent('beat', {'value': genDetectionResults[6]});
      }
    }.bind(this));
    // Detect bass beat
    bassVolume = bassSum / data.length;
    this.detectBeat(bassVolume, bassThreshold, bassDecay, pBassVolume, bassThresholdSetTime, bassDiffArray, function(bassDetectionResults) {
      bassThreshold = bassDetectionResults[3];
      pBassVolume = bassDetectionResults[4];
      bassThresholdSetTime = bassDetectionResults[5];
      bassDiffArray = bassDetectionResults[6];
      if (bassDetectionResults[0] && bassDetectionResults[1]) {
        this.fireEvent('bass', {'value': bassDecay[2]});
      }
    }.bind(this));
  },

  detectBeat: function(beatVolume, beatThreshold, beatDecay, pBeatVolume, beatThresholdSetTime, beatDiffArray, cb) {
    // console.log('detectBeat');
    var beatDiff = Math.abs(audioContext.currentTime - beatThresholdSetTime);
    var beatDetected = false;
    var results = [false, null];
    // console.log('beatVolume: ' + beatVolume);
    // console.log('beatThreshold: ' + beatThreshold);
    if (beatVolume > beatThreshold && beatVolume < pBeatVolume && beatDiff >= (60 / 180)) {
      beatDetected = true;
      beatDiffArray.push(new BeatDiff(beatDiff, pBeatVolume));
      results = this.verifyBeat(beatDiffArray);
      if (results[0]) {
        beatThreshold = pBeatVolume;
        beatThresholdSetTime = currentTime;
      }
    } else {
      beatThreshold += beatDecay;
    }
    pBeatVolume = beatVolume;
    var results = [beatDetected, results[0], results[1], beatThreshold, pBeatVolume, beatThresholdSetTime, beatDiffArray];
    cb(results);
  },

  verifyBeat: function(beatDiffArray) {
    var currentIndex = beatDiffArray.length - 1;
    if (currentIndex < 0) currentIndex = 0;
    var shouldFireBeatEvent = false;
    var epsilon = 0.1;
    var totalAverageVolume = 0;
    for (var i = 0; i < currentIndex; i++) {
      var current = beatDiffArray[currentIndex];
      var past = beatDiffArray[i];
      var avgValue = (current.value + past.value) / 2;
      var avgVolume = (current.volume + past.volume) / 2;
      totalAverageVolume += current.volume;
      // totalAverageVolume * ((i - 1) / i); // Not sure what this is for @Scott
      if (Math.abs(current.value - past.value) < epsilon * avgValue
          || Math.abs(current.volume - past.volume) < epsilon * avgVolume) {
        shouldFireBeatEvent = true;
        break;
      }
    }
    return [shouldFireBeatEvent, avgValue];
  },

  fireEvent: function(eventType, data) {
    var event = new CustomEvent(eventType);
    document.dispatchEvent(event);
  }
};
