// intelligent-agents.js - Agentes con inteligencia avanzada

console.log("\n🧠 === SISTEMA DE AGENTES INTELIGENTES ===\n");

// Sistema de tráfico dinámico
class TrafficSystem {
    constructor() {
        this.congestionLevel = 'low'; // low, medium, high
        this.timeOfDay = 'morning'; // morning, afternoon, evening, night
    }

    updateTraffic() {
        const levels = ['low', 'medium', 'high'];
        const times = ['morning', 'afternoon', 'evening', 'night'];
        
        this.congestionLevel = levels[Math.floor(Math.random() * levels.length)];
        this.timeOfDay = times[Math.floor(Math.random() * times.length)];
        
        console.log(`🚦 Actualización de tráfico: ${this.congestionLevel.toUpperCase()}`);
        console.log(`   Hora del día: ${this.timeOfDay}`);
    }

    getTrafficMultiplier() {
        const multipliers = {
            'low': 1.0,
            'medium': 1.3,
            'high': 1.6
        };
        return multipliers[this.congestionLevel];
    }
}

// Conductor inteligente con toma de decisiones
class IntelligentDriverAgent {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.available = true;
        this.tripsCompleted = 0;
        this.earnings = 0;
        this.rating = 5.0; // Rating inicial
        this.totalRatings = 0;
        this.energy = 100; // Nivel de energía (cansancio)
        this.preferences = {
            minFare: 50,
            maxDistance: 20,
            preferredAreas: ['Centro', 'Zona Norte']
        };
    }

    // Decisión inteligente: ¿Acepto este viaje?
    evaluateRideRequest(request, trafficSystem) {
        console.log(`\n🤔 ${this.name} evaluando solicitud...`);
        
        let score = 0;
        let reasons = [];

        // Factor 1: Distancia
        if (request.distance <= 5) {
            score += 30;
            reasons.push("✅ Distancia corta (+30)");
        } else if (request.distance <= 10) {
            score += 20;
            reasons.push("✅ Distancia media (+20)");
        } else if (request.distance <= this.preferences.maxDistance) {
            score += 10;
            reasons.push("⚠️ Distancia larga (+10)");
        } else {
            score -= 20;
            reasons.push("❌ Distancia muy larga (-20)");
        }

        // Factor 2: Ganancia estimada
        const estimatedFare = this.calculateDynamicFare(request.distance, trafficSystem);
        if (estimatedFare >= this.preferences.minFare * 1.5) {
            score += 25;
            reasons.push("✅ Tarifa excelente (+25)");
        } else if (estimatedFare >= this.preferences.minFare) {
            score += 15;
            reasons.push("✅ Tarifa aceptable (+15)");
        } else {
            score -= 10;
            reasons.push("❌ Tarifa baja (-10)");
        }

        // Factor 3: Nivel de energía
        if (this.energy > 70) {
            score += 20;
            reasons.push("✅ Energía alta (+20)");
        } else if (this.energy > 40) {
            score += 10;
            reasons.push("⚠️ Energía media (+10)");
        } else {
            score -= 15;
            reasons.push("❌ Cansado (-15)");
        }

        // Factor 4: Rating del pasajero
        if (request.passengerRating >= 4.5) {
            score += 15;
            reasons.push("✅ Pasajero bien calificado (+15)");
        } else if (request.passengerRating < 3.0) {
            score -= 20;
            reasons.push("❌ Pasajero con bajo rating (-20)");
        }

        // Factor 5: Congestión de tráfico
        const congestionPenalty = {
            'low': 5,
            'medium': 0,
            'high': -15
        };
        score += congestionPenalty[trafficSystem.congestionLevel];
        reasons.push(`🚦 Tráfico ${trafficSystem.congestionLevel} (${congestionPenalty[trafficSystem.congestionLevel]})`);

        // Mostrar análisis
        console.log(`   Análisis de ${this.name}:`);
        reasons.forEach(reason => console.log(`   ${reason}`));
        console.log(`   📊 Puntuación final: ${score}/100`);

        const decision = score >= 40;
        console.log(`   ${decision ? '✅ ACEPTO' : '❌ RECHAZO'} el viaje`);
        
        return { decision, score, estimatedFare };
    }

    // Calcular tarifa dinámica basada en múltiples factores
    calculateDynamicFare(distance, trafficSystem) {
        const baseRate = 30;
        const perKm = 10;
        let fare = baseRate + (distance * perKm);

        // Ajuste por tráfico
        fare *= trafficSystem.getTrafficMultiplier();

        // Ajuste por demanda (simulado)
        const demandMultiplier = 1 + (Math.random() * 0.3); // 1.0 - 1.3x
        fare *= demandMultiplier;

        // Ajuste por rating del conductor
        if (this.rating >= 4.8) {
            fare *= 1.1; // Conductores premium cobran 10% más
        }

        return Math.round(fare);
    }

    // Negociar precio con el pasajero
    negotiatePrice(passengerOffer, originalFare) {
        console.log(`\n💰 ${this.name} negociando precio...`);
        console.log(`   Tarifa original: $${originalFare}`);
        console.log(`   Oferta del pasajero: $${passengerOffer}`);

        const difference = originalFare - passengerOffer;
        const percentageDiff = (difference / originalFare) * 100;

        if (percentageDiff <= 5) {
            console.log(`   ✅ Acepto la oferta (diferencia ${percentageDiff.toFixed(1)}%)`);
            return { accepted: true, finalPrice: passengerOffer };
        } else if (percentageDiff <= 15) {
            const counterOffer = Math.round((originalFare + passengerOffer) / 2);
            console.log(`   💬 Contraoferta: $${counterOffer}`);
            return { accepted: false, counterOffer };
        } else {
            console.log(`   ❌ Diferencia muy grande (${percentageDiff.toFixed(1)}%)`);
            return { accepted: false, counterOffer: null };
        }
    }

    // Aceptar viaje después de evaluación
    acceptRide(passenger, destination, distance, fare) {
        this.available = false;
        this.energy -= 10; // Pierde energía
        
        console.log(`\n🚕 ${this.name}: ¡En camino ${passenger.name}!`);
        console.log(`   📍 ${this.location} → ${destination}`);
        console.log(`   📏 ${distance} km | 💵 $${fare}`);
        console.log(`   ⚡ Energía restante: ${this.energy}%`);
        
        return fare;
    }

    // Completar viaje y recibir calificación
    completeRide(fare, passengerRating) {
        this.tripsCompleted++;
        this.earnings += fare;
        this.available = true;
        
        // Actualizar rating
        this.totalRatings++;
        this.rating = ((this.rating * (this.totalRatings - 1)) + passengerRating) / this.totalRatings;
        
        console.log(`\n✅ ${this.name}: Viaje completado`);
        console.log(`   ⭐ Calificación recibida: ${passengerRating}/5.0`);
        console.log(`   ⭐ Rating actual: ${this.rating.toFixed(2)}/5.0`);
        console.log(`   💰 Ganancia: $${fare} | Total: $${this.earnings}`);
        console.log(`   📊 Viajes: ${this.tripsCompleted}`);
    }

    // Descansar para recuperar energía
    rest() {
        const recovery = 30;
        this.energy = Math.min(100, this.energy + recovery);
        console.log(`\n😴 ${this.name} descansa (+${recovery}% energía → ${this.energy}%)`);
    }
}

