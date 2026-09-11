/**
 * A.T.L.A.S. Pixel Wave Canvas2D Renderer
 * Implements the 21st.dev "Custom ASCII art" pixel effect.
 */

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
const cellSize = 13;

// 21st.dev Config (Pixel Wave)
const config = {
    tint: "#3ca6ff",
    pfx: {
        vignette: { enabled: true, intensity: 38 },
        scanLines: { enabled: true, intensity: 60 },
        bloom: { enabled: true, intensity: 60 }
    }
};

const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

function resize() {
    width = canvas.width = bufferCanvas.width = window.innerWidth;
    height = canvas.height = bufferCanvas.height = window.innerHeight;
    
    bufferCtx.fillStyle = '#0D1013';
    bufferCtx.fillRect(0, 0, width, height);
}
window.addEventListener('resize', resize);
resize();

function drawPixelWave(time) {
    // Clear buffer
    bufferCtx.fillStyle = '#0D1013';
    bufferCtx.fillRect(0, 0, width, height);
    
    // Draw grid of pixels
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Wave math (2D sine wave based on time and position)
            // Creates a radial pulsing wave
            const distance = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const wave = Math.sin(distance * 0.005 - time * 0.002) * 0.5 + 0.5;
            
            // Add some secondary waves for complexity
            const wave2 = Math.sin(x * 0.01 + time * 0.001) * Math.cos(y * 0.01 + time * 0.001) * 0.5 + 0.5;
            
            const intensity = (wave * 0.7 + wave2 * 0.3);
            
            // Draw pixel if intensity is somewhat visible
            if (intensity > 0.05) {
                bufferCtx.globalAlpha = intensity;
                bufferCtx.fillStyle = config.tint;
                // Draw a pixel box (leaving 1px gap for grid effect)
                bufferCtx.fillRect(x, y, cellSize - 1, cellSize - 1);
            }
        }
    }
    bufferCtx.globalAlpha = 1.0;
}

function applyPostProcessing() {
    ctx.fillStyle = '#0D1013';
    ctx.fillRect(0, 0, width, height);

    // Base draw
    ctx.drawImage(bufferCanvas, 0, 0);

    // Bloom
    if (config.pfx.bloom.enabled) {
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${(config.pfx.bloom.intensity / 100) * 8}px)`;
        ctx.globalAlpha = (config.pfx.bloom.intensity / 100) * 0.8;
        ctx.drawImage(bufferCanvas, 0, 0);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }

    // Scanlines (High intensity)
    if (config.pfx.scanLines.enabled) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(config.pfx.scanLines.intensity / 100) * 0.6})`;
        for (let i = 0; i < height; i += 4) {
            ctx.fillRect(0, i, width, 2);
        }
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

function animate(currentTime) {
    requestAnimationFrame(animate);
    drawPixelWave(currentTime);
    applyPostProcessing();
}

requestAnimationFrame(animate);
