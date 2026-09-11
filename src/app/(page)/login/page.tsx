import { AuthShell } from "@/components/auth/AuthShell";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

interface LoginPageProps {
  searchParams: Promise<{
    returnTo?: string | string[];
    next?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requested = params.returnTo ?? params.next;
  const returnTo = Array.isArray(requested) ? requested[0] : requested;

  return (
    <AuthShell mode="login">
      <EmailAuthForm mode="login" returnTo={returnTo} />
    </AuthShell>
  );
}
