import { redirect } from 'next/navigation';
import { getViewer } from '@/lib/session';

export default async function AccountPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Hi, {viewer.displayName}</h1>
      <dl className="mt-8 grid gap-4 text-sm">
        <Row label="Email" value={viewer.email} />
        <Row label="Role" value={viewer.role} />
        <Row label="Member since" value={new Date(viewer.createdAt).toLocaleDateString()} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-border/60 pb-3">
      <dt className="w-32 text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
