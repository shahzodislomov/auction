import { describe, expect, it } from "vitest";

import { translateUiText } from "./uiText";

describe("translateUiText", () => {
  it("translates shared accessibility labels in every supported language", () => {
    expect(translateUiText("previousPage", "uz")).toBe("Oldingi sahifa");
    expect(translateUiText("loadingVehicles", "ru")).toBe("Загрузка автомобилей");
    expect(translateUiText("fieldInformation", "en")).toBe("Field information");
  });
});
