import { AuthShell } from "@/components/auth/AuthShell";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

interface RegisterPageProps {
  searchParams: Promise<{
    returnTo?: string | string[];
    next?: string | string[];
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const requested = params.returnTo ?? params.next;
  const returnTo = Array.isArray(requested) ? requested[0] : requested;

  return (
    <AuthShell mode="register">
      <EmailAuthForm mode="register" returnTo={returnTo} />
    </AuthShell>
  );
}
