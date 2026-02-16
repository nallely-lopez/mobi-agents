// visualization.js - Versión con mapa real de Leaflet

let map = null;
let isRunning = false;
let driverMarkers = {};
let passengerMarkers = {};
let drivers = [];
let passengers = [];

// Sistema de notificaciones
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notifications');
    }

    show(title, message, type = 'info') {
        if (!this.container) return;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    success(title, message) {
        this.show(title, message, 'success');
    }

    info(title, message) {
        this.show(title, message, 'info');
    }

    warning(title, message) {
        this.show(title, message, 'warning');
    }
}

const notifications = new NotificationSystem();

// Sistema de eventos
class EventLogger {
    constructor() {
        this.container = document.getElementById('eventLog');
        this.maxEvents = 20;
    }

    log(message, type = 'info') {
        if (!this.container) return;
        const time = new Date().toLocaleTimeString();
        const event = document.createElement('div');
        event.className = `event-item ${type}`;
        event.innerHTML = `
            <span class="event-time">[${time}]</span> ${message}
        `;
        
        this.container.insertBefore(event, this.container.firstChild);
        
        while (this.container.children.length > this.maxEvents) {
            this.container.removeChild(this.container.lastChild);
        }
    }
}

const eventLogger = new EventLogger();

// Generar posición aleatoria en el mapa
function getRandomPosition() {
    const centerLat = 19.4326;
    const centerLng = -99.1332;
    const offset = 0.02;
    
    return {
        lat: centerLat + (Math.random() - 0.5) * offset,
        lng: centerLng + (Math.random() - 0.5) * offset
    };
}

// Clase Driver
class Driver {
    constructor(name, color) {
    this.name = name;
    this.color = color;
    const pos = getRandomPosition();
    this.lat = pos.lat;
    this.lng = pos.lng;
    this.targetLat = this.lat;
    this.targetLng = this.lng;
    this.available = true;
    this.trips = 0;
    this.earnings = 0;
    this.rating = 5.0;
    this.energy = 100;
    this.speed = 0.0001;
    this.currentPassenger = null;
    this.marker = null;
    this.routeLine = null;
    this.routingControl = null;  // ✅ AGREGAR
    this.routeCoordinates = null; // ✅ AGREGAR
    this.routeIndex = 0;          // ✅ AGREGAR
    this.routingControl = null;
    this.routeCoordinates = null;
    this.routeIndex = 0;
    this.isPickingUp = false;  // ✅ AGREGAR
    
    this.createMarker();
    }

    createMarker() {
        if (!map) return;
        
        const icon = L.divIcon({
            className: 'driver-marker',
            html: `<div style="background: ${this.color}; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🚗</div>`,
            iconSize: [40, 40]
        });

        this.marker = L.marker([this.lat, this.lng], { icon });
        this.marker.bindPopup(`
            <b>${this.name}</b><br>
            ⭐ ${this.rating.toFixed(1)}<br>
            📊 ${this.trips} viajes<br>
            💰 $${this.earnings}<br>
            ⚡ ${this.energy}%
        `);
        this.marker.addTo(map);
        
        driverMarkers[this.name] = this.marker;
    }

