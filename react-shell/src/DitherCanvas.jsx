import { useEffect, useRef } from 'react'

export default function DitherCanvas() {
  const canvasRef = useRef(null)
  const reqRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    
    let width, height
    const cellSize = 4
    
    const bufferCanvas = document.createElement('canvas')
    const bufferCtx = bufferCanvas.getContext('2d')
    
    const sourceCanvas = document.createElement('canvas')
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })
    
    const img = new Image()
    img.src = '/source_image.png'
    let imgLoaded = false
    img.onload = () => { imgLoaded = true }
    
    const bayer = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ]

    const resize = () => {
      width = canvas.width = bufferCanvas.width = sourceCanvas.width = window.innerWidth
      height = canvas.height = bufferCanvas.height = sourceCanvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const drawDitherPulse = (time) => {
      bufferCtx.clearRect(0, 0, width, height)
      if (!imgLoaded) return
      
      sourceCtx.clearRect(0, 0, width, height)
      const imgSize = Math.min(width, height) * 0.8
      const drawX = (width - imgSize) / 2
      const drawY = (height - imgSize) / 2
      sourceCtx.drawImage(img, drawX, drawY, imgSize, imgSize)
      
      const sourceData = sourceCtx.getImageData(0, 0, width, height).data
      
      const pulse = Math.sin(time * 0.001) * 0.3 + 1.0
      
      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const sampleX = Math.floor(x + cellSize / 2)
          const sampleY = Math.floor(y + cellSize / 2)
          
          if (sampleX < width && sampleY < height) {
            const pixelIndex = (sampleY * width + sampleX) * 4
            const r = sourceData[pixelIndex]
            const g = sourceData[pixelIndex + 1]
            const b = sourceData[pixelIndex + 2]
            const a = sourceData[pixelIndex + 3]
            
            if (a > 10) {
              const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
              const contrastLum = ((lum - 0.5) * 1.58) + 0.5
              const finalLum = contrastLum * pulse
              
              const matrixX = (x / cellSize) % 4
              const matrixY = (y / cellSize) % 4
              const threshold = (bayer[matrixY][matrixX] + 0.5) / 16
              
              if (finalLum > threshold) {
                bufferCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
                bufferCtx.fillRect(x, y, cellSize, cellSize)
              }
            }
          }
        }
      }
    }

    const applyPostProcessing = () => {
      ctx.fillStyle = '#0D1013'
      ctx.fillRect(0, 0, width, height)
      
      if (imgLoaded) {
        ctx.filter = 'blur(22px)'
        ctx.globalAlpha = 0.9
        ctx.drawImage(sourceCanvas, 0, 0)
        ctx.filter = 'none'
        ctx.globalAlpha = 1.0
      }
      ctx.drawImage(bufferCanvas, 0, 0)
    }

    const animate = (currentTime) => {
      reqRef.current = requestAnimationFrame(animate)
      drawDitherPulse(currentTime)
      applyPostProcessing()
    }
    
    reqRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none" 
    />
  )
}
