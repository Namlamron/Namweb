new p5(function (sketch) {
  var position;
  var velocity = p5.Vector.fromAngle(45);
  velocity.mult(5);
  var textSize = 100; // Increase text size
  var currentColor = [255, 255, 255]; // Default white color
  var textString = "BRB"; // Text to display
  var debugMode = false; // Set this to true to enable debugging mode

  // Generate a random color
  function getRandomColor() {
    return [sketch.random(255), sketch.random(255), sketch.random(255)];
  }

  // Check for boundary collision
  function checkBoundaryCollision() {
    var hasCollision = false;
    var textWidth = sketch.textWidth(textString);
    var textHeight = sketch.textAscent() + sketch.textDescent();

    // Left or right collision
    if (position.x - textWidth / 2 < 0 || position.x + textWidth / 2 > sketch.width) {
      velocity.x *= -1;
      hasCollision = true;
    }

    // Top or bottom collision
    if (position.y - textHeight / 2 < 0 || position.y + textHeight / 2 > sketch.height) {
      velocity.y *= -1;
      hasCollision = true;
    }

    return hasCollision;
  }

  // Setup
  sketch.setup = function () {
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.textSize(textSize);

    // Initialize position to the center of the canvas
    position = sketch.createVector(sketch.width / 2, sketch.height / 2);
  };

  // Draw loop
  sketch.draw = function () {
    sketch.clear();

    // Check for collisions
    var hasCollision = checkBoundaryCollision();
    if (hasCollision) {
      // Change direction and color on collision
      currentColor = getRandomColor();
    }

    // Update position
    position.add(velocity);

    // Draw text with current color
    sketch.fill(currentColor);
    sketch.text(textString, position.x, position.y);

    // If debug mode is on, draw the collision box
    if (debugMode) {
      var textWidth = sketch.textWidth(textString);
      var textHeight = sketch.textAscent() + sketch.textDescent();

      sketch.noFill();
      sketch.stroke(255, 0, 0); // Red color for debugging rectangle
      sketch.rect(
        position.x - textWidth / 2,
        position.y - textHeight / 2,
        textWidth,
        textHeight
      );
    }
  };

  // Resize canvas when window size changes
  sketch.windowResized = function () {
    sketch.resizeCanvas(window.innerWidth, window.innerHeight);
  };
});
