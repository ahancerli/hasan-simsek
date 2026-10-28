import { requireUser } from "@/lib/security/session";
import { ROLE_LABEL } from "@/lib/security/roles";
import { PasswordForm } from "@/components/admin/PasswordForm";

export default async function Profile() {
  const u = await requireUser();
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Profilim</h1>
      <div className="mb-6 max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 text-sm">
        <p><b>{u.name}</b> · {u.email}</p><p className="text-ink-500">Rol: {ROLE_LABEL[u.role]}</p>
      </div>
      <PasswordForm />
    </>
  );
}
