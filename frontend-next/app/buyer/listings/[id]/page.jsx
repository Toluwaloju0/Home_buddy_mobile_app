import Link from 'next/link';

export default async function BuyerListingPlaceholderPage({ params }) {
  const { id } = await params;

  return (
    <main className="page-shell placeholder-page">
      <h1>Listing details</h1>
      <p>Listing details for <strong>{id}</strong> will appear here soon.</p>
      <Link href="/buyer">Back to buyer dashboard</Link>
    </main>
  );
}
