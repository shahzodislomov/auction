import {
  listMockVehicleDocuments,
  uploadMockVehicleDocument,
} from "@/features/user-v2/vehicle-document-mock-store.mjs";

export async function GET(_request, { params }) {
  const { id } = await params;

  return Response.json({
    success: true,
    data: listMockVehicleDocuments(id),
    meta: { mock: true },
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("document");
  const type = formData.get("type");
  const fail = formData.get("fail");

  if (fail === "true") {
    return Response.json({ success: false, message: "Mock document upload failure" }, { status: 500 });
  }

  if (!file || typeof file === "string") {
    return Response.json({ success: false, message: "Document file is required" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ success: false, message: "Unsupported document type" }, { status: 415 });
  }

  const result = uploadMockVehicleDocument(id, {
    type,
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
