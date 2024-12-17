const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
// context for web gl rendering

// Adjust canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height); // Reset viewport
//x,y,width,height

// Check WebGL support
if (!gl) {
  alert("WebGL is not supported in your browser.");
  throw new Error("WebGL not supported.");
}

// Vertex shader source code (GLSL)
const vertexShaderSource = `
    attribute vec4 a_Position; // Position of vertex
    void main() {
      gl_Position = vec4(a_Position); // Pass-through position
    }
  `;

// Fragment shader source code (GLSL)
const fragmentShaderSource = `
    precision mediump float;
    uniform float u_X;
    uniform float u_Y;
    void main() {
      // Cornflower Blue RGB (100, 149, 237) - normalized to (0.39, 0.58, 0.93)
      vec3 color = vec3(u_X,u_Y, 0.0);
      // normalized color
      gl_FragColor=vec4(color,1.0);
    }
  `;

// Function to compile a shader
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  //creating particular type of shader
  gl.shaderSource(shader, source);
  //adding source code in shader
  gl.compileShader(shader);
  //compling the shader code
  //check for successfull compilation
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed: ", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Shader compile failed.");
  }
  return shader;
}

// Compile vertex and fragment shaders
const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(
  gl,
  fragmentShaderSource,
  gl.FRAGMENT_SHADER
);

// Link shaders into a program
const program = gl.createProgram();
//crete a program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link failed: ", gl.getProgramInfoLog(program));
  throw new Error("Program link failed.");
}

// Use the shader program
gl.useProgram(program);

// Define a rectangle
const vertices = new Float32Array([
  -1,
  -1, // Bottom-left
  1,
  -1, // Bottom-right
  -1,
  1, // Top-left
  1,
  1, // Top-right
]);

// Create a buffer to store vertices
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// binding buffer
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Enable the position attribute
const positionLocation = gl.getAttribLocation(program, "a_Position");
const Xcorr = gl.getUniformLocation(program, "u_X");
const Ycorr = gl.getUniformLocation(program, "u_Y");
//getting the value of shader uniform variable

// how to interpret the data in the vertex buffer
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
//enable vertex buffer
gl.enableVertexAttribArray(positionLocation);

gl.clear(gl.COLOR_BUFFER_BIT);
//clear the canvas

//starting and ending buffer

canvas.addEventListener("mousemove", (event) => {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  //relative to window browser
  const rect = canvas.getBoundingClientRect();
  const x = mouseX - rect.left;
  const y = mouseY - rect.top;
  const normalizedX = x / canvas.height;
  const normalizedY = y / canvas.width;
  console.log(normalizedX, normalizedY);
  gl.uniform1f(Xcorr, normalizedX);
  gl.uniform1f(Ycorr, normalizedY);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
});
