import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function Globe({ coordinates, activeView, onGlobeReady, globeRef }) {
  const scene = useRef(null)
  const camera = useRef(null)
  const renderer = useRef(null)
  const earth = useRef(null)
  const controls = useRef(null)
  const marker = useRef(null)
  const stars = useRef(null) // Ref for the stars sphere

  // Function to get texture URL based on active view
  const getTextureUrl = () => {
    switch(activeView) {
      case 'satellite':
        return 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      case 'night':
        return 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
      case 'topology':
        return 'https://unpkg.com/three-globe/example/img/earth-topology.png'
      default:
        return 'https://unpkg.com/three-globe/example/img/earth-day.jpg'
    }
  }

  // Initialize the scene
  useEffect(() => {
    if (!globeRef.current) return

    // Setup scene
    scene.current = new THREE.Scene()
    camera.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    renderer.current = new THREE.WebGLRenderer({ antialias: true })

    // Configure renderer
    renderer.current.setSize(window.innerWidth, window.innerHeight)
    renderer.current.setPixelRatio(window.devicePixelRatio)
    globeRef.current.innerHTML = ''
    globeRef.current.appendChild(renderer.current.domElement)

    // Set black background - this will be mostly covered by the stars now
    scene.current.background = new THREE.Color(0x000000)

    // Position camera
    camera.current.position.z = 15

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.current.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 3, 5)
    scene.current.add(directionalLight)

    // Create Earth
    const geometry = new THREE.SphereGeometry(5, 64, 64)
    const loader = new THREE.TextureLoader()
    
    loader.load(getTextureUrl(), (texture) => {
      texture.anisotropy = 16
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
      })
      
      earth.current = new THREE.Mesh(geometry, material)
      scene.current.add(earth.current)

      // Add marker
      const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      marker.current = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.current.visible = false
      scene.current.add(marker.current)

      // Setup controls
      controls.current = new OrbitControls(camera.current, renderer.current.domElement)
      controls.current.enableDamping = true
      controls.current.dampingFactor = 0.05
      controls.current.rotateSpeed = 0.5
      controls.current.minDistance = 8
      controls.current.maxDistance = 30
      controls.current.enablePan = false
      controls.current.enableZoom = true
      controls.current.zoomSpeed = 0.6
      controls.current.autoRotate = true
      controls.current.autoRotateSpeed = 0.8 // Adjust speed as desired

      onGlobeReady()
    })

    // ADDED: Create and add stars background
    const starGeometry = new THREE.SphereGeometry(200, 32, 32); // Large sphere for stars
    const starLoader = new THREE.TextureLoader();
    starLoader.load('https://unpkg.com/three-globe/example/img/night-sky.png', (starTexture) => {
      const starMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
        side: THREE.BackSide, // Render on the inside of the sphere
        transparent: true,
        opacity: 0.8 // Adjust opacity if needed
      });
      stars.current = new THREE.Mesh(starGeometry, starMaterial);
      scene.current.add(stars.current);
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)
      
      // Update controls
      if (controls.current) {
        controls.current.update()
      }

      // Rotate stars slightly for a dynamic feel, independent of globe
      if (stars.current) {
        stars.current.rotation.y += 0.0001;
        stars.current.rotation.x += 0.00005;
      }

      // Render the scene
      if (renderer.current && scene.current && camera.current) {
        renderer.current.render(scene.current, camera.current)
      }
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (camera.current && renderer.current) {
        camera.current.aspect = window.innerWidth / window.innerHeight
        camera.current.updateProjectionMatrix()
        renderer.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (earth.current) {
        earth.current.geometry.dispose()
        earth.current.material.dispose()
      }
      if (stars.current) { // Cleanup stars
        stars.current.geometry.dispose()
        stars.current.material.dispose()
      }
      if (controls.current) {
        controls.current.dispose()
      }
      if (globeRef.current) {
        globeRef.current.innerHTML = ''
      }
      scene.current = null
      camera.current = null
      renderer.current = null
      earth.current = null
      controls.current = null
      stars.current = null // Nullify stars ref
    }
  }, [])

  // Update marker position when coordinates change
  useEffect(() => {
    if (!earth.current || !marker.current || !coordinates) return

    const phi = (90 - coordinates.lat) * (Math.PI / 180)
    const theta = (coordinates.lng + 180) * (Math.PI / 180)
    const radius = 5.1

    const position = new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )

    marker.current.position.copy(position)
    marker.current.visible = true
  }, [coordinates])

  // Update texture when view changes
  useEffect(() => {
    if (!earth.current) return

    const loader = new THREE.TextureLoader()
    loader.load(getTextureUrl(), (texture) => {
      texture.anisotropy = 16
      if (earth.current.material) {
        earth.current.material.map = texture
        earth.current.material.bumpMap = texture
        earth.current.material.needsUpdate = true
      }
    })
  }, [activeView])

  return null
}