    moveTo(lat, lng, passenger) {
    this.targetLat = lat;
    this.targetLng = lng;
    this.available = false;
    this.currentPassenger = passenger;
    this.isPickingUp = true; // ✅ Nueva bandera

    // Remover ruta anterior
    if (this.routingControl) {
        map.removeControl(this.routingControl);
    }

    // FASE 1: Ir a RECOGER al pasajero
    this.routingControl = L.Routing.control({
        waypoints: [
            L.latLng(this.lat, this.lng),              // Posición actual del conductor
            L.latLng(passenger.lat, passenger.lng)      // Posición del pasajero
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        lineOptions: {
            styles: [{ 
                color: this.color, 
                opacity: 0.8, 
                weight: 4,
                dashArray: '10, 10'
            }]
        },
        createMarker: () => null,
        show: false
    }).addTo(map);

    this.routingControl.on('routesfound', (e) => {
        const route = e.routes[0];
        this.routeCoordinates = route.coordinates;
        this.routeIndex = 0;
        console.log(`${this.name}: Ruta de pickup calculada (${this.routeCoordinates.length} puntos)`);
    });

    notifications.info(`🚗 ${this.name} en camino`, `Recogiendo a ${passenger.name}`);
    eventLogger.log(`🚗 ${this.name} va a recoger a ${passenger.name}`, 'success');
    }

    update() {
    if (this.routeCoordinates && this.routeCoordinates.length > 0) {
        if (this.routeIndex < this.routeCoordinates.length - 1) {
            const nextPoint = this.routeCoordinates[this.routeIndex + 1];
            
            const dlat = nextPoint.lat - this.lat;
            const dlng = nextPoint.lng - this.lng;
            const distance = Math.sqrt(dlat * dlat + dlng * dlng);

            if (distance < 0.0001) {
                this.routeIndex++;
            } else {
                this.lat += (dlat / distance) * this.speed;
                this.lng += (dlng / distance) * this.speed;
            }

            this.marker.setLatLng([this.lat, this.lng]);
        } else {
            // Llegamos al punto
            if (this.isPickingUp) {
                // ✅ FASE 1 COMPLETA: Recogimos al pasajero
                console.log(`${this.name}: Pasajero recogido, yendo al destino`);
                this.isPickingUp = false;
                
                // Remover marcador del pasajero del mapa
                if (this.currentPassenger && this.currentPassenger.marker) {
                    map.removeLayer(this.currentPassenger.marker);
                }
                
                // FASE 2: Ir al destino final
                if (this.routingControl) {
                    map.removeControl(this.routingControl);
                }
                
                this.routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(this.lat, this.lng),                           // Posición actual (donde recogimos)
                        L.latLng(this.targetLat, this.targetLng)                // Destino final
                    ],
                    routeWhileDragging: false,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: false,
                    showAlternatives: false,
                    lineOptions: {
                        styles: [{ 
                            color: this.color, 
                            opacity: 0.8, 
                            weight: 4,
                            dashArray: '5, 5'
                        }]
                    },
                    createMarker: () => null,
                    show: false
                }).addTo(map);

                this.routingControl.on('routesfound', (e) => {
                    const route = e.routes[0];
                    this.routeCoordinates = route.coordinates;
                    this.routeIndex = 0;
                    console.log(`${this.name}: Ruta al destino calculada (${this.routeCoordinates.length} puntos)`);
                });
                
                notifications.info(`👤 Pasajero a bordo`, `${this.name} va al destino`);
                eventLogger.log(`👤 ${this.name} recogió al pasajero, yendo al destino`, 'info');
                
            } else {
                // ✅ FASE 2 COMPLETA: Llegamos al destino
                this.lat = this.targetLat;
                this.lng = this.targetLng;
                
                if (!this.available && this.currentPassenger) {
                    this.completeTrip();
                }
            }
        }
    } else {
        // Fallback
        const dlat = this.targetLat - this.lat;
        const dlng = this.targetLng - this.lng;
        const distance = Math.sqrt(dlat * dlat + dlng * dlng);

        if (distance > 0.0001) {
            this.lat += (dlat / distance) * this.speed;
            this.lng += (dlng / distance) * this.speed;
            this.marker.setLatLng([this.lat, this.lng]);
        }
    }

    this.marker.setPopupContent(`
        <b>${this.name}</b><br>
        ${this.available ? '✅ Disponible' : (this.isPickingUp ? '🚗 Recogiendo...' : '👤 Con pasajero')}<br>
        ⭐ ${this.rating.toFixed(1)}<br>
        📊 ${this.trips} viajes<br>
        💰 $${Math.round(this.earnings)}<br>
        ⚡ ${this.energy}%
    `);
    }

    completeTrip() {
    this.trips++;
    const fare = 50 + Math.random() * 150;
    this.earnings += Math.round(fare);
    this.energy = Math.max(0, this.energy - 10);
    
    const newRating = 3.5 + Math.random() * 1.5;
    this.rating = ((this.rating * (this.trips - 1)) + newRating) / this.trips;
    
    this.available = true;
    
    // Limpiar ruta
    if (this.routingControl) {
        map.removeLayer(this.routingControl);
        this.routingControl = null;
    }
    
    this.routeCoordinates = null;
    this.routeIndex = 0;
    this.isPickingUp = false;

    notifications.success('✅ Viaje completado', `${this.name} ganó $${Math.round(fare)}`);
    eventLogger.log(`✅ ${this.name} completó viaje • $${Math.round(fare)}`, 'success');
    
    // Remover marcador del pasajero
    if (this.currentPassenger && this.currentPassenger.marker) {
        map.removeLayer(this.currentPassenger.marker);
    }
    
    // ✅ Remover marcador de destino
    if (this.currentPassenger && this.currentPassenger.destinationMarker) {
        map.removeLayer(this.currentPassenger.destinationMarker);
        this.currentPassenger.destinationMarker = null;
    }
    
    this.currentPassenger = null;
    updateStats();
    updateUI();
    }
}

