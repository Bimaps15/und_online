import { useEffect, useRef } from 'react'

interface Leaf {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  rotation: number
  rotationSpeed: number
  oscillationSpeed: number
  oscillationStep: number
  color: string
  veinColor: string
  opacity: number
  type: 'sage' | 'gold'
}

export function FallingLeavesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect reduced motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const sageColors = ['rgba(74, 107, 83, ', 'rgba(98, 138, 109, ', 'rgba(127, 159, 128, ', 'rgba(90, 120, 98, ']
    const goldColors = ['rgba(200, 157, 84, ', 'rgba(212, 189, 127, ', 'rgba(229, 195, 120, ', 'rgba(180, 135, 67, ']

    const leafCount = Math.min(45, Math.floor((width * height) / 25000)) + 15
    const leaves: Leaf[] = []

    const createLeaf = (initialY?: number): Leaf => {
      const isGold = Math.random() < 0.45
      const colorBase = isGold
        ? goldColors[Math.floor(Math.random() * goldColors.length)]
        : sageColors[Math.floor(Math.random() * sageColors.length)]
      const opacity = 0.4 + Math.random() * 0.45

      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : -20 - Math.random() * 100,
        size: 10 + Math.random() * 14,
        speedY: 0.6 + Math.random() * 1.1,
        speedX: 0.2 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        oscillationSpeed: 0.01 + Math.random() * 0.02,
        oscillationStep: Math.random() * Math.PI * 2,
        color: colorBase + opacity + ')',
        veinColor: isGold ? 'rgba(255, 245, 220, 0.6)' : 'rgba(230, 245, 232, 0.6)',
        opacity,
        type: isGold ? 'gold' : 'sage',
      }
    }

    for (let i = 0; i < leafCount; i++) {
      leaves.push(createLeaf(Math.random() * height))
    }

    const drawLeaf = (leaf: Leaf) => {
      ctx.save()
      ctx.translate(leaf.x, leaf.y)
      ctx.rotate(leaf.rotation)

      const s = leaf.size

      // Draw Leaf Body using Bezier Curves
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.8, s * 0.4, 0, s)
      ctx.bezierCurveTo(-s * 0.8, s * 0.4, -s * 0.7, -s * 0.5, 0, -s)
      ctx.fillStyle = leaf.color
      ctx.shadowColor = leaf.type === 'gold' ? 'rgba(200, 157, 84, 0.25)' : 'rgba(0, 0, 0, 0.15)'
      ctx.shadowBlur = 4
      ctx.fill()

      // Draw Center Vein (Midrib)
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.9)
      ctx.quadraticCurveTo(s * 0.1, 0, 0, s * 0.85)
      ctx.strokeStyle = leaf.veinColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Stem
      ctx.beginPath()
      ctx.moveTo(0, s * 0.85)
      ctx.lineTo(0, s * 1.1)
      ctx.strokeStyle = leaf.color
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.restore()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i]
        leaf.oscillationStep += leaf.oscillationSpeed
        leaf.x += Math.sin(leaf.oscillationStep) * leaf.speedX + 0.3
        leaf.y += leaf.speedY
        leaf.rotation += leaf.rotationSpeed

        if (leaf.y > height + 30 || leaf.x > width + 30) {
          leaves[i] = createLeaf()
        }

        drawLeaf(leaf)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
