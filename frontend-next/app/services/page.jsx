import InfoPageLayout from '../components/InfoPageLayout';

export default function ServicesPage() {
  return (
    <InfoPageLayout
      title="Our Services"
      lead="Home Buddy Connect Limited offers integrated real estate workflows for discovery, listing, communication, and transaction readiness."
      highlights={['Property Discovery', 'Seller Listing Tools', 'Messaging & Workflow']}
      sections={[
        {
          title: 'For Buyers and Renters',
          text: 'Explore verified properties with clear details, pricing context, and guided communication paths.',
        },
        {
          title: 'For Sellers and Agents',
          text: 'Create high-quality listings, upload required property documents, and manage inbound inquiries in one place.',
        },
        {
          title: 'For Operations',
          text: 'Role-based controls and structured listing flows help maintain quality, consistency, and trust across the platform.',
        },
      ]}
    />
  );
}
