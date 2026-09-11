import { getMockVehicle, updateMockVehicle } from "@/features/user-v2/vehicle-mock-store.mjs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const vehicle = getMockVehicle(id);

  if (!vehicle) {
    return Response.json({ success: false, message: "Vehicle not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    data: vehicle,
    meta: { mock: true },
  });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const result = updateMockVehicle(id, body);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  });
}
