import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveVehicleDocument, fetchAdminVehicleDocuments, rejectVehicleDocument } from "./admin-vehicle-documents";
const apiMocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/api/api", () => ({ api: apiMocks }));
describe("admin vehicle document API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("lists documents with the admin status filter", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { meta: { list: [{ documentId: 7, status: "PENDING" }], pages: 2, elements: 21 } } } });
    await expect(fetchAdminVehicleDocuments({ page: 0, size: 20, status: "PENDING" })).resolves.toMatchObject({ list: [{ documentId: 7, status: "PENDING" }], pages: 2 });
    expect(apiMocks.get).toHaveBeenCalledWith("/admin/vehicle-documents", { params: { page: 0, size: 20, status: "PENDING" } });
  });
  it("approves and rejects documents through real endpoints", async () => {
    apiMocks.patch.mockResolvedValue({ data: { data: {} } });
    await approveVehicleDocument(7); await rejectVehicleDocument({ docId: 8, reason: "  Wrong title  " });
    expect(apiMocks.patch).toHaveBeenNthCalledWith(1, "/admin/vehicle-documents/7/approve");
    expect(apiMocks.patch).toHaveBeenNthCalledWith(2, "/admin/vehicle-documents/8/reject", { reason: "Wrong title" });
  });
});
