import { getMockVehicleDocumentDownload } from "@/features/user-v2/vehicle-document-mock-store.mjs";

export async function GET(_request, { params }) {
  const { id, documentId } = await params;
  const result = getMockVehicleDocumentDownload(id, documentId);

  if (!result.ok) {
    return Response.json(result.body, { status: result.status });
  }

  return new Response(result.data.content, {
    status: 200,
    headers: {
      "Content-Type": result.data.contentType,
      "Content-Disposition": `attachment; filename="${result.data.fileName}"`,
    },
  });
}
