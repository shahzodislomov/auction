/**
 * Vehicle Information Formatting Utilities for AUCTION v2 Cars
 */

import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_TYPE_LABELS,
  DRIVETRAIN_TYPE_LABELS,
  BODY_TYPE_LABELS,
  CONDITION_GRADE_LABELS,
} from '../constants/vehicleSpecs.js';

/**
 * Formats mileage number into localized string (e.g. 125 000 km)
 */
export function formatMileage(mileage, locale = 'uz') {
  if (mileage === null || mileage === undefined || isNaN(mileage)) {
    return '—';
  }
  const formattedNumber = new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US').format(mileage);
  const unit = locale === 'uz' ? 'km' : locale === 'ru' ? 'км' : 'km';
  return `${formattedNumber} ${unit}`;
}

/**
 * Formats engine volume in liters (e.g. 2.0 L or 2400 cm³)
 */
export function formatEngineVolume(volumeCcOrLiters, displayAsLiters = true) {
  if (!volumeCcOrLiters || isNaN(volumeCcOrLiters)) return '—';
  
  if (displayAsLiters) {
    const liters = volumeCcOrLiters > 50 ? (volumeCcOrLiters / 1000).toFixed(1) : Number(volumeCcOrLiters).toFixed(1);
    return `${liters} L`;
  }
  
  const cc = volumeCcOrLiters < 50 ? Math.round(volumeCcOrLiters * 1000) : volumeCcOrLiters;
  return `${cc} cm³`;
}

/**
 * Gets localized label for vehicle enum fields
 */
export function getVehicleEnumLabel(enumMap, value, locale = 'uz') {
  if (!value || !enumMap[value]) return value || '—';
  const labelObj = enumMap[value];
  return labelObj[locale] || labelObj['uz'] || labelObj['ru'] || value;
}

export const getFuelLabel = (fuelType, locale) => getVehicleEnumLabel(FUEL_TYPE_LABELS, fuelType, locale);
export const getTransmissionLabel = (transmission, locale) => getVehicleEnumLabel(TRANSMISSION_TYPE_LABELS, transmission, locale);
export const getDrivetrainLabel = (drivetrain, locale) => getVehicleEnumLabel(DRIVETRAIN_TYPE_LABELS, drivetrain, locale);
export const getBodyTypeLabel = (bodyType, locale) => getVehicleEnumLabel(BODY_TYPE_LABELS, bodyType, locale);
export const getConditionLabel = (grade, locale) => getVehicleEnumLabel(CONDITION_GRADE_LABELS, grade, locale);

/**
 * Constructs full vehicle title (e.g. "2024 Chevrolet Tahoe High Country")
 */
export function formatVehicleTitle(vehicle) {
  if (!vehicle) return '';
  const { year, makeName, make, modelName, model, trim } = vehicle;
  const yearStr = year ? `${year} ` : '';
  const makeStr = makeName || make || '';
  const modelStr = modelName || model || '';
  const trimStr = trim ? ` ${trim}` : '';
  return `${yearStr}${makeStr} ${modelStr}${trimStr}`.trim();
}
