/**
 * Test Suite for Regenerative Braking Torque Model
 * 
 * Tests for torque distribution calculations, motor constraints,
 * and vehicle dynamics considerations.
 */

import { 
  RegenerativeBrakingTorqueModel, 
  VehicleParameters, 
  BrakingDemand, 
  TorqueDistribution,
  MotorConstraints
} from '../RegenerativeBrakingTorqueModel';

describe('RegenerativeBrakingTorqueModel', () => {
  let torqueModel: RegenerativeBrakingTorqueModel;
  let vehicleParams: VehicleParameters;

  beforeEach(() => {
    vehicleParams = {
      mass: 1800,
      frontAxleWeightRatio: 0.6,
      wheelRadius: 0.35,
      motorCount: 2,
      maxMotorTorque: 400,
      motorEfficiency: 0.92,
      transmissionRatio: 1.0
    };
    torqueModel = new RegenerativeBrakingTorqueModel(vehicleParams);
  });

  describe('Initialization', () => {
    test('should initialize with correct vehicle parameters', () => {
      const diagnostics = torqueModel.getDiagnostics();
      expect(diagnostics.vehicleParams).toEqual(vehicleParams);
      expect(diagnostics.systemHealth).toBe('Operational');
    });

    test('should initialize motor constraints for 2-motor configuration', () => {
      const frontLeftStatus = torqueModel.getMotorStatus('frontLeft');
      const frontRightStatus = torqueModel.getMotorStatus('frontRight');
      const rearLeftStatus = torqueModel.getMotorStatus('rearLeft');

      expect(frontLeftStatus).toBeDefined();
      expect(frontRightStatus).toBeDefined();
      expect(rearLeftStatus).toBeNull();
    });

    test('should initialize motor constraints for 4-motor configuration', () => {
      const fourMotorParams = { ...vehicleParams, motorCount: 4 };
      const fourMotorModel = new RegenerativeBrakingTorqueModel(fourMotorParams);

      const frontLeftStatus = fourMotorModel.getMotorStatus('frontLeft');
      const rearLeftStatus = fourMotorModel.getMotorStatus('rearLeft');
      const rearRightStatus = fourMotorModel.getMotorStatus('rearRight');

      expect(frontLeftStatus).toBeDefined();
      expect(rearLeftStatus).toBeDefined();
      expect(rearRightStatus).toBeDefined();
    });
  });

  describe('Torque Distribution Calculation', () => {
    test('should calculate torque distribution for normal braking', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 5000,
        brakingIntensity: 0.5,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.7, 0.6);

      expect(distribution.frontLeftMotor).toBeGreaterThan(0);
      expect(distribution.frontRightMotor).toBeGreaterThan(0);
      expect(distribution.frontLeftMotor).toBe(distribution.frontRightMotor);
      expect(distribution.mechanicalBrakingForce).toBeGreaterThan(0);
      expect(distribution.regeneratedPower).toBeGreaterThan(0);
      expect(distribution.energyRecoveryEfficiency).toBeGreaterThan(0);
    });

    test('should distribute torque correctly for 4-motor configuration', () => {
      const fourMotorParams = { ...vehicleParams, motorCount: 4 };
      const fourMotorModel = new RegenerativeBrakingTorqueModel(fourMotorParams);

      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 8000,
        brakingIntensity: 0.6,
        vehicleSpeed: 80,
        roadGradient: 0
      };

      const distribution = fourMotorModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      expect(distribution.frontLeftMotor).toBeGreaterThan(0);
      expect(distribution.frontRightMotor).toBeGreaterThan(0);
      expect(distribution.rearLeftMotor).toBeGreaterThan(0);
      expect(distribution.rearRightMotor).toBeGreaterThan(0);
      expect(distribution.frontLeftMotor).toBe(distribution.frontRightMotor);
      expect(distribution.rearLeftMotor).toBe(distribution.rearRightMotor);
    });

    test('should reduce regeneration when battery SOC is high', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 5000,
        brakingIntensity: 0.5,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const lowSOCDistribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.3);
      const highSOCDistribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.95);

      expect(highSOCDistribution.frontLeftMotor).toBeLessThan(lowSOCDistribution.frontLeftMotor);
      expect(highSOCDistribution.regeneratedPower).toBeLessThan(lowSOCDistribution.regeneratedPower);
    });

    test('should handle zero regenerative braking ratio', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 5000,
        brakingIntensity: 0.5,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0, 0.5);

      expect(distribution.frontLeftMotor).toBe(0);
      expect(distribution.frontRightMotor).toBe(0);
      expect(distribution.mechanicalBrakingForce).toBe(brakingDemand.totalBrakingForce);
      expect(distribution.regeneratedPower).toBe(0);
    });

    test('should handle maximum regenerative braking ratio', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 3000,
        brakingIntensity: 0.3,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 1.0, 0.3);

      expect(distribution.frontLeftMotor).toBeGreaterThan(0);
      expect(distribution.frontRightMotor).toBeGreaterThan(0);
      expect(distribution.mechanicalBrakingForce).toBeGreaterThanOrEqual(0);
      expect(distribution.regeneratedPower).toBeGreaterThan(0);
    });
  });

  describe('Motor Constraints', () => {
    test('should apply maximum torque constraints', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 15000, // Very high force
        brakingIntensity: 1.0,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 1.0, 0.3);

      expect(distribution.frontLeftMotor).toBeLessThanOrEqual(vehicleParams.maxMotorTorque);
      expect(distribution.frontRightMotor).toBeLessThanOrEqual(vehicleParams.maxMotorTorque);
    });

    test('should apply power constraints at high speeds', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 8000,
        brakingIntensity: 0.8,
        vehicleSpeed: 150, // High speed
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      // At high speeds, power limitation should reduce available torque
      expect(distribution.frontLeftMotor).toBeLessThan(vehicleParams.maxMotorTorque);
      expect(distribution.frontRightMotor).toBeLessThan(vehicleParams.maxMotorTorque);
    });

    test('should apply thermal constraints', () => {
      // Set high motor temperature
      torqueModel.updateMotorTemperature('frontLeft', 145);
      torqueModel.updateMotorTemperature('frontRight', 145);

      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 6000,
        brakingIntensity: 0.6,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      // High temperature should reduce available torque
      expect(distribution.frontLeftMotor).toBeLessThan(300); // Reduced from normal
      expect(distribution.frontRightMotor).toBeLessThan(300);
    });
  });

  describe('Stability Control', () => {
    test('should calculate stability-optimized distribution', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 6000,
        brakingIntensity: 0.6,
        vehicleSpeed: 80,
        roadGradient: 0
      };

      const lateralAcceleration = 3.0; // Right turn
      const yawRate = 0.2;

      const distribution = torqueModel.calculateStabilityOptimizedDistribution(
        brakingDemand,
        lateralAcceleration,
        yawRate
      );

      // In a right turn, right side braking should be reduced
      expect(distribution.frontRightMotor).toBeLessThan(distribution.frontLeftMotor);
    });

    test('should handle left turn stability adjustment', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 6000,
        brakingIntensity: 0.6,
        vehicleSpeed: 80,
        roadGradient: 0
      };

      const lateralAcceleration = -3.0; // Left turn
      const yawRate = -0.2;

      const distribution = torqueModel.calculateStabilityOptimizedDistribution(
        brakingDemand,
        lateralAcceleration,
        yawRate
      );

      // In a left turn, left side braking should be reduced
      expect(distribution.frontLeftMotor).toBeLessThan(distribution.frontRightMotor);
    });

    test('should not adjust for straight-line braking', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 6000,
        brakingIntensity: 0.6,
        vehicleSpeed: 80,
        roadGradient: 0
      };

      const lateralAcceleration = 0; // Straight line
      const yawRate = 0;

      const distribution = torqueModel.calculateStabilityOptimizedDistribution(
        brakingDemand,
        lateralAcceleration,
        yawRate
      );

      // No lateral acceleration should result in equal torque distribution
      expect(distribution.frontLeftMotor).toBe(distribution.frontRightMotor);
    });
  });

  describe('Motor Temperature Management', () => {
    test('should update motor temperature', () => {
      const newTemperature = 95;
      torqueModel.updateMotorTemperature('frontLeft', newTemperature);

      const status = torqueModel.getMotorStatus('frontLeft');
      expect(status?.currentTemperature).toBe(newTemperature);
    });

    test('should handle invalid motor ID', () => {
      torqueModel.updateMotorTemperature('invalidMotor', 80);
      const status = torqueModel.getMotorStatus('invalidMotor');
      expect(status).toBeNull();
    });
  });

  describe('Energy Recovery Calculations', () => {
    test('should calculate regenerated power correctly', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 4000,
        brakingIntensity: 0.4,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      expect(distribution.regeneratedPower).toBeGreaterThan(0);
      expect(distribution.energyRecoveryEfficiency).toBeGreaterThan(0);
      expect(distribution.energyRecoveryEfficiency).toBeLessThanOrEqual(1);
    });

    test('should show higher efficiency at optimal speeds', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 4000,
        brakingIntensity: 0.4,
        vehicleSpeed: 54, // Optimal speed (15 m/s)
        roadGradient: 0
      };

      const lowSpeedDemand = { ...brakingDemand, vehicleSpeed: 18 }; // 5 m/s
      const highSpeedDemand = { ...brakingDemand, vehicleSpeed: 108 }; // 30 m/s

      const optimalDistribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);
      const lowSpeedDistribution = torqueModel.calculateTorqueDistribution(lowSpeedDemand, 0.8, 0.5);
      const highSpeedDistribution = torqueModel.calculateTorqueDistribution(highSpeedDemand, 0.8, 0.5);

      expect(optimalDistribution.energyRecoveryEfficiency).toBeGreaterThanOrEqual(lowSpeedDistribution.energyRecoveryEfficiency);
      expect(optimalDistribution.energyRecoveryEfficiency).toBeGreaterThanOrEqual(highSpeedDistribution.energyRecoveryEfficiency);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero braking force', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 0,
        brakingIntensity: 0,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      expect(distribution.frontLeftMotor).toBe(0);
      expect(distribution.frontRightMotor).toBe(0);
      expect(distribution.mechanicalBrakingForce).toBe(0);
      expect(distribution.regeneratedPower).toBe(0);
    });

    test('should handle zero vehicle speed', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 3000,
        brakingIntensity: 0.3,
        vehicleSpeed: 0,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      expect(distribution.regeneratedPower).toBe(0); // No power at zero speed
      expect(distribution.mechanicalBrakingForce).toBe(brakingDemand.totalBrakingForce);
    });

    test('should handle extreme motor temperatures', () => {
      torqueModel.updateMotorTemperature('frontLeft', 160); // Above thermal limit
      torqueModel.updateMotorTemperature('frontRight', 160);

      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 5000,
        brakingIntensity: 0.5,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      // Should severely limit motor torque due to thermal protection
      expect(distribution.frontLeftMotor).toBeLessThan(50);
      expect(distribution.frontRightMotor).toBeLessThan(50);
    });
  });

  describe('Performance Validation', () => {
    test('should maintain energy conservation', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 6000,
        brakingIntensity: 0.6,
        vehicleSpeed: 72, // 20 m/s
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.7, 0.5);

      const totalMotorTorque = distribution.frontLeftMotor + distribution.frontRightMotor;
      const motorBrakingForce = totalMotorTorque / vehicleParams.wheelRadius;
      const totalCalculatedForce = motorBrakingForce + distribution.mechanicalBrakingForce;

      // Total force should approximately equal demanded force (within tolerance)
      expect(Math.abs(totalCalculatedForce - brakingDemand.totalBrakingForce)).toBeLessThan(100);
    });

    test('should show reasonable power levels', () => {
      const brakingDemand: BrakingDemand = {
        totalBrakingForce: 5000,
        brakingIntensity: 0.5,
        vehicleSpeed: 60,
        roadGradient: 0
      };

      const distribution = torqueModel.calculateTorqueDistribution(brakingDemand, 0.8, 0.5);

      // Power should be reasonable for the given conditions
      expect(distribution.regeneratedPower).toBeGreaterThan(1000); // At least 1 kW
      expect(distribution.regeneratedPower).toBeLessThan(300000); // Less than 300 kW
    });
  });
});