// Clase Passenger
class Passenger {
    constructor(name) {
        this.name = name;
        const pos = getRandomPosition();
        this.lat = pos.lat;
        this.lng = pos.lng;
        const dest = getRandomPosition();
        this.destLat = dest.lat;
        this.destLng = dest.lng;
        this.waiting = true;
        this.marker = null;
        
        this.createMarker();
    }

    createMarker() {
    if (!map) return;
    
    const icon = L.divIcon({
        className: 'passenger-marker',
        html: '<div style="background: #60a5fa; width: 35px; height: 35px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 18px; animation: pulse 2s infinite;">👤</div>',
        iconSize: [35, 35]
    });

    this.marker = L.marker([this.lat, this.lng], { icon });
    
    // Calcular distancia al destino
    const dlat = this.destLat - this.lat;
    const dlng = this.destLng - this.lng;
    const distance = Math.sqrt(dlat * dlat + dlng * dlng);
    const distanceKm = (distance * 111).toFixed(1); // Aproximación a km
    
    this.marker.bindPopup(`
        <b>👤 ${this.name}</b><br>
        📍 Ubicación actual<br>
        🎯 Destino: ${distanceKm} km<br>
        ⏱️ Esperando conductor...
    `);
    this.marker.addTo(map);
    
    passengerMarkers[this.name] = this.marker;
    
    // Agregar propiedad para el marcador de destino
    this.destinationMarker = null;
    }
}

// Sistema de tráfico
const trafficSystem = {
    level: 'low',
    levels: ['low', 'medium', 'high'],
    lastChange: Date.now(),
    
    update() {
        if (Date.now() - this.lastChange > 10000) {
            const oldLevel = this.level;
            this.level = this.levels[Math.floor(Math.random() * this.levels.length)];
            
            if (oldLevel !== this.level) {
                this.lastChange = Date.now();
                this.updateUI();
                
                const messages = {
                    'low': 'El tráfico ha mejorado',
                    'medium': 'Tráfico moderado en la ciudad',
                    'high': '⚠️ Congestión alta detectada'
                };
                
                notifications.warning('🚦 Cambio de tráfico', messages[this.level]);
                eventLogger.log(`🚦 Tráfico cambió a ${this.level.toUpperCase()}`, 'warning');
            }
        }
    },
    
    updateUI() {
        const light = document.getElementById('trafficLight');
        const text = document.getElementById('trafficLevel');
        
        if (!light || !text) return;
        
        light.className = 'traffic-light';
        
        const config = {
            'low': { class: 'traffic-low', text: 'Tráfico: BAJO' },
            'medium': { class: 'traffic-medium', text: 'Tráfico: MEDIO' },
            'high': { class: 'traffic-high', text: 'Tráfico: ALTO' }
        };
        
        light.classList.add(config[this.level].class);
        text.textContent = config[this.level].text;
    }
};

// Inicializar mapa y agentes
function initMap() {
    const centerLat = 19.4326;
    const centerLng = -99.1332;

    map = L.map('cityMap', {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        maxZoom: 19
    }).addTo(map);

    notifications.success('Mapa cargado', 'Ciudad lista');
    eventLogger.log('🗺️ Mapa cargado', 'success');
    
    // CREAR AGENTES DESPUÉS DEL MAPA
    createAgents();
}

