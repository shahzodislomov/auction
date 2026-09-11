import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

import { generateMetadata } from "./page";

describe("home metadata", () => {
  it("uses the requested locale for its canonical and Open Graph metadata", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ lang: "ru" }),
    });

    expect(metadata.title).toBe("TezAuksion | Автомобильные аукционы");
    expect(metadata.alternates?.canonical).toBe("/?lang=ru");
    expect(metadata.openGraph).toMatchObject({
      locale: "ru_RU",
      url: "/?lang=ru",
    });
  });
});
