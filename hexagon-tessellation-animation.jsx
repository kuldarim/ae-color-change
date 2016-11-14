﻿app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES)
var proj= app.newProject();

// constants
var TIME = 7;
var COORDINATES = [];

var SIZE = parseInt(prompt("Iveskite apskritimo ploti", 100));
var positionX = parseInt(prompt("centro X", 100));
var positionY = parseInt(prompt("centro Y", 0));

var composition = proj.items.addComp("hexagon-tessellation", 700, 400, 1, TIME, 25);
composition.openInViewer();

var x = composition.width / 2;
var y = composition.height / 2;
var TOP_LEFT = [-x, y];
var TOP_RIGHT = [x, y];
var BOTTOM_LEFT = [-x, -y];
var BOTTOM_RIGHT = [x, -y];

draw();

function draw() {
  // Draw center hexagon
  drawHexagon("initial", positionX, positionY, 6, 0);
  
  var isInBoundaries = true;
  var i = 1;
  // Draw rings while inside bondaries
  while (isInBoundaries) {
    isInBoundaries = drawHexagonRing(positionX, positionY, 6, i);
    i++;
  }

  composition.duration = i;
}

// http://www.redblobgames.com/grids/hexagons/ 
// http://stackoverflow.com/questions/14916941/draw-a-hexagon-tessellation-animation-in-python
function drawHexagonRing(x, y, n, ringsNumber) {
  var dc = SIZE * Math.sqrt(3);
  var xc = x;
  var yc = y - ringsNumber * dc;
  var dx = -dc * Math.sqrt(3) / 2;
  var dy = dc / 2;
  var allHexagonsAreInBoundaries = [];
  for (var i = 0; i < 6; i++) {
    var isHexagonInBoundaries = [];
    for (var j = 0; j < ringsNumber; j++) {
      var xc = xc + dx;
      var yc = yc + dy;
      // alert (xc + ' ' + yc);
      drawHexagon(ringsNumber + '_' + i + '_' + j, xc, yc, n, ringsNumber);
      isHexagonInBoundaries.push(isInBoundaries(xc, yc));
    }
    if (isHexagonInBoundaries.length > 0) {
    	allHexagonsAreInBoundaries.push(allAreTrue(isHexagonInBoundaries));
    }
    var tmpdx = dx;
    var tmpdy = dy;
    dx = Math.cos(Math.PI / 3) * tmpdx + Math.sin(Math.PI / 3) * tmpdy;
    dy = -Math.sin(Math.PI / 3) * tmpdx + Math.cos(Math.PI / 3) * tmpdy;
  }

  return allAreTrue(allHexagonsAreInBoundaries);
}

function drawHexagon(name, x, y, n, ringsNumber) {
  COORDINATES.push({});
  var shapeVertices = getPolyginVertices(n, SIZE, x, y, ringsNumber);
  var shapePosition = [];
  if (ringsNumber > 0) {
    var index = getIndexFromCoordinates(shapeVertices, ringsNumber);
    var modifiedVertices = changeOrder(shapeVertices, index);
    shapePosition = addShape(name, modifiedVertices, ringsNumber);
  } else {
    shapePosition = addShape(name, shapeVertices, ringsNumber);
  }
  //alert()
  return shapePosition;
}

function addShape(name, vertices, ringsNumber) {
    var shape = composition.layers.addShape();
    shape.name = (name);
    var shapeContent1 = shape.property("Contents").addProperty("ADBE Vector Group");
    var shapeGroup1 = shape.property("Contents").property("Group 1");

    var shapePath= shapeGroup1.property("Contents").addProperty("ADBE Vector Shape - Group");
    var shapeMask = shapePath.property("Path");
    var shapeM = shapeMask.value;
    shapeM.vertices = vertices;
    shapeMask.setValue(shapeM);

    shapeGroup1.property("Contents")
        .addProperty("ADBE Vector Graphic - Stroke")
        .property("Color").setValue([0, 0, 0]);

    var trim = shape.property("Contents")
        .addProperty("ADBE Vector Filter - Trim");

    // add animation keyframes

    trim.property("End").setValueAtTime(ringsNumber, 0);
    trim.property("End").setValueAtTime(ringsNumber + 1, 100);

    return shape.property("Position").value;

}

// http://www.storminthecastle.com/2013/07/24/how-you-can-draw-regular-polygons-with-the-html5-canvas-api/
// http://scienceprimer.com/drawing-regular-polygons-javascript-canvas
function getPolyginVertices(numberOfSides, size, Xcenter, Ycenter, ringsNumber) {
  var verticesArray = [];

  for (var i = 0; i <= numberOfSides; i++) {
    var angleDeg = 60 * i;
    var angleRad = Math.PI / 180 * angleDeg;
    var x = Xcenter + size * Math.cos(angleRad);
    var y = Ycenter + size * Math.sin(angleRad);
    verticesArray.push([x, y]);
    COORDINATES[ringsNumber]['' + parseInt(x) + parseInt(y)] = true;
  }

  return verticesArray;
}

// Helper functions

function changeOrder(array, index) {
  var a1 = array.slice(0, index);
  var a2 = array.slice(index);
  return [].concat(a2).concat(a1);
}

function getIndexFromCoordinates(array, ringsNumber) {
  var index = undefined;
  for (var i = 0; i < array.length; i++) {
    var element = array[i];
    var x = element[0];
    var y = element[1];
    if (COORDINATES[ringsNumber - 1]['' + parseInt(x) + parseInt(y)]) {
      index = i;
    }
  }

  return index;
}

function isInBoundaries(x, y) {
  var inX = x > BOTTOM_LEFT[0] && x < TOP_RIGHT[0];
  var inY = y > BOTTOM_LEFT[1] && y < TOP_RIGHT[1];

  return inX && inY;
}

function allAreTrue(array) {
  var yes = false;
  for(var i = 0; i < array.length; i++) {
    yes = yes || array[i];
  }

  return yes;
}