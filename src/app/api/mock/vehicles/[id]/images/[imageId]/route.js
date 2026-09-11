import {
  deleteMockVehicleImage,
  setPrimaryMockVehicleImage,
} from "@/features/user-v2/vehicle-image-mock-store.mjs";

export async function DELETE(_request, { params }) {
  const { id, imageId } = await params;
  const result = deleteMockVehicleImage(id, imageId);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  });
}

export async function PATCH(request, { params }) {
  const { id, imageId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action !== "SET_PRIMARY") {
    return Response.json({ success: false, message: "Unsupported image action" }, { status: 400 });
  }

  const result = setPrimaryMockVehicleImage(id, imageId);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  });
}
