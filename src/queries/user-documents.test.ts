import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveUserDocument, fetchAdminUserDocuments, fetchMyUserDocuments, rejectUserDocument, uploadUserDocumentFile } from "./user-documents";

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
const fileSendMocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/api/api", () => ({ api: apiMocks, fileSend: fileSendMocks }));

describe("user document moderation API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the filtered admin document page", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { meta: { list: [{ documentId: 8, status: "PENDING" }], pages: 2, elements: 21 } } } });
    await expect(fetchAdminUserDocuments({ docType: "PASSPORT", search: "ali", status: "PENDING", userId: "42", page: 0, size: 20 })).resolves.toMatchObject({ list: [{ documentId: 8, status: "PENDING" }], pages: 2, elements: 21 });
    expect(apiMocks.get).toHaveBeenCalledWith("/user-documents/admin", { params: { docType: "PASSPORT", page: 0, search: "ali", size: 20, status: "PENDING", userId: 42 } });
  });

  it("loads the current user's uploaded documents", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [{ documentId: 9 }] } });
    await expect(fetchMyUserDocuments()).resolves.toEqual([{ documentId: 9 }]);
    expect(apiMocks.get).toHaveBeenCalledWith("/user-documents/mine");
  });

  it("uploads a contract signature file and returns the uploaded document", async () => {
    fileSendMocks.post.mockResolvedValue({
      data: {
        data: {
          documentId: 17,
          docType: "TITLE",
          fileUrl: "https://example.test/signature.png",
        },
        status: "CREATED",
      },
    });
    const file = new File(["signature"], "signature.png", { type: "image/png" });

    await expect(
      uploadUserDocumentFile({ docType: "TITLE", file }),
    ).resolves.toMatchObject({
      documentId: 17,
      fileUrl: "https://example.test/signature.png",
    });
    expect(fileSendMocks.post).toHaveBeenCalledWith(
      "/user-documents/upload-file",
      expect.any(FormData),
      { params: { docType: "TITLE" } },
    );
  });

  it("approves and rejects through the documented PATCH endpoints", async () => {
    apiMocks.patch.mockResolvedValue({ data: { data: {} } });
    await approveUserDocument(8);
    await rejectUserDocument({ documentId: 9, reason: "  Image is blurred  " });
    expect(apiMocks.patch).toHaveBeenNthCalledWith(1, "/user-documents/admin/8/approve");
    expect(apiMocks.patch).toHaveBeenNthCalledWith(2, "/user-documents/admin/9/reject", { reason: "Image is blurred" });
  });
});
