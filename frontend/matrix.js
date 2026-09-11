/**
 * A.T.L.A.S. Matrix Digital Rain Canvas2D Renderer
 * Implements the 21st.dev ASCII-art effect pipeline.
 */

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
let columns = [];
const fontSize = 14;

// 21st.dev Config (Blue Theme Override)
const config = {
    charSet: "01", // Binary
    tint: "#00A3FF", // Blue theme
    bgMode: "solid",
    bgAlpha: 0.1, // Fade trails
    pfx: {
        vignette: { enabled: true, intensity: 38 },
        scanLines: { enabled: true, intensity: 28 },
        chromatic: { enabled: true, intensity: 40 },
        bloom: { enabled: true, intensity: 60 },
        filmGrain: { enabled: true, intensity: 40 },
        glitch: { enabled: true, intensity: 20 }
    }
};

// Offscreen buffer for post-processing
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

function resize() {
    width = canvas.width = bufferCanvas.width = window.innerWidth;
    height = canvas.height = bufferCanvas.height = window.innerHeight;
    
    const colCount = Math.floor(width / fontSize) + 1;
    columns = Array(colCount).fill(0).map(() => Math.random() * -100); // Random start heights
    
    // Fill buffer with dark initially
    bufferCtx.fillStyle = '#0D1013';
    bufferCtx.fillRect(0, 0, width, height);
}
window.addEventListener('resize', resize);
resize();

function generateNoise(ctx, width, height, intensity) {
    // Optimization: Draw a small noise pattern and tile it, instead of looping over every pixel.
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 100;
    noiseCanvas.height = 100;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(100, 100);
    const data = imgData.data;
    const alpha = (intensity / 100) * 255;
    
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = alpha * 0.1; // Very subtle
    }
    nCtx.putImageData(imgData, 0, 0);
    
    ctx.globalCompositeOperation = 'overlay';
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
}

function drawMatrix() {
    // 1. Fade the previous frame to create trails
    bufferCtx.fillStyle = `rgba(13, 16, 19, ${config.bgAlpha})`;
    bufferCtx.fillRect(0, 0, width, height);

    // 2. Draw falling characters
    bufferCtx.fillStyle = config.tint;
    bufferCtx.font = `${fontSize}px "IBM Plex Mono", monospace`;
    bufferCtx.textAlign = 'center';

    for (let i = 0; i < columns.length; i++) {
        // Random binary char
        const char = config.charSet[Math.floor(Math.random() * config.charSet.length)];
        
        // Sometimes draw a bright white head character
        if (Math.random() > 0.8) {
            bufferCtx.fillStyle = "#FFFFFF";
            bufferCtx.fillText(char, i * fontSize, columns[i] * fontSize);
            bufferCtx.fillStyle = config.tint;
        } else {
            bufferCtx.fillText(char, i * fontSize, columns[i] * fontSize);
        }

        // Reset drop to top randomly
        if (columns[i] * fontSize > height && Math.random() > 0.975) {
            columns[i] = 0;
        }
        columns[i]++;
    }
}

function applyPostProcessing() {
    // Start with a clear main canvas
    ctx.fillStyle = '#0D1013';
    ctx.fillRect(0, 0, width, height);

    // Glitch effect (random slicing)
    let drawX = 0;
    let drawY = 0;
    if (config.pfx.glitch.enabled && Math.random() < (config.pfx.glitch.intensity / 100) * 0.1) {
        drawX = (Math.random() - 0.5) * 20;
        // Random slice horizontally
        const sliceY = Math.random() * height;
        const sliceH = Math.random() * 50 + 10;
        bufferCtx.drawImage(bufferCanvas, 0, sliceY, width, sliceH, drawX * 2, sliceY, width, sliceH);
    }

    // Chromatic Aberration
    if (config.pfx.chromatic.enabled) {
        const offset = (config.pfx.chromatic.intensity / 100) * 4;
        ctx.globalCompositeOperation = 'screen';
        
        // Pseudo-chromatic using globalAlpha and shifting
        ctx.globalAlpha = 0.5;
        // Left shift (Red-ish)
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.drawImage(bufferCanvas, drawX - offset, drawY);
        
        // Right shift (Blue-ish)
        ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.drawImage(bufferCanvas, drawX + offset, drawY);
        
        // Center
        ctx.globalAlpha = 1.0;
        ctx.drawImage(bufferCanvas, drawX, drawY);
        ctx.globalCompositeOperation = 'source-over';
    } else {
        ctx.drawImage(bufferCanvas, drawX, drawY);
    }

    // Bloom
    if (config.pfx.bloom.enabled) {
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${(config.pfx.bloom.intensity / 100) * 8}px)`;
        ctx.globalAlpha = (config.pfx.bloom.intensity / 100) * 0.8;
        ctx.drawImage(bufferCanvas, drawX, drawY);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }

    // Scanlines
    if (config.pfx.scanLines.enabled) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(config.pfx.scanLines.intensity / 100) * 0.3})`;
        for (let i = 0; i < height; i += 4) {
            ctx.fillRect(0, i, width, 2);
        }
    }

    // Film Grain
    if (config.pfx.filmGrain.enabled) {
        generateNoise(ctx, width, height, config.pfx.filmGrain.intensity);
    }

    // Vignette
    if (config.pfx.vignette.enabled) {
        const gradient = ctx.createRadialGradient(width/2, height/2, height/4, width/2, height/2, width/1.2);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${(config.pfx.vignette.intensity / 100) * 1.5})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
}

let lastTime = 0;
const fps = 30; // Matrix looks better slightly choppy

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Throttle FPS for the matrix look
    if (currentTime - lastTime < 1000 / fps) return;
    lastTime = currentTime;

    drawMatrix();
    applyPostProcessing();
}

// Start
requestAnimationFrame(animate);
