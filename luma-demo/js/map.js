// map.js - simulated tracking with Leaflet - Enhanced delivery tracking

let map, deliveryMarker, originMarker, destinationMarker, routeLine, progressLine;
let route = [
  [40.7128, -74.0060],  // Warehouse/Origin
  [40.7162, -74.0015],
  [40.7198, -73.9980],
  [40.7235, -73.9925],
  [40.7268, -73.9890]   // Customer/Destination
];
let currentPosition = 0;
let animationInterval = null;
let speedMs = 1500; // interval in ms (faster for better UX)
let isDelivered = false;

// Create custom icon for delivery truck
function createDeliveryIcon() {
  return L.divIcon({
    className: 'delivery-marker',
    html: '<div style="background: linear-gradient(135deg, #7c3aed, #06b6d4); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); color: white; font-size: 16px;">🚚</div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

// Create custom icon for origin (warehouse)
function createOriginIcon() {
  return L.divIcon({
    className: 'origin-marker',
    html: '<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">📦</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Create custom icon for destination (customer)
function createDestinationIcon() {
  return L.divIcon({
    className: 'destination-marker',
    html: '<div style="background: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏠</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

function initMap(){
  // Calculate center point between origin and destination
  const centerLat = (route[0][0] + route[route.length-1][0]) / 2;
  const centerLng = (route[0][1] + route[route.length-1][1]) / 2;
  
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([centerLat, centerLng], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Draw full route line (gray, dashed)
  routeLine = L.polyline(route, {
    color: '#94a3b8',
    weight: 4,
    opacity: 0.4,
    dashArray: '10, 10'
  }).addTo(map);

  // Progress line (purple, solid) - will update as delivery moves
  progressLine = L.polyline([route[0]], {
    color: '#7c3aed',
    weight: 5,
    opacity: 0.8
  }).addTo(map);

  // Origin marker (warehouse)
  originMarker = L.marker(route[0], {
    icon: createOriginIcon(),
    zIndexOffset: 1000
  }).addTo(map).bindPopup('<strong>📦 Warehouse</strong><br>Order dispatched').openPopup();

  // Destination marker (customer)
  destinationMarker = L.marker(route[route.length-1], {
    icon: createDestinationIcon(),
    zIndexOffset: 1000
  }).addTo(map).bindPopup('<strong>🏠 Your Location</strong><br>Delivery destination');

  // Delivery truck marker (starts at origin)
  deliveryMarker = L.marker(route[0], {
    icon: createDeliveryIcon(),
    zIndexOffset: 2000
  }).addTo(map).bindPopup('<strong>🚚 Delivery Vehicle</strong><br>On the way to you');

  // Fit bounds to show entire route
  const bounds = L.latLngBounds(route);
  map.fitBounds(bounds, { padding: [50, 50] });

  // Start animation after a short delay
  setTimeout(() => {
    animate();
  }, 1000);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function updateProgress() {
  const totalDistance = route.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + calculateDistance(route[idx-1][0], route[idx-1][1], point[0], point[1]);
  }, 0);

  const traveledDistance = route.slice(0, currentPosition + 1).reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + calculateDistance(route[idx-1][0], route[idx-1][1], point[0], point[1]);
  }, 0);

  const progress = Math.min(100, (traveledDistance / totalDistance) * 100);
  return { progress, remaining: totalDistance - traveledDistance };
}

function animate(){
  if (animationInterval) return; // Prevent multiple intervals
  
  animationInterval = setInterval(() => {
    if (currentPosition >= route.length - 1) {
      // Delivery complete
      clearInterval(animationInterval);
      isDelivered = true;
      
      document.getElementById('statusPill').textContent = 'Status: Delivered ✅';
      document.getElementById('statusPill').style.background = '#d1fae5';
      document.getElementById('statusPill').style.color = '#065f46';
      document.getElementById('eta').textContent = 'Arrived!';
      
      deliveryMarker.setLatLng(route[route.length-1]);
      deliveryMarker.bindPopup('<strong>✅ Delivered!</strong><br>Your order has arrived').openPopup();
      
      // Update progress line to show full route
      progressLine.setLatLngs(route);
      
      // Close origin popup and open destination
      originMarker.closePopup();
      destinationMarker.openPopup();
      
      // Pan to destination
      map.setView(route[route.length-1], 15);
      return;
    }

    currentPosition++;
    const currentPoint = route[currentPosition];
    
    // Update delivery marker position
    deliveryMarker.setLatLng(currentPoint);
    
    // Update progress line
    const progressPoints = route.slice(0, currentPosition + 1);
    progressLine.setLatLngs(progressPoints);
    
    // Smoothly pan map to follow delivery
    map.panTo(currentPoint, { animate: true, duration: 1.0 });
    
    // Update progress info
    const { progress, remaining } = updateProgress();
    const remainingMins = Math.ceil((remaining / 0.5) * 2); // Assuming ~30 km/h average speed
    
    // Update status
    if (remainingMins > 15) {
      document.getElementById('statusPill').textContent = 'Status: On the way';
    } else if (remainingMins > 5) {
      document.getElementById('statusPill').textContent = 'Status: Almost there';
    } else {
      document.getElementById('statusPill').textContent = 'Status: Arriving soon';
    }
    
    document.getElementById('eta').textContent = remainingMins > 0 ? `~${remainingMins} mins` : '~1 min';
    
    // Update delivery marker popup
    deliveryMarker.bindPopup(`<strong>🚚 Delivery Vehicle</strong><br>${Math.round(progress)}% complete<br>~${remainingMins} mins away`);
    
  }, speedMs);
}

function simulateDelay(){
  if (isDelivered) return;
  
  document.getElementById('statusPill').textContent = 'Status: Delayed — Traffic';
  document.getElementById('statusPill').style.background = '#fef3c7';
  document.getElementById('statusPill').style.color = '#92400e';
  
  const { remaining } = updateProgress();
  const delayedMins = Math.ceil((remaining / 0.5) * 2) + 15;
  document.getElementById('eta').textContent = `~${delayedMins} mins`;
  
  deliveryMarker.bindPopup('<strong>🚚 Delivery Vehicle</strong><br>⚠️ Delayed due to traffic<br>Please bear with us');
}

// Reset animation (for demo purposes)
function resetTracking() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  currentPosition = 0;
  isDelivered = false;
  
  deliveryMarker.setLatLng(route[0]);
  progressLine.setLatLngs([route[0]]);
  
  document.getElementById('statusPill').textContent = 'Status: On the way';
  document.getElementById('statusPill').style.background = '#f3f6ff';
  document.getElementById('statusPill').style.color = '#1e3a8a';
  document.getElementById('eta').textContent = '~20 mins';
  
  const centerLat = (route[0][0] + route[route.length-1][0]) / 2;
  const centerLng = (route[0][1] + route[route.length-1][1]) / 2;
  map.setView([centerLat, centerLng], 12);
  
  setTimeout(() => {
    animate();
  }, 500);
}

// Make functions globally available for onclick handlers
window.simulateDelay = simulateDelay;
window.resetTracking = resetTracking;

document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('map')) {
    initMap();
  }
});

