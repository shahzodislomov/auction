import {
  deleteMockVehicleDocument,
  setMockVehicleDocumentReviewStatus,
} from "@/features/user-v2/vehicle-document-mock-store.mjs";

export async function DELETE(_request, { params }) {
  const { id, documentId } = await params;
  const result = deleteMockVehicleDocument(id, documentId);

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
  const { id, documentId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = setMockVehicleDocumentReviewStatus(id, documentId, body.status, body.rejectionReason);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return Response.json({
    success: true,
    data: result.data,
    meta: { mock: true },
  });
}
