// driver-agent.js - Agente conductor simplificado

console.log("\n🚗 === SISTEMA DE AGENTES DE MOVILIDAD URBANA ===\n");

// Definición del agente conductor
class DriverAgent {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.available = true;
        this.tripsCompleted = 0;
        this.currentPassenger = null;
        this.earnings = 0;
    }

    // Método para aceptar un viaje
    acceptRide(passenger, destination, distance) {
        if (!this.available) {
            return `❌ ${this.name}: Lo siento, no estoy disponible en este momento.`;
        }

        this.available = false;
        this.currentPassenger = passenger;
        const fare = this.calculateFare(distance);
        
        console.log(`\n🚕 ${this.name}: ¡Hola ${passenger}! Voy en camino a recogerte.`);
        console.log(`📍 Ubicación actual: ${this.location}`);
        console.log(`🎯 Destino: ${destination}`);
        console.log(`📏 Distancia: ${distance} km`);
        console.log(`💵 Tarifa: $${fare}`);
        
        return fare;
    }

    // Calcular tarifa basada en distancia
    calculateFare(distance) {
        const baseRate = 30;
        const perKm = 10;
        return baseRate + (distance * perKm);
    }

    // Completar viaje
    completeRide(fare) {
        console.log(`\n✅ ${this.name}: ¡Viaje completado! Gracias ${this.currentPassenger}.`);
        this.tripsCompleted++;
        this.earnings += fare;
        this.available = true;
        this.currentPassenger = null;
        
        console.log(`📊 Estadísticas del día:`);
        console.log(`   - Viajes completados: ${this.tripsCompleted}`);
        console.log(`   - Ganancias totales: $${this.earnings}`);
        console.log(`   - Estado: ${this.available ? 'Disponible' : 'Ocupado'}`);
    }

    // Optimizar ruta (simulación simple)
    optimizeRoute(origin, destination) {
        const routes = [
            { name: "Ruta Principal", time: 15, distance: 8 },
            { name: "Atajo por calles laterales", time: 12, distance: 7 },
            { name: "Ruta escénica", time: 20, distance: 10 }
        ];

        console.log(`\n🗺️ ${this.name}: Analizando mejores rutas...`);
        routes.forEach(route => {
            console.log(`   ${route.name}: ${route.time} min, ${route.distance} km`);
        });

        const bestRoute = routes.reduce((prev, current) => 
            prev.time < current.time ? prev : current
        );

        console.log(`✨ Mejor opción: ${bestRoute.name} (${bestRoute.time} min)`);
        return bestRoute;
    }
}

// Definición del agente pasajero
class PassengerAgent {
    constructor(name, location) {
        this.name = name;
        this.location = location;
    }

    requestRide(destination, distance) {
        console.log(`\n👤 ${this.name}: Necesito un viaje de ${this.location} a ${destination}`);
        console.log(`📍 Distancia estimada: ${distance} km`);
        return { passenger: this.name, destination, distance };
    }
}

// === SIMULACIÓN DEL SISTEMA ===
async function runSimulation() {
    console.log("🚀 Iniciando simulación del sistema de movilidad urbana...\n");
    
    // Crear agentes conductores
    const driver1 = new DriverAgent("Carlos", "Centro");
    const driver2 = new DriverAgent("María", "Zona Norte");
    
    // Crear agentes pasajeros
    const passenger1 = new PassengerAgent("Ana", "Centro Comercial");
    const passenger2 = new PassengerAgent("Luis", "Universidad");
    
    console.log("👥 Agentes creados:");
    console.log(`   🚗 Conductor: ${driver1.name} (${driver1.location})`);
    console.log(`   🚗 Conductor: ${driver2.name} (${driver2.location})`);
    console.log(`   👤 Pasajero: ${passenger1.name} (${passenger1.location})`);
    console.log(`   👤 Pasajero: ${passenger2.name} (${passenger2.location})`);
    
    // Simulación de viajes
    console.log("\n" + "=".repeat(50));
    console.log("VIAJE 1");
    console.log("=".repeat(50));
    
    const request1 = passenger1.requestRide("Aeropuerto", 12);
    driver1.optimizeRoute(passenger1.location, request1.destination);
    const fare1 = driver1.acceptRide(
        request1.passenger, 
        request1.destination, 
        request1.distance
    );
    
    await sleep(2000); // Simular tiempo de viaje
    driver1.completeRide(fare1);
    
    console.log("\n" + "=".repeat(50));
    console.log("VIAJE 2");
    console.log("=".repeat(50));
    
    const request2 = passenger2.requestRide("Estadio", 8);
    driver2.optimizeRoute(passenger2.location, request2.destination);
    const fare2 = driver2.acceptRide(
        request2.passenger,
        request2.destination,
        request2.distance
    );
    
    await sleep(2000);
    driver2.completeRide(fare2);
    
    // Resumen del sistema
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN DEL SISTEMA");
    console.log("=".repeat(50));
    console.log(`\n🚗 ${driver1.name}:`);
    console.log(`   Viajes: ${driver1.tripsCompleted}`);
    console.log(`   Ganancias: $${driver1.earnings}`);
    console.log(`   Estado: ${driver1.available ? '✅ Disponible' : '❌ Ocupado'}`);
    
    console.log(`\n🚗 ${driver2.name}:`);
    console.log(`   Viajes: ${driver2.tripsCompleted}`);
    console.log(`   Ganancias: $${driver2.earnings}`);
    console.log(`   Estado: ${driver2.available ? '✅ Disponible' : '❌ Ocupado'}`);
    
    const totalTrips = driver1.tripsCompleted + driver2.tripsCompleted;
    const totalEarnings = driver1.earnings + driver2.earnings;
    
    console.log(`\n💰 Total del sistema:`);
    console.log(`   Viajes completados: ${totalTrips}`);
    console.log(`   Ingresos generados: $${totalEarnings}`);
    console.log(`   Eficiencia: ${((totalTrips / 2) * 100).toFixed(0)}%`);
    
    console.log("\n✅ Simulación completada exitosamente!\n");
}

// Función auxiliar para simular delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar simulación
runSimulation().catch(console.error);