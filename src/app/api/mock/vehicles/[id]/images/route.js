import { listMockVehicleImages, uploadMockVehicleImage } from "@/features/user-v2/vehicle-image-mock-store.mjs";

export async function GET(_request, { params }) {
  const { id } = await params;

  return Response.json({
    success: true,
    data: listMockVehicleImages(id),
    meta: { mock: true },
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("image");
  const fail = formData.get("fail");

  if (fail === "true") {
    return Response.json({ success: false, message: "Mock upload failure" }, { status: 500 });
  }

  if (!file || typeof file === "string") {
    return Response.json({ success: false, message: "Image file is required" }, { status: 400 });
  }

  if (!String(file.type || "").startsWith("image/")) {
    return Response.json({ success: false, message: "Unsupported image type" }, { status: 415 });
  }

  const result = uploadMockVehicleImage(id, {
    fileName: file.name,
  });

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  }, { status: 201 });
}
