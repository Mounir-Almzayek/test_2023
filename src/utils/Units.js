export class Units {
    // Base conversion ratio (how many project units per real unit)
    static METER_TO_UNIT = 0.05; // 1 meter = 0.05 units in our project
    static UNIT_TO_METER = 20;   // 1 unit = 20 meters in real world

    // Real world units (in meters)
    static METER = 1;
    static CENTIMETER = 0.01;
    static MILLIMETER = 0.001;
    static KILOMETER = 1000;

    // Common angles (in radians)
    static DEGREE_45 = Math.PI / 4;
    static DEGREE_90 = Math.PI / 2;
    static DEGREE_180 = Math.PI;
    static DEGREE_360 = Math.PI * 2;

    // Convert real world measurements to project units
    static toProjectUnits(realWorldValue, fromUnit = this.METER) {
        // First convert to meters, then to project units
        const meters = realWorldValue * fromUnit;
        return meters * this.METER_TO_UNIT;
    }

    // Convert project units back to real world measurements
    static toRealWorld(projectValue, toUnit = this.METER) {
        // First convert to meters, then to desired unit
        const meters = projectValue * this.UNIT_TO_METER;
        return meters / toUnit;
    }

    // Helper methods for common conversions
    static getProjectPosition(realWorldPosition, fromUnit = this.METER) {
        return {
            x: this.toProjectUnits(realWorldPosition.x, fromUnit),
            y: this.toProjectUnits(realWorldPosition.y, fromUnit),
            z: this.toProjectUnits(realWorldPosition.z, fromUnit)
        };
    }

    static getProjectSize(realWorldSize, fromUnit = this.METER) {
        return {
            width: this.toProjectUnits(realWorldSize.width, fromUnit),
            height: this.toProjectUnits(realWorldSize.height, fromUnit),
            depth: this.toProjectUnits(realWorldSize.depth, fromUnit)
        };
    }

    // Example usage:
    // If we have a spacecraft that is 1000 meters long:
    // const length = Units.toProjectUnits(1000); // Will return 50 (1000 * 0.05)
    // const width = Units.toProjectUnits(500);   // Will return 25 (500 * 0.05)
    // const height = Units.toProjectUnits(300);  // Will return 15 (300 * 0.05)

    // Conversion methods
    static toMeters(value, fromUnit) {
        return value * fromUnit;
    }

    static toCentimeters(value, fromUnit) {
        return (value * fromUnit) / this.CENTIMETER;
    }

    static toMillimeters(value, fromUnit) {
        return (value * fromUnit) / this.MILLIMETER;
    }

    static toKilometers(value, fromUnit) {
        return (value * fromUnit) / this.KILOMETER;
    }

    // Helper methods for common operations
    static getRandomSize(min = this.SMALL, max = this.LARGE) {
        return Math.random() * (max - min) + min;
    }

    static getRandomPosition(range = this.MEDIUM_DISTANCE) {
        return {
            x: (Math.random() - 0.5) * range,
            y: (Math.random() - 0.5) * range,
            z: (Math.random() - 0.5) * range
        };
    }

    static getRandomRotation() {
        return {
            x: Math.random() * this.DEGREE_360,
            y: Math.random() * this.DEGREE_360,
            z: Math.random() * this.DEGREE_360
        };
    }

    // Common object dimensions
    static getCubeSize(size = this.MEDIUM) {
        return {
            width: size,
            height: size,
            depth: size
        };
    }

    static getSphereSize(radius = this.MEDIUM) {
        return {
            radius: radius
        };
    }

    static getPlaneSize(width = this.MEDIUM, height = this.MEDIUM) {
        return {
            width: width,
            height: height
        };
    }
} 