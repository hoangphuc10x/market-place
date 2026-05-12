import { OnboardingWizard } from './wizard';

export const metadata = { title: 'Open a shop' };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <OnboardingWizard initialSlug={slug ?? null} />
    </div>
  );
}
