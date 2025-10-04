import { useEffect } from 'react'
import { Map as OLMap, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'
import { Point } from 'ol/geom'
import Feature from 'ol/Feature'
import { defaults as defaultControls, FullScreen, ZoomSlider, Control } from 'ol/control'
import Modify from 'ol/interaction/Modify'

export default function Map({
  mapRef,
  coordinates,
  setCoordinates,
  activeView,
  vectorSource,
  vectorLayer,
  map,
  setShowPredictionControls,
  setIsFullScreen
}) {
  useEffect(() => {
    if (!mapRef.current || !coordinates) return

    // Create vector source and layer if they don't exist
    if (!vectorSource.current) {
      vectorSource.current = new VectorSource()
      vectorLayer.current = new VectorLayer({
        source: vectorSource.current,
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23FF0000" d="M12 0C7.6 0 4 3.6 4 8c0 7 8 16 8 16s8-9 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>',
            scale: 1.2,
            cursor: 'move'
          })
        })
      })
    }

    // Create custom controls
    const customControls = document.createElement('div')
    customControls.className = 'ol-control custom-map-controls'
    
    // GPS location button
    const gpsButton = document.createElement('button')
    gpsButton.innerHTML = '📍'
    gpsButton.title = 'Find my location'
    gpsButton.onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCoordinates(coords)
          map.current.getView().animate({
            center: fromLonLat([coords.lng, coords.lat]),
            zoom: 12
          })
          updateMarker(coords)
          setShowPredictionControls(true)
        })
      }
    }
    customControls.appendChild(gpsButton)

    // Initialize map
    map.current = new OLMap({
      target: mapRef.current,
      layers: [
        // Base map layer
        new TileLayer({
          source: new XYZ({
            url: activeView === 'satellite' 
              ? 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'  // Google Satellite
              : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',     // OpenStreetMap
            maxZoom: 19,
            crossOrigin: 'anonymous',
            attributions: activeView === 'satellite' 
              ? '© Google Maps'
              : '© OpenStreetMap contributors'
          })
        }),
        vectorLayer.current
      ],
      view: new View({
        center: fromLonLat([coordinates.lng, coordinates.lat]),
        zoom: 12,
        minZoom: 2,
        maxZoom: 19
      }),
      controls: defaultControls().extend([
        new FullScreen({
          source: document.querySelector('.visualization-container'),
          callback: (isFullScreen) => setIsFullScreen(isFullScreen)
        }),
        new ZoomSlider()
      ])
    })

    // Add custom controls to map
    map.current.addControl(new Control({ element: customControls }))

    // Add modify interaction for marker dragging
    const modify = new Modify({
      source: vectorSource.current,
      hitDetection: vectorLayer.current
    })
    map.current.addInteraction(modify)

    // Handle marker drag events
    modify.on('modifyend', (event) => {
      const feature = event.features.getArray()[0]
      const coords = feature.getGeometry().getCoordinates()
      const lonLat = toLonLat(coords)
      setCoordinates({
        lat: lonLat[1],
        lng: lonLat[0]
      })
    })

    // Update marker position
    updateMarker(coordinates)

    return () => {
      if (map.current) {
        map.current.setTarget(undefined)
      }
    }
  }, [coordinates, activeView])

  const updateMarker = (coords) => {
    if (!vectorSource.current) return

    vectorSource.current.clear()
    const marker = new Feature({
      geometry: new Point(fromLonLat([coords.lng, coords.lat])),
      draggable: true
    })
    vectorSource.current.addFeature(marker)
  }

  return null
}