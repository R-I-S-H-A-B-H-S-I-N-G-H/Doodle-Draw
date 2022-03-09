var nn;
var canPredict = false;
labelmap = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

// labelmap = [
// 	'apple',
// 	'axe',
// 	'airplane',
// 	'circle',
// 	'triangle',
// 	'ant',
// 	'book',
// 	'bird',
// ];
var slider,
  strokeVal = 18;
var sliderText;
var predictions = "___________";
const bgcolor = 255;
async function preload() {
  await tf.loadLayersModel("models/numbermodel/model.json").then((n) => {
    nn = n;
    console.log("succesfully loaded model");
  });
}
async function setup() {
  slider = document.getElementById("strokeSize");
  sliderText = document.getElementById("strokeValDisp");
  pixelDensity(1);
  const canvas = createCanvas(innerWidth, innerHeight * 0.68);
  canvas.parent("canvas");
  background(bgcolor);
  // document.getElementById('predictRes').innerText = '';
}

function draw() {
  handleSlider();
  doodle();
  predict();
}

function handleSlider() {
  if (slider !== undefined && slider.value !== strokeVal) {
    strokeVal = slider.value;
    sliderText.innerText = "Stroke Weight is : " + strokeVal;
    // console.log(slider.value);
  }
}

async function predict() {
  // console.log('prediction');
  // return;
  if (nn === undefined) {
    console.warn("SOMTING WRONG");
    return;
  }
  data = getImageData();
  xs = tf.tensor(data, [1, 28, 28, 1]);
  nn.predict(xs)
    .data()
    .then((result) => {
      var r = result;
      var t = Math.max(...result);
      var prcnt = Math.round(t * 1000) / 10;
      // console.log(r);
      // console.log();
      // predictions = labelmap[result.indexOf(t)] + '  ' + prcnt + '%';
      // console.log(predictions);
      //   if (prcnt >= 51) {
      //     predictions = labelmap[result.indexOf(t)] + "  " + prcnt + "%";
      //   } else {
      //     predictions = "___________";
      //   } // console.log(predictions);

      predictions = labelmap[result.indexOf(t)] + "  " + prcnt + "%";
      document.getElementById("predictRes").innerHTML = predictions;
    });
}

function keyPressed() {
  if (key === "p") {
    predict();
  }
  if (key == "c") {
    clearScreen();
  }
}
function doodle() {
  if (mouseIsPressed) {
    beginShape();
    stroke(255 - bgcolor);
    strokeWeight(strokeVal);
    vertex(pmouseX, pmouseY);
    vertex(mouseX, mouseY);

    endShape();
    canPredict = true;
  } else {
    if (canPredict || predictions === "___________") {
      predict();
      canPredict = false;
    }
    canPredict = false;
  }
}
function clearScreen() {
  background(bgcolor);
}

function getImageData() {
  var boundingbox = getBoundingbox();
  var img;
  img = get(
    boundingbox.x,
    boundingbox.y,
    boundingbox.width,
    boundingbox.height
  );
  // img = get();

  img.resize(28, 28);
  // image(img, 0, 0, 28, 28);
  img.loadPixels();
  var data = [];
  for (var i = 0; i < img.pixels.length; i += 4) {
    // var val = map(img.pixels[i], 0, 255,
    // 255, 0);
    data.push(Math.abs(bgcolor - img.pixels[i]) / 255.0);
  }
  return data;
}
function getBoundingbox() {
  offset = 30;
  // console.log('GET BOUNDING BOX');
  loadPixels();
  var black = 0,
    white = 0;
  var minx = width,
    miny = height,
    maxx = 0,
    maxy = 0;
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var indx = (x + y * width) * 4;
      if (pixels[indx] === bgcolor) {
        continue;
      }
      minx = Math.min(minx, x);
      miny = Math.min(miny, y);

      maxx = Math.max(maxx, x);
      maxy = Math.max(maxy, y);
    }
  }
  minx = Math.max(minx - offset, 0);
  miny = Math.max(miny - offset, 0);

  maxx = Math.min(maxx + offset, width);
  maxy = Math.min(maxy + offset, height);

  // var temp_h = maxx - minx > maxy - miny ? maxx - minx : maxy - miny;

  // console.log('minx : ', minx);
  // console.log('miny : ', miny);
  // console.log('maxx : ', maxx);
  // console.log('maxy : ', maxy);

  var boundingbox = {
    x: minx,
    y: miny,
    width: maxx - minx,
    height: maxy - miny,
  };
  return boundingbox;
}
function drawBoundingbox() {
  console.log("draw bounding box");
  var boundingbox = getBoundingbox();
  noFill();
  stroke(255 - bgcolor);
  strokeWeight(2);
  rect(boundingbox.x, boundingbox.y, boundingbox.width, boundingbox.height);
}
