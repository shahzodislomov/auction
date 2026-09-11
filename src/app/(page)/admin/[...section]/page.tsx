import { AdminRouter } from "@/components/admin/AdminRouter";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  return <AdminRouter section={section} />;
}
