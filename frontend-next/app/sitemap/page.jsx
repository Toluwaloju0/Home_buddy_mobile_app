import InfoPageLayout from '../components/InfoPageLayout';

export default function SitemapPage() {
  return (
    <InfoPageLayout
      title="Sitemap"
      lead="Browse key sections of Home Buddy for quick navigation across buyer, seller, and support journeys."
      highlights={['Public Pages', 'Seller Workspace', 'Support Pages']}
      sections={[
        {
          title: 'Public Area',
          text: 'Home, Login, Signup, Contact, About Us, Services, Support, Terms, Privacy Policy, FAQ, Sitemap, Careers.',
        },
        {
          title: 'Seller Workspace',
          text: 'Seller dashboard, listings, new listing flow, listing details, profile settings, and seller messages.',
        },
        {
          title: 'Buyer Area',
          text: 'Buyer dashboard and discovery-oriented user paths for verified property browsing.',
        },
      ]}
    />
  );
}
