export const PhysicsConstants = {
    // Earth constants
    EARTH_RADIUS: 6371000, // meters
    EARTH_MASS: 5.972e24, // kg
    GRAVITY_CONSTANT: 6.67430e-11, // m³/kg/s²
    GRAVITY: 9.81, // m/s²

    // Atmosphere constants
    ATMOSPHERE_HEIGHT: 100000, // meters
    AIR_DENSITY_SEA_LEVEL: 1.225, // kg/m³
    AIR_DENSITY_DECAY_RATE: 0.0001, // per meter

    // Space shuttle constants
    SHUTTLE_MASS: 110000, // kg
    FUEL_TANK_MASS: 760000, // kg
    ROCKET_MASS: 590000, // kg
    THRUST_MAIN_ENGINES: 1.8e6, // N
    THRUST_SOLID_ROCKETS: 12.5e6, // N
    FUEL_CONSUMPTION_RATE: 1000, // kg/s

    // Orbital mechanics
    LOW_EARTH_ORBIT_ALTITUDE: 200000, // meters
    GEOSTATIONARY_ORBIT_ALTITUDE: 35786000, // meters
    ORBITAL_VELOCITY_LEO: 7800, // m/s
    ORBITAL_VELOCITY_GEO: 3070, // m/s
}; 