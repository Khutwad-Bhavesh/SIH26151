/**
 * A.T.L.A.S. Dither Pulse Canvas2D Renderer
 * Implements the 21st.dev "Custom ASCII art" dither effect.
 */

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
const cellSize = 4;

const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

const sourceCanvas = document.createElement('canvas');
const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });

// Load the original source photo
const img = new Image();
img.src = 'source_image.png';
let imgLoaded = false;
img.onload = () => imgLoaded = true;

// 4x4 Bayer Matrix for Ordered Dithering
const bayer = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

function resize() {
    width = canvas.width = bufferCanvas.width = sourceCanvas.width = window.innerWidth;
    height = canvas.height = bufferCanvas.height = sourceCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function drawDitherPulse(time) {
    // Clear buffer (fully transparent)
    bufferCtx.clearRect(0, 0, width, height);
    
    if (!imgLoaded) return;
    
    // Draw source photo to hidden canvas (for sampling AND blurred background)
    sourceCtx.clearRect(0, 0, width, height);
    
    // Draw image centered and scaled
    const imgSize = Math.min(width, height) * 0.8;
    const drawX = (width - imgSize) / 2;
    const drawY = (height - imgSize) / 2;
    sourceCtx.drawImage(img, drawX, drawY, imgSize, imgSize);
    
    const sourceData = sourceCtx.getImageData(0, 0, width, height).data;
    
    // Pulse animation (Math.sin from 0.7 to 1.3 based on time)
    // Slowed down significantly (0.001 multiplier)
    const pulse = Math.sin(time * 0.001) * 0.3 + 1.0;
    
    // Draw grid of dithered pixels
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Sample color
            const sampleX = Math.floor(x + cellSize / 2);
            const sampleY = Math.floor(y + cellSize / 2);
            
            if (sampleX < width && sampleY < height) {
                const pixelIndex = (sampleY * width + sampleX) * 4;
                const r = sourceData[pixelIndex];
                const g = sourceData[pixelIndex + 1];
                const b = sourceData[pixelIndex + 2];
                const a = sourceData[pixelIndex + 3];
                
                if (a > 10) {
                    // Calculate luminance (Original unboosted formula)
                    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                    
                    // Apply contrast (config.contrast = 158) -> multiplier 1.58
                    const contrastLum = ((lum - 0.5) * 1.58) + 0.5;
                    
                    // Apply animation pulse
                    const finalLum = contrastLum * pulse;
                    
                    // Bayer Dither threshold
                    const matrixX = (x / cellSize) % 4;
                    const matrixY = (y / cellSize) % 4;
                    const threshold = (bayer[matrixY][matrixX] + 0.5) / 16;
                    
                    if (finalLum > threshold) {
                        bufferCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        bufferCtx.fillRect(x, y, cellSize, cellSize);
                    }
                }
            }
        }
    }
}

function applyPostProcessing() {
    // Fill background ink
    ctx.fillStyle = '#0D1013';
    ctx.fillRect(0, 0, width, height);
    
    if (imgLoaded) {
        // bgMode: "blur", bgBlur: 22, bgOpacity: 90
        ctx.filter = 'blur(22px)';
        ctx.globalAlpha = 0.9;
        ctx.drawImage(sourceCanvas, 0, 0);
        
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
    }

    // Draw dithered layer on top
    ctx.drawImage(bufferCanvas, 0, 0);
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    drawDitherPulse(currentTime);
    applyPostProcessing();
}

requestAnimationFrame(animate);
