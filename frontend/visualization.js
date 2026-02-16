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

        if (this.routeLine) {
            map.removeLayer(this.routeLine);
        }
        
        this.routeLine = L.polyline([
            [this.lat, this.lng],
            [lat, lng]
        ], {
            color: this.color,
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        notifications.info(`🚗 ${this.name} en camino`, `Recogiendo a ${passenger.name}`);
        eventLogger.log(`🚗 ${this.name} asignado a ${passenger.name}`, 'success');
    }

    update() {
        const dlat = this.targetLat - this.lat;
        const dlng = this.targetLng - this.lng;
        const distance = Math.sqrt(dlat * dlat + dlng * dlng);

        if (distance > 0.0001) {
            this.lat += (dlat / distance) * this.speed;
            this.lng += (dlng / distance) * this.speed;
            
            this.marker.setLatLng([this.lat, this.lng]);
            
            if (this.routeLine) {
                this.routeLine.setLatLngs([
                    [this.lat, this.lng],
                    [this.targetLat, this.targetLng]
                ]);
            }
        } else {
            this.lat = this.targetLat;
            this.lng = this.targetLng;
            
            if (!this.available && this.currentPassenger) {
                this.completeTrip();
            }
        }

        this.marker.setPopupContent(`
            <b>${this.name}</b><br>
            ${this.available ? '✅ Disponible' : '🚗 En viaje'}<br>
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
        
        if (this.routeLine) {
            map.removeLayer(this.routeLine);
            this.routeLine = null;
        }

        notifications.success('✅ Viaje completado', `${this.name} ganó $${Math.round(fare)}`);
        eventLogger.log(`✅ ${this.name} completó viaje • $${Math.round(fare)}`, 'success');
        
        if (this.currentPassenger && this.currentPassenger.marker) {
            map.removeLayer(this.currentPassenger.marker);
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
            html: '<div style="background: #60a5fa; width: 35px; height: 35px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 18px;">👤</div>',
            iconSize: [35, 35]
        });

        this.marker = L.marker([this.lat, this.lng], { icon });
        this.marker.bindPopup(`<b>${this.name}</b><br>Esperando viaje...`);
        this.marker.addTo(map);
        
        passengerMarkers[this.name] = this.marker;
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
function assignRide() {
    const autoAssign = document.getElementById('autoAssign');
    if (!autoAssign || !autoAssign.checked) return;
    
    const availableDrivers = drivers.filter(d => d.available && d.energy > 20);
    const waitingPassengers = passengers.filter(p => p.waiting);

    if (availableDrivers.length > 0 && waitingPassengers.length > 0) {
        let bestDriver = availableDrivers[0];
        let bestDistance = Infinity;
        const passenger = waitingPassengers[0];

        availableDrivers.forEach(driver => {
            const dlat = passenger.destLat - driver.lat;
            const dlng = passenger.destLng - driver.lng;
            const distance = Math.sqrt(dlat * dlat + dlng * dlng);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDriver = driver;
            }
        });

        bestDriver.moveTo(passenger.destLat, passenger.destLng, passenger);
        passenger.waiting = false;
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