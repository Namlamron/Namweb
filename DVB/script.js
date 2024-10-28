new p5(function (sketch) {
  var position;
  var velocity = p5.Vector.fromAngle(45);
  velocity.mult(5);
  var textSize = 100; // Increase text size
  var currentColor = [255, 255, 255]; // Default white color
  var textString = "BRB"; // Text to display

  /**
   * Generate a random color.
   */
  function getRandomColor() {
    return [sketch.random(255), sketch.random(255), sketch.random(255)];
  }

  /**
   * Checks boundary collision.
   *
   * @return {boolean}
   */
  function checkBoundaryCollision() {
    var hasCollision = false;
    var textWidth = sketch.textWidth(textString);
    var textHeight = sketch.textAscent() + sketch.textDescent(); // More accurate height of the text

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

  /**
   * Setup.
   */
  sketch.setup = function () {
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.textSize(textSize); // Set larger text size

    // Initialize position to the center of the canvas
    position = sketch.createVector(sketch.width / 2, sketch.height / 2);
  };

  /**
   * Draw.
   */
  sketch.draw = function () {
    sketch.clear(); // Clears the background, keeping it transparent

    // Check for collisions
    var hasCollision = checkBoundaryCollision();
    if (hasCollision) {
      // Change direction when a collision occurs and update the color
      currentColor = getRandomColor();
    }

    // Update the position of the text
    position.add(velocity);

    // Set text properties and draw the "BRB" text with the current color
    sketch.fill(currentColor); // Set text color to the current color
    sketch.text(textString, position.x, position.y);

    // Draw the debugging collision box
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
  };
});
