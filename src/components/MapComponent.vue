<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import type { Location } from '@/types'

let leaflet: typeof import('leaflet') | null = null
let map: import('leaflet').Map | null = null

const props = defineProps<{
  origin: Location
  destination: Location
  height?: string
}>()

const mapId = `map-${Math.random().toString(36).slice(2)}`

async function initMap() {
  if (!leaflet) {
    leaflet = await import('leaflet')
    // Fix default icon paths for Vite
  delete (leaflet.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    leaflet.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }

  if (map) { map.remove(); map = null }

  map = leaflet.map(mapId, { zoomControl: true })
  leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  const L = leaflet
  const origin = L.latLng(props.origin.lat, props.origin.lng)
  const dest   = L.latLng(props.destination.lat, props.destination.lng)

  const greenIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;background:#fbbf24;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    iconSize: [14, 14], iconAnchor: [7, 7],
  })
  const redIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    iconSize: [14, 14], iconAnchor: [7, 7],
  })

  L.marker(origin, { icon: greenIcon }).addTo(map).bindPopup(`📍 ${props.origin.address}`)
  L.marker(dest, { icon: redIcon }).addTo(map).bindPopup(`🏁 ${props.destination.address}`)

  const bounds = L.latLngBounds([origin, dest])
  map.fitBounds(bounds, { padding: [40, 40] })
}

onMounted(() => setTimeout(initMap, 100))
onUnmounted(() => { if (map) { map.remove(); map = null } })
watch(() => [props.origin, props.destination], initMap, { deep: true })
</script>

<template>
  <div
    :id="mapId"
    class="w-full rounded-xl overflow-hidden border border-white/10"
    :style="{ height: height || '220px' }"
  ></div>
</template>
