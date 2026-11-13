import InfoPageLayout from '../components/InfoPageLayout';

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms"
      lead="These terms define acceptable use of Home Buddy Connect Limited services and responsibilities for all platform users."
      highlights={['User Responsibilities', 'Listing Standards', 'Platform Use']}
      sections={[
        {
          title: 'Safety and Payments',
          text: 'Your safety starts with making informed decisions. Please verify before you pay.',
        },
        {
          title: 'Use of Platform',
          text: 'Users agree to provide accurate information and use Home Buddy Connect Limited only for lawful property-related activities.',
        },
        {
          title: 'Listing Compliance',
          text: 'All listings must reflect truthful property details, pricing, and required supporting documentation where applicable.',
        },
        {
          title: 'Enforcement',
          text: 'We reserve the right to limit or remove accounts and content that violate platform rules or applicable laws.',
        },
      ]}
    />
  );
}
