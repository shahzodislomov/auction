import { createMockVehicle, listMockVehicles } from "@/features/user-v2/vehicle-mock-store.mjs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");

  return Response.json({
    success: true,
    data: listMockVehicles({ ownerId }),
    meta: { mock: true },
  });
}

export async function POST(request) {
  const body = await request.json();
  const result = createMockVehicle(body);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  }, { status: 201 });
}