// Pasajero inteligente
class IntelligentPassengerAgent {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.rating = 4.0 + Math.random(); // 4.0 - 5.0
        this.budget = 200;
        this.pricePreference = 'medium'; // low, medium, high
    }

    requestRide(destination, distance) {
        console.log(`\n👤 ${this.name}: Solicito viaje`);
        console.log(`   ${this.location} → ${destination} (${distance} km)`);
        console.log(`   ⭐ Mi rating: ${this.rating.toFixed(2)}`);
        
        return {
            passenger: this,
            destination,
            distance,
            passengerRating: this.rating
        };
    }

    // Decidir si hacer contraoferta
    considerCounterOffer(fare, maxBudget) {
        if (this.pricePreference === 'low' && fare > maxBudget * 0.7) {
            const offer = Math.round(fare * 0.85);
            console.log(`\n💬 ${this.name}: El precio es alto, ofrezco $${offer}`);
            return offer;
        }
        return fare;
    }

    // Calificar al conductor
    rateDriver(driver, serviceQuality) {
        let rating = serviceQuality; // base rating
        
        if (driver.energy < 30) rating -= 0.5; // Conductor cansado
        if (driver.rating >= 4.8) rating += 0.3; // Bono por excelencia
        
        rating = Math.max(1, Math.min(5, rating));
        console.log(`\n⭐ ${this.name} califica a ${driver.name}: ${rating.toFixed(1)}/5.0`);
        
        return rating;
    }
}

// Sistema de matching inteligente
class SmartMatchingSystem {
    constructor() {
        this.drivers = [];
    }

    addDriver(driver) {
        this.drivers.push(driver);
    }

