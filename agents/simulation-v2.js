// simulation-v2.js - Simulación mejorada con más escenarios

import { IntelligentDriverAgent, IntelligentPassengerAgent, 
         SmartMatchingSystem, TrafficSystem } from './intelligent-agents.js';

console.log("\n🌆 === SIMULACIÓN CIUDAD COMPLETA - V2 ===\n");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCitySimulation() {

    const traffic = new TrafficSystem();
    const matchingSystem = new SmartMatchingSystem();

    // Crear 4 conductores con diferentes características
    const drivers = [
        new IntelligentDriverAgent("Carlos", "Centro"),
        new IntelligentDriverAgent("María", "Zona Norte"),
        new IntelligentDriverAgent("Pedro", "Zona Sur"),
        new IntelligentDriverAgent("Laura", "Zona Este"),
    ];

    // Hacer que algunos conductores estén cansados desde el inicio
    drivers[2].energy = 25; // Pedro muy cansado
    drivers[3].energy = 45; // Laura algo cansada

    // Crear 5 pasajeros
    const passengers = [
        new IntelligentPassengerAgent("Ana", "Centro Comercial"),
        new IntelligentPassengerAgent("Luis", "Universidad"),
        new IntelligentPassengerAgent("Sara", "Hospital"),
        new IntelligentPassengerAgent("Miguel", "Parque"),
        new IntelligentPassengerAgent("Elena", "Mercado"),
    ];

    // Agregar conductores al sistema
    drivers.forEach(d => matchingSystem.addDriver(d));

    // Mostrar estado inicial
    console.log("🚗 Estado inicial de conductores:");
    drivers.forEach(d => {
        const status = d.energy > 50 ? "💪 Listo" : 
                       d.energy > 30 ? "😐 Cansado" : "😴 Muy cansado";
        console.log(`   ${d.name}: ⚡${d.energy}% ${status}`);
    });

    // Lista de viajes a simular
    const rides = [
        { passenger: passengers[0], destination: "Aeropuerto", distance: 12 },
        { passenger: passengers[1], destination: "Estadio", distance: 8 },
        { passenger: passengers[2], destination: "Centro", distance: 5 },
        { passenger: passengers[3], destination: "Mall", distance: 15 },
        { passenger: passengers[4], destination: "Hotel", distance: 6 },
    ];

    // Simular todos los viajes
    for (let i = 0; i < rides.length; i++) {
        const ride = rides[i];
        
        console.log("\n" + "=".repeat(60));
        console.log(`VIAJE ${i + 1}/${rides.length}`);
        console.log("=".repeat(60));

        // Actualizar tráfico aleatoriamente
        traffic.updateTraffic();

        // Solicitar viaje
        const request = ride.passenger.requestRide(ride.destination, ride.distance);

        // Buscar mejor match
        const match = matchingSystem.findBestMatch(request, traffic);

        if (match) {
            const fare = match.driver.acceptRide(
                request.passenger,
                request.destination,
                request.distance,
                match.evaluation.estimatedFare
            );

            await sleep(1000);

            // Calificación aleatoria realista (3.5 - 5.0)
            const serviceQuality = 3.5 + Math.random() * 1.5;
            const rating = ride.passenger.rateDriver(match.driver, serviceQuality);
            match.driver.completeRide(fare, rating);

            // Si el conductor está muy cansado, descansa
            if (match.driver.energy < 30) {
                match.driver.rest();
            }

        } else {
            console.log(`\n😞 ${ride.passenger.name} no encontró conductor disponible`);
        }

        await sleep(500);
    }

    // === RESUMEN FINAL ===
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN FINAL DE LA CIUDAD");
    console.log("=".repeat(60));

    let totalTrips = 0;
    let totalEarnings = 0;

    drivers.forEach(driver => {
        totalTrips += driver.tripsCompleted;
        totalEarnings += driver.earnings;
        
        const performance = driver.rating >= 4.5 ? "🌟 Excelente" :
                           driver.rating >= 4.0 ? "✅ Bueno" :
                           driver.rating >= 3.0 ? "⚠️ Regular" : "❌ Malo";

        console.log(`\n🚗 ${driver.name}:`);
        console.log(`   ${performance} | ⭐ ${driver.rating.toFixed(2)}/5.0`);
        console.log(`   📊 Viajes: ${driver.tripsCompleted}`);
        console.log(`   💰 Ganancias: $${driver.earnings}`);
        console.log(`   ⚡ Energía: ${driver.energy}%`);
    });

    console.log("\n" + "=".repeat(60));
    console.log(`🏙️ ESTADÍSTICAS DE LA CIUDAD:`);
    console.log(`   Total viajes: ${totalTrips}/${rides.length}`);
    console.log(`   Tasa de éxito: ${((totalTrips/rides.length)*100).toFixed(0)}%`);
    console.log(`   Economía generada: $${totalEarnings}`);
    console.log(`   Promedio por viaje: $${(totalEarnings/totalTrips || 0).toFixed(0)}`);
    console.log("=".repeat(60));
    console.log("\n✅ ¡Simulación de ciudad completada!\n");
}

runCitySimulation().catch(console.error);