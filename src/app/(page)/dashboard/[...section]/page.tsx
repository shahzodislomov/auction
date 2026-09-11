import { CabinetRouter } from "@/components/cabinet/CabinetRouter";

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  return <CabinetRouter section={section} />;
}