    findBestMatch(request, trafficSystem) {
        console.log(`\n🔍 Buscando mejor conductor para ${request.passenger.name}...`);
        
        const availableDrivers = this.drivers.filter(d => d.available);
        
        if (availableDrivers.length === 0) {
            console.log("❌ No hay conductores disponibles");
            return null;
        }

        let bestDriver = null;
        let bestScore = -Infinity;

        availableDrivers.forEach(driver => {
            const evaluation = driver.evaluateRideRequest(request, trafficSystem);
            
            if (evaluation.decision && evaluation.score > bestScore) {
                bestScore = evaluation.score;
                bestDriver = { driver, evaluation };
            }
        });

        if (bestDriver) {
            console.log(`\n✨ Mejor match: ${bestDriver.driver.name} (score: ${bestScore})`);
        } else {
            console.log("\n❌ Ningún conductor aceptó el viaje");
        }

        return bestDriver;
    }
}

// Función auxiliar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === SIMULACIÓN PRINCIPAL ===
async function runIntelligentSimulation() {
    console.log("🚀 Iniciando sistema inteligente de movilidad...\n");
    
    // Crear sistema de tráfico
    const traffic = new TrafficSystem();
    
    // Crear sistema de matching
    const matchingSystem = new SmartMatchingSystem();
    
    // Crear conductores inteligentes
    const driver1 = new IntelligentDriverAgent("Carlos", "Centro");
    const driver2 = new IntelligentDriverAgent("María", "Zona Norte");
    const driver3 = new IntelligentDriverAgent("Pedro", "Zona Sur");
    
    matchingSystem.addDriver(driver1);
    matchingSystem.addDriver(driver2);
    matchingSystem.addDriver(driver3);
    
    // Crear pasajeros inteligentes
    const passenger1 = new IntelligentPassengerAgent("Ana", "Centro Comercial");
    const passenger2 = new IntelligentPassengerAgent("Luis", "Universidad");
    
    console.log("👥 Agentes creados:");
    console.log(`   🚗 ${driver1.name} (⭐${driver1.rating}) - ${driver1.location}`);
    console.log(`   🚗 ${driver2.name} (⭐${driver2.rating}) - ${driver2.location}`);
    console.log(`   🚗 ${driver3.name} (⭐${driver3.rating}) - ${driver3.location}`);
    console.log(`   👤 ${passenger1.name} (⭐${passenger1.rating.toFixed(2)})`);
    console.log(`   👤 ${passenger2.name} (⭐${passenger2.rating.toFixed(2)})`);
    
    // === SIMULACIÓN DE VIAJES ===
    
    console.log("\n" + "=".repeat(60));
    console.log("VIAJE 1");
    console.log("=".repeat(60));
    
    traffic.updateTraffic();
    const request1 = passenger1.requestRide("Aeropuerto", 12);
    const match1 = matchingSystem.findBestMatch(request1, traffic);
    
    if (match1) {
        const fare1 = match1.driver.acceptRide(
            request1.passenger,
            request1.destination,
            request1.distance,
            match1.evaluation.estimatedFare
        );
        
        await sleep(1500);
        const serviceRating1 = 4.5 + Math.random() * 0.5;
        const rating1 = passenger1.rateDriver(match1.driver, serviceRating1);
        match1.driver.completeRide(fare1, rating1);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("VIAJE 2");
    console.log("=".repeat(60));
    
    // Conductor 1 descansa
    driver1.rest();
    
    traffic.updateTraffic();
    const request2 = passenger2.requestRide("Estadio", 15);
    const match2 = matchingSystem.findBestMatch(request2, traffic);
    
    if (match2) {
        const fare2 = match2.driver.acceptRide(
            request2.passenger,
            request2.destination,
            request2.distance,
            match2.evaluation.estimatedFare
        );
        
        await sleep(1500);
        const serviceRating2 = 4.0 + Math.random() * 0.5;
        const rating2 = passenger2.rateDriver(match2.driver, serviceRating2);
        match2.driver.completeRide(fare2, rating2);
    }
    
    // === RESUMEN FINAL ===
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN DEL SISTEMA");
    console.log("=".repeat(60));
    
    [driver1, driver2, driver3].forEach(driver => {
        console.log(`\n🚗 ${driver.name}:`);
        console.log(`   ⭐ Rating: ${driver.rating.toFixed(2)}/5.0`);
        console.log(`   📊 Viajes: ${driver.tripsCompleted}`);
        console.log(`   💰 Ganancias: $${driver.earnings}`);
        console.log(`   ⚡ Energía: ${driver.energy}%`);
        console.log(`   ${driver.available ? '✅ Disponible' : '❌ Ocupado'}`);
    });
    
    console.log("\n✅ Simulación completada!\n");
}

// Ejecutar
runIntelligentSimulation().catch(console.error);

export { IntelligentDriverAgent, IntelligentPassengerAgent, SmartMatchingSystem, TrafficSystem };