// visualization.js - Visualización del sistema de agentes

const canvas = document.getElementById('cityMap');
const ctx = canvas.getContext('2d');

// Ajustar tamaño del canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estado de la simulación
let isRunning = false;
let animationFrame;

// Datos de la ciudad
const cityGrid = {
    rows: 8,
    cols: 10,
    cellSize: 0
};

// Calcular tamaño de celda
function calculateCellSize() {
    cityGrid.cellSize = Math.min(
        canvas.width / cityGrid.cols,
        canvas.height / cityGrid.rows
    );
}

// Clase Driver
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
    }

    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.available = false;
    }

    update() {
        // Mover hacia el objetivo
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
        this.earnings += fare;
        this.energy -= 10;
        this.available = true;
        this.currentPassenger = null;
        updateStats();
    }

    draw() {
        const cellSize = cityGrid.cellSize;
        const pixelX = this.x * cellSize;
        const pixelY = this.y * cellSize;

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(pixelX + 3, pixelY + 3, cellSize * 0.8, cellSize * 0.8);

        // Cuerpo del carro
        ctx.fillStyle = this.color;
        ctx.fillRect(pixelX, pixelY, cellSize * 0.8, cellSize * 0.8);

        // Estado
        if (this.available) {
            ctx.fillStyle = '#4ade80';
        } else {
            ctx.fillStyle = '#f59e0b';
        }
        ctx.fillRect(pixelX, pixelY, cellSize * 0.2, cellSize * 0.2);

        // Nombre
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(this.name, pixelX, pixelY - 5);
    }
}

// Clase Passenger
class Passenger {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.waiting = true;
        this.destinationX = Math.floor(Math.random() * cityGrid.cols);
        this.destinationY = Math.floor(Math.random() * cityGrid.rows);
    }

    draw() {
        if (!this.waiting) return;

        const cellSize = cityGrid.cellSize;
        const pixelX = this.x * cellSize;
        const pixelY = this.y * cellSize;

        // Icono de persona
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(pixelX + cellSize * 0.4, pixelY + cellSize * 0.3, cellSize * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(pixelX + cellSize * 0.2, pixelY + cellSize * 0.5, cellSize * 0.4, cellSize * 0.3);

        // Nombre
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(this.name, pixelX, pixelY - 5);
    }
}

// Sistema de tráfico
const trafficSystem = {
    level: 'low',
    levels: ['low', 'medium', 'high'],
    
    update() {
        if (Math.random() < 0.02) {
            this.level = this.levels[Math.floor(Math.random() * this.levels.length)];
            this.updateUI();
        }
    },
    
    updateUI() {
        const light = document.getElementById('trafficLight');
        const text = document.getElementById('trafficLevel');
        
        light.className = 'traffic-light';
        
        switch(this.level) {
            case 'low':
                light.classList.add('traffic-low');
                text.textContent = 'Tráfico: BAJO';
                break;
            case 'medium':
                light.classList.add('traffic-medium');
                text.textContent = 'Tráfico: MEDIO';
                break;
            case 'high':
                light.classList.add('traffic-high');
                text.textContent = 'Tráfico: ALTO';
                break;
        }
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

// Dibujar la cuadrícula de la ciudad
function drawCity() {
    calculateCellSize();
    const cellSize = cityGrid.cellSize;

    // Fondo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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

    // Puntos de interés
    const poi = [
        { x: 5, y: 1, label: '🏢 Centro', color: '#6366f1' },
        { x: 2, y: 4, label: '🏥 Hospital', color: '#ef4444' },
        { x: 8, y: 4, label: '🏫 Universidad', color: '#10b981' },
        { x: 5, y: 7, label: '✈️ Aeropuerto', color: '#f59e0b' }
    ];

    poi.forEach(p => {
        ctx.fillStyle = p.color + '44';
        ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(p.label, p.x * cellSize + 5, p.y * cellSize + cellSize - 5);
    });
}

// Actualizar interfaz
function updateUI() {
    // Actualizar lista de conductores
    const driversList = document.getElementById('driversList');
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
                ⭐ ${driver.rating.toFixed(1)} | 📊 ${driver.trips} viajes | 💰 $${Math.round(driver.earnings)}<br>
                ⚡ Energía: ${driver.energy}%
            </div>
        `;
        driversList.appendChild(card);
    });

    // Actualizar lista de pasajeros
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
                📍 Posición: (${passenger.x}, ${passenger.y})<br>
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

    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalEarnings').textContent = `$${Math.round(totalEarnings)}`;
    document.getElementById('activeDrivers').textContent = `${activeDrivers}/${drivers.length}`;
    document.getElementById('efficiency').textContent = `${Math.round((totalTrips / (totalTrips + passengers.filter(p => p.waiting).length || 1)) * 100)}%`;
}

// Asignar viaje automáticamente
function assignRide() {
    const availableDrivers = drivers.filter(d => d.available);
    const waitingPassengers = passengers.filter(p => p.waiting);

    if (availableDrivers.length > 0 && waitingPassengers.length > 0) {
        const driver = availableDrivers[0];
        const passenger = waitingPassengers[0];

        driver.moveTo(passenger.destinationX, passenger.destinationY);
        driver.currentPassenger = passenger;
        passenger.waiting = false;

        console.log(`${driver.name} recogió a ${passenger.name}`);
    }
}

// Loop de animación
function animate() {
    if (!isRunning) return;

    drawCity();

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

    // Asignar viajes automáticamente
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
        animate();
    }
}

function pauseSimulation() {
    isRunning = false;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
}

function resetSimulation() {
    pauseSimulation();
    drivers.forEach((driver, i) => {
        driver.x = driver.targetX = (i % 2 === 0) ? 2 : 7;
        driver.y = driver.targetY = (i < 2) ? 2 : 6;
        driver.trips = 0;
        driver.earnings = 0;
        driver.energy = 100;
        driver.available = true;
    });
    
    passengers.forEach((p, i) => {
        p.waiting = true;
        p.x = 3 + i;
        p.y = 1 + (i % 4);
    });

    updateStats();
    drawCity();
    drivers.forEach(d => d.draw());
    passengers.forEach(p => p.draw());
}

// Inicializar
trafficSystem.updateUI();
updateUI();
updateStats();
drawCity();
drivers.forEach(d => d.draw());
passengers.forEach(p => p.draw());