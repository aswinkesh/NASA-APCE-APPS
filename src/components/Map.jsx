import { useEffect } from 'react'
import { Map as OLMap, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import styles from './Map.module.css'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'
import { Point } from 'ol/geom'
import Feature from 'ol/Feature'
import { defaults as defaultControls, FullScreen, ZoomSlider, Control } from 'ol/control'
import Modify from 'ol/interaction/Modify'

import axios from 'axios';

export default function Map({
  mapRef,
  coordinates,
  setCoordinates,
  activeView,
  vectorSource,
  vectorLayer,
  map,
  setShowPredictionControls,
  setIsFullScreen,
  setLocationName
}) {
  // Configure tile layers for different views
  const getTileLayer = () => {
    const configs = {
      standard: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      },
      satellite: {
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        maxZoom: 19,
        attribution: '© Google Maps'
      },
      night: {
        url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        maxZoom: 19,
        attribution: '© CARTO'
      },
      topology: {
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        maxZoom: 17,
        attribution: '© OpenTopoMap (CC-BY-SA)'
      }
    }

    const config = configs[activeView] || configs.standard
    return new TileLayer({
      source: new XYZ({
        url: config.url,
        maxZoom: config.maxZoom,
        crossOrigin: 'anonymous',
        attributions: config.attribution
      })
    })
  }

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
    customControls.className = `ol-control ${styles.customMapControls}`
    
    // Zoom in button
    const zoomInButton = document.createElement('button')
    zoomInButton.className = styles.controlButton
    zoomInButton.innerHTML = '+'
    zoomInButton.title = 'Zoom in'
    zoomInButton.onclick = () => {
      const view = map.current.getView()
      view.animate({
        zoom: view.getZoom() + 1,
        duration: 250
      })
    }
    customControls.appendChild(zoomInButton)

    // Zoom out button
    const zoomOutButton = document.createElement('button')
    zoomOutButton.className = styles.controlButton
    zoomOutButton.innerHTML = '−'
    zoomOutButton.title = 'Zoom out'
    zoomOutButton.onclick = () => {
      const view = map.current.getView()
      view.animate({
        zoom: view.getZoom() - 1,
        duration: 250
      })
    }
    customControls.appendChild(zoomOutButton)

    // Full screen button
    const fullScreenButton = document.createElement('button')
    fullScreenButton.className = styles.controlButton
    fullScreenButton.innerHTML = '⛶'
    fullScreenButton.title = 'Toggle full screen'
    fullScreenButton.onclick = () => {
      const element = document.querySelector('.visualization-container')
      if (!document.fullscreenElement) {
        element.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
    customControls.appendChild(fullScreenButton)

    // GPS location button
    const gpsButton = document.createElement('button')
    gpsButton.className = styles.controlButton
    gpsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>'
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

    // Add click handler to map
    map.current?.on('click', async (event) => {
      const coords = map.current.getCoordinates(event.pixel)
      const lonLat = toLonLat(coords)
      const newCoords = {
        lat: lonLat[1],
        lng: lonLat[0]
      }
      setCoordinates(newCoords)
      updateMarker(newCoords)
      await getLocationName(newCoords)
      setShowPredictionControls(true)
    })

    // Initialize map
    map.current = new OLMap({
      target: mapRef.current,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      layers: [
        getTileLayer(),
        // Vector layer for markers
        vectorLayer.current
      ],
      view: new View({
        center: fromLonLat([coordinates.lng, coordinates.lat]),
        zoom: activeView === 'night' ? 4 : 12,
        minZoom: activeView === 'night' ? 2 : 3,
        maxZoom: activeView === 'night' ? 8 : 19,
        constrainResolution: true
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
    modify.on('modifyend', async (event) => {
      const feature = event.features.getArray()[0]
      const coords = feature.getGeometry().getCoordinates()
      const lonLat = toLonLat(coords)
      const newCoords = {
        lat: lonLat[1],
        lng: lonLat[0]
      }
      setCoordinates(newCoords)
      await getLocationName(newCoords)
      setShowPredictionControls(true)
    })

    // Update marker position and show prediction controls
    updateMarker(coordinates)
    setShowPredictionControls(true)

    return () => {
      if (map.current) {
        map.current.setTarget(undefined)
      }
    }
  }, [coordinates, activeView])

  const getLocationName = async (coords) => {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat: coords.lat,
            lon: coords.lng,
            format: 'json',
          },
          headers: {
            'User-Agent': 'WeatherApp/1.0'
          }
        }
      );
      
      if (response.data && response.data.display_name) {
        setLocationName(response.data.display_name);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

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