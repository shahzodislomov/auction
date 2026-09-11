import { reorderMockVehicleImages } from "@/features/user-v2/vehicle-image-mock-store.mjs";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const result = reorderMockVehicleImages(id, body.images || []);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  });
}
