import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { kitchenTimeline, smooth } from './timeline'

type Update = {
  progress: number
  colour: string
  sheen: 'low-sheen' | 'satin' | 'semi-gloss'
  mode: 'story' | 'showroom'
}

export type KitchenEngine = {
  update: (update: Update) => void
  resize: (width: number, height: number) => void
  setVisible: (visible: boolean) => void
  dispose: () => void
}

type Door = {
  root: THREE.Group
  hardware: THREE.Group
  grime: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  base: THREE.Vector3
  drift: THREE.Vector3
  tilt: number
  inspection: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
}

const DEFAULT_COLOUR = '#74796c'
const tempVec = new THREE.Vector3()

function makeSurfaceTexture(kind: 'marble' | 'window' | 'grime') {
  const canvas = document.createElement('canvas')
  canvas.width = kind === 'marble' ? 512 : 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D texture unavailable')
  let seed = kind === 'marble' ? 12 : 41
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  if (kind === 'marble') {
    ctx.fillStyle = '#e9e5dd'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < 33; i++) {
      const x = random() * canvas.width
      ctx.strokeStyle = i % 3 ? 'rgba(147,139,125,.09)' : 'rgba(131,124,113,.17)'
      ctx.lineWidth = 0.5 + random() * 1.6
      ctx.beginPath()
      ctx.moveTo(x - 90, 260)
      ctx.bezierCurveTo(x + 8, 175, x - 55, 110, x + 110, -20)
      ctx.stroke()
    }
  } else if (kind === 'window') {
    const sky = ctx.createLinearGradient(0, 0, 0, 256)
    sky.addColorStop(0, '#d9e5e3')
    sky.addColorStop(0.62, '#f4eee0')
    sky.addColorStop(1, '#c6d1b8')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 140; i++) {
      const x = random() * 280 - 12
      const y = 80 + random() * 235
      const radius = 4 + random() * 17
      ctx.fillStyle = random() > 0.5 ? 'rgba(72,104,75,.25)' : 'rgba(119,140,94,.22)'
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius * 0.7, random(), 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.clearRect(0, 0, 256, 256)
    for (let i = 0; i < 90; i++) {
      const x = random() * 256
      const y = random() * 256
      const radius = 2 + random() * 13
      ctx.fillStyle = `rgba(94,72,42,${0.025 + random() * 0.065})`
      ctx.beginPath()
      ctx.ellipse(x, y, radius * 0.8, radius * 2.1, random() * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 2
  return texture
}

function revealMaterial(color: string, roughness: number, clearcoat: number, key: string) {
  const cutoff = { value: -8 }
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    clearcoat,
    clearcoatRoughness: Math.max(0.12, roughness * 0.7),
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    envMapIntensity: 0.6,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uKitchenCutoff = cutoff
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vKitchenWorldX;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvKitchenWorldX = (modelMatrix * vec4(transformed, 1.0)).x;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vKitchenWorldX;\nuniform float uKitchenCutoff;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= 1.0 - smoothstep(uKitchenCutoff - 0.065, uKitchenCutoff + 0.065, vKitchenWorldX);')
  }
  material.customProgramCacheKey = () => `kitchen-coat-${key}`
  return { material, cutoff }
}

export function createKitchenEngine(canvas: HTMLCanvasElement, callbacks: { onReady: () => void, onUnavailable: () => void }): KitchenEngine {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  })
  if (!context) throw new Error('WebGL2 unavailable')

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true })
  } catch (error) {
    throw error
  }
  let shaderFailed = false
  renderer.debug.onShaderError = () => { shaderFailed = true }
  renderer.setClearColor(0xf0ede7, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const partialDisposables: Array<{ dispose: () => void }> = []
  try {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#eae5dc')
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80)
  const pmrem = new THREE.PMREMGenerator(renderer)
  partialDisposables.push(pmrem)
  const roomEnvironment = new RoomEnvironment()
  partialDisposables.push(roomEnvironment)
  const environmentTarget = pmrem.fromScene(roomEnvironment)
  partialDisposables.push(environmentTarget)
  const environmentMap = environmentTarget.texture
  roomEnvironment.dispose()
  scene.environment = environmentMap
  scene.environmentIntensity = 0.46

  const roundedCache = new Map<string, THREE.BufferGeometry>()
  const addGeometry = <T extends THREE.BufferGeometry>(geometry: T) => { geometries.add(geometry); return geometry }
  const addMaterial = <T extends THREE.Material>(material: T) => { materials.add(material); return material }
  const rounded = (width: number, height: number, depth: number, radius = 0.012) => {
    const key = `${width}/${height}/${depth}/${radius}`
    let geometry = roundedCache.get(key)
    if (!geometry) {
      geometry = addGeometry(new RoundedBoxGeometry(width, height, depth, 2, Math.min(radius, width / 6, height / 6, depth / 5)))
      roundedCache.set(key, geometry)
    }
    return geometry
  }

  const wall = addMaterial(new THREE.MeshStandardMaterial({ color: '#ded6ca', roughness: 0.96 }))
  const plaster = addMaterial(new THREE.MeshStandardMaterial({ color: '#d8cfbf', roughness: 0.92 }))
  const floorMaterial = addMaterial(new THREE.MeshStandardMaterial({ color: '#ad9272', roughness: 0.72 }))
  const floorLine = addMaterial(new THREE.MeshStandardMaterial({ color: '#9e8a70', roughness: 0.8 }))
  const timber = addMaterial(new THREE.MeshPhysicalMaterial({ color: '#735f49', roughness: 0.51, clearcoat: 0.08 }))
  const cabinetInterior = addMaterial(new THREE.MeshStandardMaterial({ color: '#716d60', roughness: 0.78 }))
  const cabinetFrame = addMaterial(new THREE.MeshPhysicalMaterial({ color: '#c9c1ab', roughness: 0.55, clearcoat: 0.08 }))
  const oldPaint = addMaterial(new THREE.MeshPhysicalMaterial({ color: '#bca98d', roughness: 0.52, clearcoat: 0.1 }))
  const brass = addMaterial(new THREE.MeshPhysicalMaterial({ color: '#ab8650', metalness: 0.84, roughness: 0.3, envMapIntensity: 1.1 }))
  const darkMetal = addMaterial(new THREE.MeshStandardMaterial({ color: '#353530', metalness: 0.5, roughness: 0.38 }))
  const primerCoat = revealMaterial('#e9e6db', 0.86, 0, 'primer')
  const firstCoat = revealMaterial(DEFAULT_COLOUR, 0.46, 0.12, 'first')
  const secondCoat = revealMaterial(DEFAULT_COLOUR, 0.31, 0.27, 'second')
  addMaterial(primerCoat.material)
  addMaterial(firstCoat.material)
  addMaterial(secondCoat.material)

  const marbleTexture = makeSurfaceTexture('marble')
  const windowTexture = makeSurfaceTexture('window')
  const grimeTexture = makeSurfaceTexture('grime')
  textures.add(marbleTexture); textures.add(windowTexture); textures.add(grimeTexture)
  const marble = addMaterial(new THREE.MeshPhysicalMaterial({ map: marbleTexture, roughness: 0.27, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.72 }))
  const glass = addMaterial(new THREE.MeshBasicMaterial({ map: windowTexture, toneMapped: false }))
  const grimeMaterial = addMaterial(new THREE.MeshBasicMaterial({ map: grimeTexture, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))
  const inspectionMaterial = addMaterial(new THREE.MeshBasicMaterial({ color: '#d9c790', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }))
  const clothMaterial = addMaterial(new THREE.MeshStandardMaterial({ color: '#e2dfd4', roughness: 1, side: THREE.DoubleSide }))
  const tapeMaterial = addMaterial(new THREE.MeshStandardMaterial({ color: '#ddd9bb', roughness: 1 }))
  const patchMaterial = addMaterial(new THREE.MeshStandardMaterial({ color: '#eee2ca', roughness: 1, transparent: true, opacity: 0 }))
  const patchEdgeMaterial = addMaterial(new THREE.MeshStandardMaterial({ color: '#8f806c', roughness: 1, transparent: true, opacity: 0 }))

  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, castShadow = true) {
    const object = new THREE.Mesh(geometry, material)
    object.position.set(x, y, z)
    object.castShadow = castShadow
    object.receiveShadow = true
    parent.add(object)
    return object
  }
  function box(parent: THREE.Object3D, width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number, radius = 0.008) {
    return mesh(parent, rounded(width, height, depth, radius), material, x, y, z)
  }

  // Fixed architecture: a single warm residential kitchen around the same cabinet run.
  box(scene, 24, 9, 0.14, wall, 0, 4.25, -2.83, 0.01)
  box(scene, 0.14, 9, 17, plaster, -7.45, 4.25, 4.6, 0.01)
  box(scene, 24, 0.16, 18, floorMaterial, 0, -0.1, 5.6, 0.008)
  for (let i = 0; i < 43; i++) {
    box(scene, 23.85, 0.006, 0.009, floorLine, 0, -0.012, -2.45 + i * 0.39, 0.001).receiveShadow = false
  }
  box(scene, 23.85, 0.14, 0.07, wall, 0, 0.09, -2.68)
  box(scene, 0.06, 8.7, 16.8, wall, -7.36, 4.35, 4.6)

  // Glazed garden window. The softly illustrated view is part of the model, not a fetched asset.
  const windowGroup = new THREE.Group()
  windowGroup.position.set(-3.36, 2.47, -2.72)
  scene.add(windowGroup)
  mesh(windowGroup, addGeometry(new THREE.PlaneGeometry(1.55, 1.48)), glass, 0, 0, 0.016, false)
  box(windowGroup, 1.69, 0.085, 0.11, wall, 0, 0.76, 0.09)
  box(windowGroup, 1.69, 0.085, 0.11, wall, 0, -0.76, 0.09)
  box(windowGroup, 0.085, 1.6, 0.11, wall, -0.82, 0, 0.09)
  box(windowGroup, 0.085, 1.6, 0.11, wall, 0.82, 0, 0.09)
  box(windowGroup, 0.052, 1.5, 0.07, wall, 0, 0, 0.12)
  box(windowGroup, 1.6, 0.05, 0.07, wall, 0, 0.03, 0.12)
  box(windowGroup, 1.84, 0.06, 0.35, marble, 0, -0.83, 0.24)

  // Back cabinetry, marble splashback, benchtop and a few durable kitchen details.
  // Carcasses are shallow open boxes: removed doors expose recesses and shelves.
  box(scene, 4.75, 0.86, 0.065, cabinetInterior, -0.21, 0.48, -2.67)
  box(scene, 4.75, 0.055, 0.65, cabinetFrame, -0.21, 0.08, -2.34)
  box(scene, 4.75, 0.055, 0.65, cabinetFrame, -0.21, 0.88, -2.34)
  for (let i = 0; i <= 6; i++) {
    const x = -2.44 + i * 0.745
    box(scene, 0.044, 0.77, 0.65, cabinetFrame, x, 0.48, -2.34)
  }
  for (let i = 0; i < 6; i++) {
    box(scene, 0.7, 0.032, 0.6, cabinetFrame, -2.09 + i * 0.75, 0.45, -2.34)
  }
  box(scene, 4.84, 0.13, 0.92, marble, -0.21, 0.98, -2.18, 0.018)
  box(scene, 4.84, 0.9, 0.055, marble, -0.21, 1.49, -2.68)
  box(scene, 4.72, 0.075, 0.055, plaster, -0.21, 1.96, -2.61)
  box(scene, 3.63, 0.92, 0.055, cabinetInterior, -0.28, 2.53, -2.69)
  box(scene, 3.7, 0.06, 0.59, cabinetFrame, -0.28, 2.06, -2.4)
  box(scene, 3.7, 0.06, 0.59, cabinetFrame, -0.28, 3.01, -2.4)
  for (let i = 0; i <= 5; i++) {
    box(scene, 0.044, 0.91, 0.59, cabinetFrame, -2.09 + i * 0.72, 2.53, -2.4)
  }
  for (let i = 0; i < 5; i++) {
    box(scene, 0.68, 0.026, 0.55, cabinetFrame, -1.76 + i * 0.72, 2.52, -2.4)
  }
  box(scene, 0.87, 3.32, 0.065, cabinetInterior, 2.58, 1.71, -2.75)
  for (const x of [2.14, 3.02]) box(scene, 0.055, 3.32, 0.69, cabinetFrame, x, 1.71, -2.39)
  for (const y of [0.04, 1.65, 3.32]) box(scene, 0.88, 0.055, 0.69, cabinetFrame, 2.58, y, -2.39)
  for (const y of [0.77, 2.25]) box(scene, 0.81, 0.032, 0.62, cabinetFrame, 2.58, y, -2.39)
  box(scene, 0.92, 0.09, 0.81, cabinetFrame, 2.58, 3.4, -2.41)
  box(scene, 4.75, 0.12, 0.13, cabinetFrame, -0.21, 0.13, -1.92)

  // Sink, curved brass faucet, cooktop and restrained accessories keep scale legible.
  box(scene, 0.94, 0.014, 0.48, darkMetal, -1.37, 1.053, -2.08, 0.012)
  box(scene, 0.77, 0.01, 0.34, cabinetInterior, -1.37, 1.064, -2.08)
  const faucetCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.54, 1.07, -1.81), new THREE.Vector3(-1.54, 1.32, -1.81),
    new THREE.Vector3(-1.42, 1.45, -1.81), new THREE.Vector3(-1.29, 1.39, -1.81),
    new THREE.Vector3(-1.29, 1.25, -1.81),
  ])
  mesh(scene, addGeometry(new THREE.TubeGeometry(faucetCurve, 20, 0.019, 7, false)), brass, 0, 0, 0)
  const burner = addGeometry(new THREE.TorusGeometry(0.092, 0.006, 5, 26))
  box(scene, 0.76, 0.025, 0.46, darkMetal, 0.66, 1.06, -2.18, 0.013)
  for (const bx of [0.44, 0.88]) for (const bz of [-2.32, -2.06]) {
    const ring = mesh(scene, burner, cabinetFrame, bx, 1.077, bz, false)
    ring.rotation.x = -Math.PI / 2
  }
  box(scene, 0.34, 0.49, 0.14, timber, 1.34, 1.31, -2.48, 0.014).rotation.z = -0.08
  const decorGreen = addMaterial(new THREE.MeshStandardMaterial({ color: '#526449', roughness: 0.94 }))
  box(scene, 0.16, 0.18, 0.16, plaster, 1.86, 1.12, -2.39, 0.025)
  for (let i = 0; i < 5; i++) {
    const leaf = mesh(scene, addGeometry(new THREE.SphereGeometry(0.1, 7, 5)), decorGreen, 1.86 + Math.sin(i * 2) * 0.1, 1.26 + (i % 3) * 0.09, -2.39 + Math.cos(i * 2) * 0.08, false)
    leaf.scale.set(0.45, 1.1, 0.34)
    leaf.rotation.z = Math.sin(i * 2) * 0.65
  }

  const doors: Door[] = []
  const patches = new THREE.Group()
  const patchPieces: THREE.Mesh[] = []
  const patchShape = new THREE.Shape()
  patchShape.moveTo(-1, -0.18)
  patchShape.lineTo(-0.67, -0.54)
  patchShape.lineTo(-0.23, -0.42)
  patchShape.lineTo(0.1, -0.61)
  patchShape.lineTo(0.48, -0.35)
  patchShape.lineTo(0.91, -0.27)
  patchShape.lineTo(0.76, 0.25)
  patchShape.lineTo(0.36, 0.43)
  patchShape.lineTo(-0.12, 0.32)
  patchShape.lineTo(-0.59, 0.5)
  patchShape.lineTo(-0.94, 0.24)
  patchShape.closePath()
  const patchGeometry = addGeometry(new THREE.ShapeGeometry(patchShape))
  const doorPanelGeometry = addGeometry(new THREE.PlaneGeometry(1, 1))
  function paintedPart(parent: THREE.Group, geometry: THREE.BufferGeometry, x: number, y: number, z: number) {
    mesh(parent, geometry, oldPaint, x, y, z)
    mesh(parent, geometry, primerCoat.material, x, y, z + 0.003).castShadow = false
    mesh(parent, geometry, firstCoat.material, x, y, z + 0.006).castShadow = false
    mesh(parent, geometry, secondCoat.material, x, y, z + 0.009).castShadow = false
  }
  function shakerDoor(x: number, y: number, z: number, width: number, height: number, index: number, handleSide = 1) {
    const root = new THREE.Group()
    root.position.set(x, y, z)
    scene.add(root)
    const rail = Math.min(width * 0.18, 0.115)
    const frameDepth = 0.066
    // Four substantial rails stand forward of an inset panel; rounded edges catch real light.
    paintedPart(root, rounded(width, rail, frameDepth, 0.01), 0, (height - rail) / 2, 0)
    paintedPart(root, rounded(width, rail, frameDepth, 0.01), 0, -(height - rail) / 2, 0)
    paintedPart(root, rounded(rail, height - rail * 2, frameDepth, 0.01), (width - rail) / 2, 0, 0)
    paintedPart(root, rounded(rail, height - rail * 2, frameDepth, 0.01), -(width - rail) / 2, 0, 0)
    paintedPart(root, rounded(width - rail * 2 + 0.01, height - rail * 2 + 0.01, 0.02, 0.005), 0, 0, -0.004)

    const hardware = new THREE.Group()
    root.add(hardware)
    const handleX = handleSide * (width / 2 - 0.105)
    const handleY = height > 1.2 ? 0 : (y > 1.55 ? -height * 0.29 : height * 0.29)
    const handle = new THREE.Group()
    handle.position.set(handleX, handleY, 0.049)
    hardware.add(handle)
    const pull = mesh(handle, addGeometry(new THREE.CylinderGeometry(0.018, 0.018, height > 1.2 ? 0.31 : 0.14, 10)), brass, 0, 0, 0.045)
    pull.castShadow = true
    for (const py of [-0.04, 0.04]) {
      mesh(handle, addGeometry(new THREE.CylinderGeometry(0.013, 0.013, 0.055, 8)), brass, 0, py, 0.02).rotation.x = Math.PI / 2
    }
    const hingeX = -handleSide * (width / 2 - 0.024)
    for (const hy of [-height * 0.29, height * 0.29]) {
      box(hardware, 0.035, 0.092, 0.027, brass, hingeX, hy, 0.037, 0.006)
      mesh(hardware, addGeometry(new THREE.CylinderGeometry(0.007, 0.007, 0.105, 7)), brass, hingeX + handleSide * 0.018, hy, 0.046)
    }
    const grime = mesh(root, doorPanelGeometry, grimeMaterial, 0, 0, 0.018, false) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    grime.scale.set(width - rail * 2, height - rail * 2, 1)
    const inspection = mesh(root, doorPanelGeometry, inspectionMaterial, 0, 0, 0.05, false) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    inspection.scale.set(width - 0.025, height - 0.025, 1)
    const drift = new THREE.Vector3((index % 2 ? 1 : -1) * (0.2 + (index % 3) * 0.075), index < 6 ? 0.13 : -0.1, 0.36 + (index % 3) * 0.065)
    doors.push({ root, hardware, grime, base: new THREE.Vector3(x, y, z), drift, tilt: (index % 2 ? 1 : -1) * (0.045 + (index % 3) * 0.02), inspection })
    return root
  }

  for (let i = 0; i < 5; i++) shakerDoor(-1.76 + i * 0.72, 2.53, -2.085, 0.68, 0.78, i, i % 2 ? -1 : 1)
  for (let i = 0; i < 6; i++) shakerDoor(-2.09 + i * 0.75, 0.54, -1.945, 0.7, 0.67, i + 5, i % 2 ? -1 : 1)
  shakerDoor(2.58, 2.62, -1.99, 0.75, 1.38, 11, -1)
  shakerDoor(2.58, 0.85, -1.99, 0.75, 1.52, 12, -1)

  // The workroom detail uses this exact door, moved with the others—not a substituted render.
  const selected = doors[3]
  selected.root.add(patches)
  for (const [px, py, sx, sy, rotation] of [
    [-0.08, 0.11, 0.13, 0.065, 0.3], [0.1, -0.12, 0.08, 0.046, -0.15], [0.035, 0.2, 0.06, 0.03, 0.5],
  ]) {
    const edge = mesh(patches, patchGeometry, patchEdgeMaterial, px, py, 0.023, false)
    edge.scale.set(sx * 1.19, sy * 1.36, 1)
    edge.rotation.z = rotation
    const patch = mesh(patches, patchGeometry, patchMaterial, px, py, 0.03, false)
    patch.scale.set(sx, sy, 1)
    patch.rotation.z = rotation
    patchPieces.push(patch)
  }
  const sandingLight = addMaterial(new THREE.MeshBasicMaterial({ color: '#f5e8cd', transparent: true, opacity: 0, depthWrite: false }))
  const sandingSweep = mesh(selected.root, addGeometry(new THREE.PlaneGeometry(0.13, 0.44)), sandingLight, -0.18, 0, 0.032, false)

  const masks = new THREE.Group()
  scene.add(masks)
  const counterCloth = box(masks, 4.55, 0.014, 0.79, clothMaterial, -0.21, 1.058, -2.18, 0.005)
  const floorCloth = box(masks, 5.35, 0.012, 1.26, clothMaterial, 0.21, 0.004, -0.7, 0.003)
  const counterTape = box(masks, 4.6, 0.007, 0.018, tapeMaterial, -0.21, 1.073, -1.77, 0.002)
  const floorTape = box(masks, 5.35, 0.007, 0.02, tapeMaterial, 0.21, 0.014, -0.06, 0.002)

  // Narrow island and pendant lighting add depth while leaving the painted run visible.
  box(scene, 1.45, 0.73, 0.58, cabinetFrame, -2.43, 0.43, 0.95, 0.018)
  box(scene, 1.58, 0.09, 0.69, marble, -2.43, 0.86, 0.95, 0.015)
  const shadePoints = [
    new THREE.Vector2(0.29, 0), new THREE.Vector2(0.25, 0.04), new THREE.Vector2(0.16, 0.19),
    new THREE.Vector2(0.08, 0.29), new THREE.Vector2(0.035, 0.33),
  ]
  const pendantShade = addGeometry(new THREE.LatheGeometry(shadePoints, 24))
  const bulbMat = addMaterial(new THREE.MeshBasicMaterial({ color: '#fff2cd' }))
  for (const x of [-1.48, 0.9]) {
    box(scene, 0.009, 0.51, 0.009, darkMetal, x, 3.97, -0.58, 0.002)
    mesh(scene, pendantShade, brass, x, 3.39, -0.58)
    mesh(scene, addGeometry(new THREE.SphereGeometry(0.075, 12, 8)), bulbMat, x, 3.43, -0.58, false)
  }

  const hemisphere = new THREE.HemisphereLight('#fff4e6', '#a9977d', 0.85)
  scene.add(hemisphere)
  const sun = new THREE.DirectionalLight('#ffefd8', 1.75)
  sun.position.set(-3.7, 5.8, 4.3)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6
  sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5
  sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 18
  sun.shadow.bias = -0.0002
  sun.shadow.normalBias = 0.025
  sun.shadow.radius = 3
  sun.target.position.set(0, 1.3, -1.5)
  scene.add(sun, sun.target)
  const fill = new THREE.DirectionalLight('#dce8ed', 0.35)
  fill.position.set(4, 3, 4)
  scene.add(fill)

  let visible = true
  let disposed = false
  let ready = false
  let frame = 0
  let width = 0
  let height = 0
  let last: Update = { progress: 0, colour: DEFAULT_COLOUR, sheen: 'satin', mode: 'story' }
  const look = new THREE.Vector3()
  const widePosition = new THREE.Vector3(4.9, 3.05, 9.3)
  const wideLook = new THREE.Vector3(-1.38, 1.62, -1.9)
  const showroomPosition = new THREE.Vector3(2.65, 2.67, 6.52)
  const showroomLook = new THREE.Vector3(0.25, 1.66, -1.89)
  const detailPosition = new THREE.Vector3(2.45, 2.93, 1.45)
  const detailLook = new THREE.Vector3(0.43, 2.5, -1.34)

  const render = () => {
    frame = 0
    if (disposed || !visible || width < 2 || height < 2) return
    try {
      renderer.render(scene, camera)
      if (shaderFailed) throw new Error('Kitchen shader compilation failed')
      if (!ready) {
        ready = true
        callbacks.onReady()
      }
    } catch {
      callbacks.onUnavailable()
    }
  }
  const requestRender = () => {
    if (!frame && !disposed && visible) frame = requestAnimationFrame(render)
  }
  const apply = (update: Update) => {
    const timeline = kitchenTimeline(update.progress)
    const separation = timeline.separated
    const colour = /^#[\da-fA-F]{6}$/.test(update.colour) ? update.colour : DEFAULT_COLOUR
    const baseColour = new THREE.Color(colour)
    cabinetFrame.color.copy(new THREE.Color('#c9c1ab')).lerp(new THREE.Color('#e9e6db'), timeline.primer * (1 - timeline.firstCoat))
    cabinetFrame.color.lerp(baseColour, timeline.firstCoat)
    firstCoat.material.color.copy(baseColour).lerp(new THREE.Color('#d6d0c3'), 0.14)
    secondCoat.material.color.copy(baseColour)
    const roughness = update.sheen === 'low-sheen' ? 0.48 : update.sheen === 'semi-gloss' ? 0.19 : 0.3
    firstCoat.material.roughness = Math.min(0.67, roughness + 0.16)
    secondCoat.material.roughness = roughness
    secondCoat.material.clearcoat = update.sheen === 'low-sheen' ? 0.12 : update.sheen === 'semi-gloss' ? 0.42 : 0.27
    // A left-to-right shader wipe coats the same physical shaker geometry twice.
    primerCoat.cutoff.value = -5 + timeline.primer * 10
    firstCoat.cutoff.value = -5 + timeline.firstCoat * 10
    secondCoat.cutoff.value = -5 + timeline.secondCoat * 10
    primerCoat.material.visible = timeline.primer > 0.001 && timeline.secondCoat < 0.999
    firstCoat.material.visible = timeline.firstCoat > 0.001 && timeline.secondCoat < 0.999
    secondCoat.material.visible = timeline.secondCoat > 0.001
    grimeMaterial.opacity = 0.75 * (1 - timeline.cleaning)
    inspectionMaterial.opacity = 0.075 * timeline.inspection
    patchMaterial.opacity = 0.93 * timeline.patch
    patchEdgeMaterial.opacity = 0.42 * timeline.patch
    patches.visible = timeline.patch > 0.002
    sandingLight.opacity = timeline.closeup * 0.11
    sandingSweep.position.x = -0.19 + timeline.sanding * 0.36
    sandingSweep.visible = timeline.closeup > 0.002
    for (let i = 0; i < doors.length; i++) {
      const door = doors[i]
      const stagger = smooth((separation * 1.19 - i * 0.018) / 0.91)
      door.root.position.copy(door.base).addScaledVector(door.drift, stagger)
      door.root.rotation.y = door.tilt * stagger
      door.root.rotation.x = -0.025 * stagger
      door.hardware.position.x = (i % 2 ? 1 : -1) * stagger * 0.085
      door.hardware.position.z = stagger * 0.16
      door.grime.visible = grimeMaterial.opacity > 0.002
      door.inspection.visible = inspectionMaterial.opacity > 0.002 && i % 2 === 0
    }
    const protect = timeline.masking
    masks.visible = protect > 0.002
    counterCloth.scale.x = Math.max(0.001, protect)
    floorCloth.scale.x = Math.max(0.001, protect)
    counterTape.scale.x = Math.max(0.001, protect)
    floorTape.scale.x = Math.max(0.001, protect)
    counterCloth.position.x = -0.21 - (1 - protect) * 2.275
    floorCloth.position.x = 0.21 - (1 - protect) * 2.675
    counterTape.position.x = counterCloth.position.x
    floorTape.position.x = floorCloth.position.x

    const roomShift = update.mode === 'showroom' ? 0 : Math.sin(Math.min(timeline.progress, 2) * 0.7) * 0.09
    camera.position.copy(update.mode === 'showroom' ? showroomPosition : widePosition)
    camera.position.x += roomShift
    camera.position.lerp(detailPosition, timeline.closeup)
    look.copy(update.mode === 'showroom' ? showroomLook : wideLook).lerp(detailLook, timeline.closeup)
    if (update.mode === 'story' && width < 700) {
      look.x += 1.1
    }
    if (timeline.cure > 0) {
      sun.intensity = 1.75 + 0.16 * timeline.cure
    } else sun.intensity = 1.75
    camera.lookAt(look)
    camera.updateProjectionMatrix()
    requestRender()
  }

  return {
    update(update) {
      if (disposed) return
      last = update
      apply(update)
    },
    resize(nextWidth, nextHeight) {
      if (disposed) return
      width = Math.max(0, nextWidth)
      height = Math.max(0, nextHeight)
      if (width < 2 || height < 2) return
      const mobile = width < 700 || window.matchMedia('(max-width: 700px)').matches
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.fov = width < 560 ? 49 : width < 840 ? 42 : 35
      camera.updateProjectionMatrix()
      apply(last)
    },
    setVisible(nextVisible) {
      visible = nextVisible
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0 }
      if (visible) requestRender()
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      for (const texture of textures) texture.dispose()
      environmentTarget.dispose()
      sun.shadow.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      scene.clear()
      tempVec.set(0, 0, 0)
      patchPieces.length = 0
      doors.length = 0
    },
  }
  } catch (error) {
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    for (const texture of textures) texture.dispose()
    for (const item of partialDisposables.reverse()) item.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    throw error
  }
}
