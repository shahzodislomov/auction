import { adaptLegacyLot } from "@/lib/auction/adaptLegacyLot";
import type { LegacyLot, VehicleAuction } from "@/lib/auction/types";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;

export function adaptAuction(value: unknown): VehicleAuction | null {
  const auction = asRecord(value);
  if (!auction) return null;
  const vehicle = asRecord(auction.vehicle) ?? {};
  const auctionId = auction.auctionId ?? auction.id;
  if (auctionId === null || auctionId === undefined) return null;

  const make =
    vehicle.makeName ??
    (typeof vehicle.make === "object" && vehicle.make !== null
      ? (vehicle.make as Record<string, unknown>).name
      : vehicle.make);
  const model =
    vehicle.modelName ??
    (typeof vehicle.model === "object" && vehicle.model !== null
      ? (vehicle.model as Record<string, unknown>).name
      : vehicle.model);

  const title = [vehicle.year, make, model]
    .filter((part) => part !== null && part !== undefined && String(part).trim())
    .join(" ");
  const providedTitle =
    typeof auction.title === "string" && auction.title.trim()
      ? auction.title
      : null;

  const rawImages = (Array.isArray(auction.images) && auction.images.length > 0)
    ? auction.images
    : (Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length > 0)
      ? vehicle.imageUrls
      : vehicle.images;

  return adaptLegacyLot({
    ...auction,
    id: auctionId,
    vehicleId: auction.vehicleId ?? vehicle.vehicleId,
    lotType: auction.lotType ?? { name: "CAR" },
    lotStatus: auction.status ?? auction.lotStatus,
    title: title || providedTitle || `Auction #${auctionId}`,
    description: vehicle.description ?? auction.description,
    sellerId: vehicle.sellerId,
    images: rawImages,
    attributes: {
      vin: vehicle.vin,
      make,
      model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      drivetrain: vehicle.drivetrain,
      region: vehicle.region,
      condition: vehicle.conditionGrade,
      color: vehicle.color,
      engineVolume: vehicle.engineVolume,
      bodyType: vehicle.bodyType,
    },
  } as LegacyLot);
}
