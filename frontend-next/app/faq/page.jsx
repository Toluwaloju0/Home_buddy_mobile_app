import InfoPageLayout from '../components/InfoPageLayout';

export default function FAQPage() {
  return (
    <InfoPageLayout
      title="FAQ"
      lead="Quick answers to common questions about listing, verification, and account management on Home Buddy Connect Limited."
      highlights={['Getting Started', 'Seller Verification', 'Account Support']}
      sections={[
        {
          title: 'How do I create a listing?',
          text: 'Sign in as a seller, choose listing type, complete property information, and upload required photos and documents.',
        },
        {
          title: 'Why was my listing not approved?',
          text: 'Most delays happen when mandatory media or document fields are missing or listing details are incomplete.',
        },
        {
          title: 'How can I switch roles?',
          text: 'Use your profile menu or contact support if your account requires additional role permissions.',
        },
      ]}
    />
  );
}
