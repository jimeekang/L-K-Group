'use client'

import { useEffect, useRef } from 'react'

export type KitchenSceneProps = {
  /** Continuous, reversible story position: inspection 0 through finished 9. */
  progress: number
  colour?: string
  sheen?: 'low-sheen' | 'satin' | 'semi-gloss'
  className?: string
  mode?: 'story' | 'showroom'
  onReady?: () => void
  onUnavailable?: () => void
}

export function KitchenScene({
  progress,
  colour = '#74796c',
  sheen = 'satin',
  className,
  mode = 'story',
  onReady,
  onUnavailable,
}: KitchenSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<import('./kitchen-engine').KitchenEngine | null>(null)
  const propsRef = useRef({ progress, colour, sheen, mode })
  const callbacksRef = useRef({ onReady, onUnavailable })

  useEffect(() => {
    propsRef.current = { progress, colour, sheen, mode }
    engineRef.current?.update(propsRef.current)
  }, [progress, colour, sheen, mode])

  useEffect(() => {
    callbacksRef.current = { onReady, onUnavailable }
  }, [onReady, onUnavailable])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let disposed = false
    let unavailable = false
    let intersecting = true
    let observer: IntersectionObserver | undefined
    let resizeObserver: ResizeObserver | undefined

    const fail = () => {
      if (disposed || unavailable) return
      unavailable = true
      engineRef.current?.dispose()
      engineRef.current = null
      callbacksRef.current.onUnavailable?.()
    }

    const contextLost = (event: Event) => {
      event.preventDefault()
      fail()
    }
    canvas.addEventListener('webglcontextlost', contextLost)

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        intersecting = entries[0]?.isIntersecting ?? false
        engineRef.current?.setVisible(intersecting)
      }, { rootMargin: '240px' })
      observer.observe(container)
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        engineRef.current?.resize(container.clientWidth, container.clientHeight)
      })
      resizeObserver.observe(container)
    }

    // This import keeps Three.js outside the initial route bundle.
    void import('./kitchen-engine').then(({ createKitchenEngine }) => {
      if (disposed || unavailable) return
      try {
        const engine = createKitchenEngine(canvas, {
          onReady: () => callbacksRef.current.onReady?.(),
          onUnavailable: fail,
        })
        engineRef.current = engine
        engine.setVisible(intersecting)
        engine.resize(container.clientWidth, container.clientHeight)
        engine.update(propsRef.current)
      } catch {
        fail()
      }
    }).catch(fail)

    return () => {
      disposed = true
      observer?.disconnect()
      resizeObserver?.disconnect()
      canvas.removeEventListener('webglcontextlost', contextLost)
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
