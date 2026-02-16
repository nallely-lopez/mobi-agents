// visualization.js - Versión mejorada con notificaciones y animaciones

const canvas = document.getElementById('cityMap');
const ctx = canvas.getContext('2d');

let isRunning = false;
let animationFrame;
let activeRoutes = [];

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const cityGrid = {
    rows: 8,
    cols: 10,
    cellSize: 0
};

function calculateCellSize() {
    cityGrid.cellSize = Math.min(
        canvas.width / cityGrid.cols,
        canvas.height / cityGrid.rows
    );
}

// Sistema de notificaciones
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notifications');
    }

    show(title, message, type = 'info') {
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

// Clase para rutas animadas
class Route {
    constructor(startX, startY, endX, endY, color = '#60a5fa') {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.progress = 0;
        this.active = true;
    }

    update() {
        this.progress += 0.02;
        if (this.progress >= 1) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;

        const cellSize = cityGrid.cellSize;
        const startPixelX = this.startX * cellSize + cellSize / 2;
        const startPixelY = this.startY * cellSize + cellSize / 2;
        const endPixelX = this.endX * cellSize + cellSize / 2;
        const endPixelY = this.endY * cellSize + cellSize / 2;

        const currentX = startPixelX + (endPixelX - startPixelX) * this.progress;
        const currentY = startPixelY + (endPixelY - startPixelY) * this.progress;

        // Línea animada
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -Date.now() / 50;
        
        ctx.beginPath();
        ctx.moveTo(startPixelX, startPixelY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        ctx.setLineDash([]);

        // Punto de destino
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(endPixelX, endPixelY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Círculo animado en el punto actual
        const pulseRadius = 10 + Math.sin(Date.now() / 200) * 3;
        ctx.strokeStyle = this.color + '80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentX, currentY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Clase Driver mejorada
class Driver {
    constructor(name, x, y, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.color = color;
        this.available = true;
        this.trips = 0;
        this.earnings = 0;
        this.rating = 5.0;
        this.energy = 100;
        this.speed = 0.05;
        this.currentPassenger = null;
        this.route = null;
    }

    moveTo(x, y, passenger) {
        this.targetX = x;
        this.targetY = y;
        this.available = false;
        this.currentPassenger = passenger;
        
        // Crear ruta visual
        this.route = new Route(this.x, this.y, x, y, this.color);
        activeRoutes.push(this.route);

        // Notificación
        notifications.info(
            `🚗 ${this.name} en camino`,
            `Recogiendo a ${passenger.name}`
        );
    }

    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
            if (!this.available && this.currentPassenger) {
                this.completeTrip();
            }
        }
    }

    completeTrip() {
        this.trips++;
        const fare = 50 + Math.random() * 150;
        this.earnings += Math.round(fare);
        this.energy = Math.max(0, this.energy - 10);
        
        // Calcular nueva calificación
        const newRating = 3.5 + Math.random() * 1.5;
        this.rating = ((this.rating * (this.trips - 1)) + newRating) / this.trips;
        
        this.available = true;
        
        // Notificación de viaje completado
        notifications.success(
            `✅ Viaje completado`,
            `${this.name} ganó $${Math.round(fare)} | ⭐ ${this.rating.toFixed(1)}`
        );
        
        this.currentPassenger = null;
        this.route = null;
        updateStats();
        updateUI();
    }

    draw() {
        const cellSize = cityGrid.cellSize;
        const pixelX = this.x * cellSize;
        const pixelY = this.y * cellSize;

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(pixelX + 4, pixelY + 4, cellSize * 0.8, cellSize * 0.8);

        // Efecto de brillo si está ocupado
        if (!this.available) {
            ctx.fillStyle = this.color + '40';
            ctx.fillRect(pixelX - 5, pixelY - 5, cellSize * 0.9, cellSize * 0.9);
        }

        // Cuerpo del carro
        ctx.fillStyle = this.color;
        ctx.fillRect(pixelX, pixelY, cellSize * 0.8, cellSize * 0.8);

        // Estado (esquina superior izquierda)
        ctx.fillStyle = this.available ? '#4ade80' : '#f59e0b';
        ctx.fillRect(pixelX, pixelY, cellSize * 0.2, cellSize * 0.2);

        // Barra de energía
        const energyBarWidth = (cellSize * 0.8) * (this.energy / 100);
        ctx.fillStyle = this.energy > 50 ? '#4ade80' : this.energy > 25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(pixelX, pixelY + cellSize * 0.85, energyBarWidth, 3);

        // Nombre
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.name, pixelX, pixelY - 5);

        // Icono de rating
        if (this.trips > 0) {
            ctx.font = '10px Arial';
            ctx.fillText(`⭐${this.rating.toFixed(1)}`, pixelX, pixelY + cellSize * 0.95 + 12);
        }
    }
}

// Clase Passenger mejorada
class Passenger {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.waiting = true;
        this.destinationX = Math.floor(Math.random() * cityGrid.cols);
        this.destinationY = Math.floor(Math.random() * cityGrid.rows);
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        if (!this.waiting) return;

        const cellSize = cityGrid.cellSize;
        const pixelX = this.x * cellSize;
        const pixelY = this.y * cellSize;

        // Efecto de pulso
        this.pulsePhase += 0.1;
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;

        // Círculo de espera animado
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pixelX + cellSize * 0.4, pixelY + cellSize * 0.4, cellSize * 0.3 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Icono de persona
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(pixelX + cellSize * 0.4, pixelY + cellSize * 0.3, cellSize * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(pixelX + cellSize * 0.25, pixelY + cellSize * 0.45, cellSize * 0.3, cellSize * 0.25);

        // Nombre
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.fillText(this.name, pixelX, pixelY - 5);
    }
}

// Sistema de tráfico
const trafficSystem = {
    level: 'low',
    levels: ['low', 'medium', 'high'],
    lastChange: Date.now(),
    
    update() {
        if (Date.now() - this.lastChange > 10000) { // Cambiar cada 10 segundos
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
            }
        }
    },
    
    updateUI() {
        const light = document.getElementById('trafficLight');
        const text = document.getElementById('trafficLevel');
        
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

// Crear agentes
const drivers = [
    new Driver('Carlos', 2, 2, '#ef4444'),
    new Driver('María', 7, 2, '#3b82f6'),
    new Driver('Pedro', 2, 6, '#10b981'),
    new Driver('Laura', 7, 6, '#f59e0b')
];

const passengers = [
    new Passenger('Ana', 4, 1),
    new Passenger('Luis', 5, 3),
    new Passenger('Sara', 3, 5),
    new Passenger('Miguel', 6, 7)
];

// Dibujar la ciudad
function drawCity() {
    calculateCellSize();
    const cellSize = cityGrid.cellSize;

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula con efecto de neón
    ctx.strokeStyle = 'rgba(100, 126, 234, 0.15)';
    ctx.lineWidth = 1;

    for (let row = 0; row <= cityGrid.rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * cellSize);
        ctx.lineTo(cityGrid.cols * cellSize, row * cellSize);
        ctx.stroke();
    }

    for (let col = 0; col <= cityGrid.cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * cellSize, 0);
        ctx.lineTo(col * cellSize, cityGrid.rows * cellSize);
        ctx.stroke();
    }

    // Puntos de interés con iconos mejorados
    const poi = [
        { x: 5, y: 1, label: '🏢 Centro', color: '#6366f1' },
        { x: 2, y: 4, label: '🏥 Hospital', color: '#ef4444' },
        { x: 8, y: 4, label: '🏫 Universidad', color: '#10b981' },
        { x: 5, y: 7, label: '✈️ Aeropuerto', color: '#f59e0b' }
    ];

    poi.forEach(p => {
        // Fondo semi-transparente
        ctx.fillStyle = p.color + '22';
        ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        
        // Borde
        ctx.strokeStyle = p.color + '88';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x * cellSize + 2, p.y * cellSize + 2, cellSize - 4, cellSize - 4);
        
        // Etiqueta
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(p.label, p.x * cellSize + 5, p.y * cellSize + cellSize - 8);
        ctx.shadowBlur = 0;
    });
}