function createAgents() {
    drivers.push(
        new Driver('Carlos', '#ef4444'),
        new Driver('María', '#3b82f6'),
        new Driver('Pedro', '#10b981'),
        new Driver('Laura', '#f59e0b')
    );
    
    passengers.push(
        new Passenger('Ana'),
        new Passenger('Luis'),
        new Passenger('Sara'),
        new Passenger('Miguel')
    );
    
    updateStats();
    updateUI();
    
    eventLogger.log('👥 4 conductores disponibles', 'info');
    eventLogger.log('📍 4 pasajeros esperando', 'info');
}

// Actualizar UI
function updateUI() {
    const driversList = document.getElementById('driversList');
    if (!driversList) return;
    driversList.innerHTML = '';
    
    drivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.innerHTML = `
            <div class="agent-header">
                <span class="agent-icon">🚗</span>
                <span class="agent-name">${driver.name}</span>
                <span class="agent-status ${driver.available ? 'status-available' : 'status-busy'}">
                    ${driver.available ? 'Disponible' : 'Ocupado'}
                </span>
            </div>
            <div class="agent-details">
                ⭐ ${driver.rating.toFixed(1)} | 📊 ${driver.trips} viajes | 💰 $${Math.round(driver.earnings)}
                <div class="stat-chart">
                    <div class="stat-chart-fill" style="width: ${driver.energy}%"></div>
                </div>
                <small>⚡ Energía: ${driver.energy}%</small>
            </div>
        `;
        driversList.appendChild(card);
    });

    const passengersList = document.getElementById('passengersList');
    if (!passengersList) return;
    passengersList.innerHTML = '';
    
    passengers.filter(p => p.waiting).forEach(passenger => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.innerHTML = `
            <div class="agent-header">
                <span class="agent-icon">👤</span>
                <span class="agent-name">${passenger.name}</span>
                <span class="agent-status" style="background: #60a5fa; color: #000;">Esperando</span>
            </div>
        `;
        passengersList.appendChild(card);
    });
}

// Actualizar estadísticas
function updateStats() {
    const totalTrips = drivers.reduce((sum, d) => sum + d.trips, 0);
    const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
    const activeDrivers = drivers.filter(d => d.available).length;
    const avgEarnings = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;

    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalEarnings').textContent = `$${Math.round(totalEarnings)}`;
    document.getElementById('activeDrivers').textContent = `${activeDrivers}/${drivers.length}`;
    document.getElementById('avgEarnings').textContent = `$${avgEarnings}`;
}

// Asignar viaje
// Asignar viaje con IA
function assignRide() {
    const autoAssign = document.getElementById('autoAssign');
    if (!autoAssign || !autoAssign.checked) return;
    
    const availableDrivers = drivers.filter(d => d.available && d.energy > 20);
    const waitingPassengers = passengers.filter(p => p.waiting);

    if (availableDrivers.length > 0 && waitingPassengers.length > 0) {
        const passenger = waitingPassengers[0];
        
        // 🧠 ALGORITMO DE IA: Evaluar cada conductor
        let bestDriver = null;
        let bestScore = -Infinity;
        
        console.log(`\n🤖 Evaluando conductores para ${passenger.name}...`);
        
        availableDrivers.forEach(driver => {
            // Calcular distancia al pasajero
            const dlat = passenger.lat - driver.lat;
            const dlng = passenger.lng - driver.lng;
            const distanceToPassenger = Math.sqrt(dlat * dlat + dlng * dlng);
            
            // Calcular distancia total del viaje
            const tripDlat = passenger.destLat - passenger.lat;
            const tripDlng = passenger.destLng - passenger.lng;
            const tripDistance = Math.sqrt(tripDlat * tripDlat + tripDlng * tripDlng);
            
            let score = 0;
            
            // Factor 1: Distancia al pasajero (MÁS IMPORTANTE)
            if (distanceToPassenger < 0.005) {
                score += 50; // Muy cerca
            } else if (distanceToPassenger < 0.01) {
                score += 30; // Cerca
            } else if (distanceToPassenger < 0.02) {
                score += 10; // Moderado
            } else {
                score -= 20; // Lejos
            }
            
            // Factor 2: Energía del conductor
            if (driver.energy > 70) {
                score += 20;
            } else if (driver.energy > 40) {
                score += 10;
            } else {
                score -= 10;
            }
            
            // Factor 3: Rating del conductor
            if (driver.rating >= 4.8) {
                score += 15;
            } else if (driver.rating >= 4.5) {
                score += 10;
            }
            
            // Factor 4: Tráfico (penalizar si hay congestión)
            const trafficPenalty = {
                'low': 10,
                'medium': 0,
                'high': -15
            };
            score += trafficPenalty[trafficSystem.level];
            
            // Factor 5: Eficiencia del viaje
            const efficiency = tripDistance / (distanceToPassenger + 0.001);
            if (efficiency > 2) {
                score += 10; // Viaje largo, vale la pena
            }
            
            console.log(`  ${driver.name}: Score=${score} (Dist=${distanceToPassenger.toFixed(4)}, Energy=${driver.energy}%, Rating=${driver.rating.toFixed(1)})`);
            
            if (score > bestScore) {
                bestScore = score;
                bestDriver = driver;
            }
        });
        
        if (bestDriver) {
            console.log(`✅ Mejor match: ${bestDriver.name} (Score: ${bestScore})\n`);
            
            // Asignar viaje
            bestDriver.moveTo(passenger.destLat, passenger.destLng, passenger);
            passenger.waiting = false;
            
            // Mostrar destino en el mapa
            showDestinationMarker(passenger);
            
            eventLogger.log(
                `🤖 IA seleccionó a ${bestDriver.name} (Score: ${bestScore})`,
                'success'
            );
        }
    }
}

