import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatMileage,
  formatEngineVolume,
  getFuelLabel,
  getTransmissionLabel,
  formatVehicleTitle,
} from '../src/utils/vehicleFormatters.js';

describe('Vehicle Formatters Utility (AUCTION v2)', () => {
  it('formats mileage correctly across locales', () => {
    const formatted = formatMileage(125000, 'uz');
    assert.ok(formatted.includes('125'));
    assert.ok(formatted.includes('km'));
    assert.strictEqual(formatMileage(null, 'uz'), '—');
  });

  it('formats engine volume correctly', () => {
    assert.strictEqual(formatEngineVolume(2000, true), '2.0 L');
    assert.strictEqual(formatEngineVolume(2.4, true), '2.4 L');
    assert.strictEqual(formatEngineVolume(2000, false), '2000 cm³');
    assert.strictEqual(formatEngineVolume(null), '—');
  });

  it('returns localized enum labels for fuel and transmission', () => {
    assert.strictEqual(getFuelLabel('GASOLINE', 'uz'), 'Benzin');
    assert.strictEqual(getFuelLabel('GASOLINE', 'ru'), 'Бензин');
    assert.strictEqual(getTransmissionLabel('AUTOMATIC', 'uz'), 'Avtomat');
    assert.strictEqual(getTransmissionLabel('AUTOMATIC', 'ru'), 'Автомат');
  });

  it('formats vehicle title nicely', () => {
    const vehicle = {
      year: 2024,
      makeName: 'Chevrolet',
      modelName: 'Tahoe',
      trim: 'High Country',
    };
    assert.strictEqual(formatVehicleTitle(vehicle), '2024 Chevrolet Tahoe High Country');
  });
});