// Actualizar UI
function updateUI() {
    const driversList = document.getElementById('driversList');
    driversList.innerHTML = '';
    
    drivers.forEach(driver => {
        const energyPercentage = (driver.energy / 100) * 100;
        
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
                    <div class="stat-chart-fill" style="width: ${energyPercentage}%"></div>
                </div>
                <small>⚡ Energía: ${driver.energy}%</small>
            </div>
        `;
        driversList.appendChild(card);
    });

    const passengersList = document.getElementById('passengersList');
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
            <div class="agent-details">
                📍 En: (${passenger.x}, ${passenger.y})<br>
                🎯 Destino: (${passenger.destinationX}, ${passenger.destinationY})
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
    const waitingPassengers = passengers.filter(p => p.waiting).length;
    const efficiency = totalTrips + waitingPassengers > 0 
        ? Math.round((totalTrips / (totalTrips + waitingPassengers)) * 100)
        : 100;

    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalEarnings').textContent = `$${Math.round(totalEarnings)}`;
    document.getElementById('activeDrivers').textContent = `${activeDrivers}/${drivers.length}`;
    document.getElementById('efficiency').textContent = `${efficiency}%`;
}

// Asignar viaje
function assignRide() {
    const availableDrivers = drivers.filter(d => d.available && d.energy > 20);
    const waitingPassengers = passengers.filter(p => p.waiting);

    if (availableDrivers.length > 0 && waitingPassengers.length > 0) {
        // Encontrar el conductor más cercano
        let bestDriver = null;
        let bestDistance = Infinity;
        const passenger = waitingPassengers[0];

        availableDrivers.forEach(driver => {
            const dx = passenger.destinationX - driver.x;
            const dy = passenger.destinationY - driver.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDriver = driver;
            }
        });

        if (bestDriver) {
            bestDriver.moveTo(passenger.destinationX, passenger.destinationY, passenger);
            passenger.waiting = false;
        }
    }
}

// Loop de animación
function animate() {
    if (!isRunning) return;

    drawCity();

    // Actualizar y dibujar rutas
    activeRoutes = activeRoutes.filter(route => {
        route.update();
        route.draw();
        return route.active;
    });

    // Actualizar y dibujar agentes
    drivers.forEach(driver => {
        driver.update();
        driver.draw();
    });

    passengers.forEach(passenger => {
        passenger.draw();
    });

    // Actualizar tráfico
    trafficSystem.update();

    // Asignar viajes
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
        notifications.success('🚀 Sistema iniciado', 'Simulación en marcha');
        animate();
    }
}

function pauseSimulation() {
    isRunning = false;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    notifications.info('⏸️ Sistema pausado', 'Simulación detenida');
}

function resetSimulation() {
    pauseSimulation();
    
    drivers.forEach((driver, i) => {
        driver.x = driver.targetX = (i % 2 === 0) ? 2 : 7;
        driver.y = driver.targetY = (i < 2) ? 2 : 6;
        driver.trips = 0;
        driver.earnings = 0;
        driver.energy = 100;
        driver.rating = 5.0;
        driver.available = true;
        driver.route = null;
    });
    
    passengers.forEach((p, i) => {
        p.waiting = true;
        p.x = 3 + i;
        p.y = 1 + (i % 4);
        p.destinationX = Math.floor(Math.random() * cityGrid.cols);
        p.destinationY = Math.floor(Math.random() * cityGrid.rows);
    });

    activeRoutes = [];
    updateStats();
    updateUI();
    drawCity();
    drivers.forEach(d => d.draw());
    passengers.forEach(p => p.draw());
    
    notifications.info('🔄 Sistema reiniciado', 'Todo vuelve al estado inicial');
}
// Sistema de eventos
class EventLogger {
    constructor() {
        this.container = document.getElementById('eventLog');
        this.maxEvents = 20;
    }

    log(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const event = document.createElement('div');
        event.className = `event-item ${type}`;
        event.innerHTML = `
            <span class="event-time">[${time}]</span> ${message}
        `;
        
        this.container.insertBefore(event, this.container.firstChild);
        
        // Limitar eventos mostrados
        while (this.container.children.length > this.maxEvents) {
            this.container.removeChild(this.container.lastChild);
        }
    }
}

const eventLogger = new EventLogger();

// Variables de configuración
let simulationSpeed = 1;
let showRoutesEnabled = true;

// Cambiar velocidad
function changeSpeed(speed) {
    simulationSpeed = parseFloat(speed);
    drivers.forEach(driver => {
        driver.speed = 0.05 * simulationSpeed;
    });
    eventLogger.log(`⚡ Velocidad cambiada a ${speed}x`, 'info');
}

// Toggle de rutas
function toggleRoutes(enabled) {
    showRoutesEnabled = enabled;
    if (!enabled) {
        activeRoutes = [];
    }
    eventLogger.log(enabled ? '📍 Rutas activadas' : '📍 Rutas desactivadas', 'info');
}

// Crear nuevo pasajero
function spawnNewPassenger() {
    const names = ['Carlos', 'Ana', 'Luis', 'María', 'Pedro', 'Laura', 'Miguel', 'Sara', 'Elena', 'David'];
    const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    
    const newPassenger = new Passenger(
        randomName,
        Math.floor(Math.random() * cityGrid.cols),
        Math.floor(Math.random() * cityGrid.rows)
    );
    
    passengers.push(newPassenger);
    eventLogger.log(`👤 ${randomName} solicitó un viaje`, 'info');
    notifications.info('👤 Nuevo pasajero', `${randomName} necesita transporte`);
    updateUI();
}

// Mejorar el sistema de asignación
function assignRide() {
    if (!document.getElementById('autoAssign').checked) return;
    
    const availableDrivers = drivers.filter(d => d.available && d.energy > 20);
    const waitingPassengers = passengers.filter(p => p.waiting);

    if (availableDrivers.length > 0 && waitingPassengers.length > 0) {
        let bestDriver = null;
        let bestDistance = Infinity;
        const passenger = waitingPassengers[0];

        availableDrivers.forEach(driver => {
            const dx = passenger.destinationX - driver.x;
            const dy = passenger.destinationY - driver.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDriver = driver;
            }
        });

        if (bestDriver) {
            bestDriver.moveTo(passenger.destinationX, passenger.destinationY, passenger);
            passenger.waiting = false;
            
            eventLogger.log(
                `🚗 ${bestDriver.name} asignado a ${passenger.name}`,
                'success'
            );
        }
    }
}

// Modificar el método draw de Route para respetar showRoutesEnabled
const originalRouteDraw = Route.prototype.draw;
Route.prototype.draw = function() {
    if (!showRoutesEnabled) return;
    originalRouteDraw.call(this);
};

// Modificar completeTrip para agregar logs
const originalCompleteTrip = Driver.prototype.completeTrip;
Driver.prototype.completeTrip = function() {
    const fare = 50 + Math.random() * 150;
    eventLogger.log(
        `✅ ${this.name} completó viaje • $${Math.round(fare)} • ${this.trips + 1} viajes`,
        'success'
    );
    originalCompleteTrip.call(this);
    
    // Animar cambio de valor
    const earningsElement = document.getElementById('totalEarnings');
    earningsElement.classList.add('value-changed');
    setTimeout(() => earningsElement.classList.remove('value-changed'), 300);
};

// Agregar evento cuando cambia el tráfico
const originalTrafficUpdate = trafficSystem.updateUI;
trafficSystem.updateUI = function() {
    originalTrafficUpdate.call(this);
    eventLogger.log(`🚦 Tráfico cambió a ${this.level.toUpperCase()}`, 'warning');
};

// Evento de inicio
window.addEventListener('load', () => {
    eventLogger.log('🚀 Sistema MobiAgents iniciado', 'success');
    eventLogger.log('👥 4 conductores disponibles', 'info');
    eventLogger.log('📍 4 pasajeros esperando', 'info');
});

// Sistema de gráfica de rendimiento
class PerformanceChart {
    constructor() {
        this.canvas = document.getElementById('performanceChart');
        this.ctx = this.canvas.getContext('2d');
        this.dataPoints = {
            earnings: [],
            trips: []
        };
        this.maxDataPoints = 30;
        this.updateInterval = null;
    }

    start() {
        this.updateInterval = setInterval(() => {
            if (isRunning) {
                this.addDataPoint();
                this.draw();
            }
        }, 2000); // Actualizar cada 2 segundos
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    addDataPoint() {
        const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
        const totalTrips = drivers.reduce((sum, d) => sum + d.trips, 0);

        this.dataPoints.earnings.push(totalEarnings);
        this.dataPoints.trips.push(totalTrips);

        // Limitar puntos
        if (this.dataPoints.earnings.length > this.maxDataPoints) {
            this.dataPoints.earnings.shift();
            this.dataPoints.trips.shift();
        }
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;

        // Limpiar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        if (this.dataPoints.earnings.length < 2) return;

        const maxEarnings = Math.max(...this.dataPoints.earnings, 100);
        const maxTrips = Math.max(...this.dataPoints.trips, 10);

        // Dibujar grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = padding + (height - padding * 2) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Función para dibujar línea
        const drawLine = (data, max, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((value, index) => {
                const x = padding + ((width - padding * 2) / (this.maxDataPoints - 1)) * index;
                const y = height - padding - ((height - padding * 2) * (value / max));

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Puntos
            data.forEach((value, index) => {
                const x = padding + ((width - padding * 2) / (this.maxDataPoints - 1)) * index;
                const y = height - padding - ((height - padding * 2) * (value / max));

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Dibujar ingresos (normalizado)
        const normalizedEarnings = this.dataPoints.earnings.map(e => (e / maxEarnings) * maxTrips);
        drawLine(normalizedEarnings, maxTrips, '#4ade80');

        // Dibujar viajes
        drawLine(this.dataPoints.trips, maxTrips, '#60a5fa');

        // Etiquetas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px Arial';
        ctx.fillText('$' + Math.round(maxEarnings), 5, padding + 5);
        ctx.fillText(maxTrips + ' viajes', 5, height - padding - 5);
    }

    reset() {
        this.dataPoints.earnings = [];
        this.dataPoints.trips = [];
        this.draw();
    }
}

const performanceChart = new PerformanceChart();

// Modificar funciones de control para incluir la gráfica
const originalStartSimulation = startSimulation;
startSimulation = function() {
    originalStartSimulation();
    performanceChart.start();
};

const originalPauseSimulation = pauseSimulation;
pauseSimulation = function() {
    originalPauseSimulation();
    performanceChart.stop();
};

const originalResetSimulation = resetSimulation;
resetSimulation = function() {
    originalResetSimulation();
    performanceChart.reset();
    performanceChart.stop();
};


// Dibujar gráfica inicial
performanceChart.draw();
// Inicializar
trafficSystem.updateUI();
updateUI();
updateStats();
drawCity();
drivers.forEach(d => d.draw());
passengers.forEach(p => p.draw());