// Mostrar marcador de destino del pasajero
function showDestinationMarker(passenger) {
    if (!passenger.destinationMarker) {
        const icon = L.divIcon({
            className: 'destination-marker',
            html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 3px 5px rgba(0,0,0,0.4);">🎯</div>',
            iconSize: [30, 30]
        });

        passenger.destinationMarker = L.marker([passenger.destLat, passenger.destLng], { icon });
        passenger.destinationMarker.bindPopup(`
            <b>🎯 Destino de ${passenger.name}</b><br>
            Esperando llegada...
        `);
        passenger.destinationMarker.addTo(map);
    }
}

// Loop de animación
let animationFrame;
function animate() {
    if (!isRunning) return;

    drivers.forEach(driver => driver.update());
    trafficSystem.update();

    if (Math.random() < 0.03) {
        assignRide();
    }

    updateUI();
    animationFrame = requestAnimationFrame(animate);
}

// Controles
function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        notifications.success('🚀 Iniciado', 'Simulación en marcha');
        eventLogger.log('▶️ Simulación iniciada', 'success');
        animate();
    }
}

function pauseSimulation() {
    isRunning = false;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    notifications.info('⏸️ Pausado', 'Simulación detenida');
}

function resetSimulation() {
    pauseSimulation();
    
    drivers.forEach(d => {
        if (d.marker) map.removeLayer(d.marker);
        if (d.routeLine) map.removeLayer(d.routeLine);
    });
    
    passengers.forEach(p => {
        if (p.marker) map.removeLayer(p.marker);
    });
    
    drivers.length = 0;
    passengers.length = 0;
    
    createAgents();
    
    notifications.info('🔄 Reiniciado', 'Volviendo al inicio');
}

function changeSpeed(speed) {
    const speedValue = parseFloat(speed);
    drivers.forEach(driver => {
        driver.speed = 0.0001 * speedValue;
    });
    eventLogger.log(`⚡ Velocidad: ${speed}x`, 'info');
}

function toggleRoutes(enabled) {
    drivers.forEach(driver => {
        if (!enabled && driver.routeLine) {
            map.removeLayer(driver.routeLine);
            driver.routeLine = null;
        }
    });
}

function spawnNewPassenger() {
    const names = ['Carlos', 'Ana', 'Luis', 'María'];
    const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    
    const newPassenger = new Passenger(randomName);
    passengers.push(newPassenger);
    
    notifications.info('👤 Nuevo pasajero', randomName);
    updateUI();
}

// Inicializar cuando cargue
window.addEventListener('load', () => {
    initMap();
    trafficSystem.updateUI();
    eventLogger.log('🚀 Sistema iniciado', 'success');
});