import { describe, expect, it } from "vitest";

import { backendEnumKey, translateBackendValue } from "./backendEnum";

describe("backend enum localization", () => {
  it("normalizes snake case, kebab case, and camel case values", () => {
    expect(backendEnumKey("PENDING_REVIEW")).toBe("PENDING_REVIEW");
    expect(backendEnumKey("pending-review")).toBe("PENDING_REVIEW");
    expect(backendEnumKey("PurchaseOrder")).toBe("PURCHASE_ORDER");
  });

  it("translates common backend values in all supported languages", () => {
    expect(translateBackendValue("PETROL", "uz")).toBe("Benzin");
    expect(translateBackendValue("AUTOMATIC", "ru")).toBe("Автоматическая");
    expect(translateBackendValue("PurchaseOrder", "en")).toBe("Purchase order");
  });

  it("translates less common status, document, and account values", () => {
    expect(translateBackendValue("EXPIRED", "uz")).toBe("Muddati tugagan");
    expect(translateBackendValue("REGISTRATION", "ru")).toBe("Свидетельство о регистрации");
    expect(translateBackendValue("LEGAL_ENTITY", "en")).toBe("Legal entity");
  });
});
