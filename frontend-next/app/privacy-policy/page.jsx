import InfoPageLayout from '../components/InfoPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      lead="We protect user data and apply strict handling standards for personal and listing-related information."
      highlights={['Data Protection', 'Secure Access', 'Transparent Processing']}
      sections={[
        {
          title: 'Information We Collect',
          text: 'We collect account details, listing information, and operational metadata required to provide platform services.',
        },
        {
          title: 'How We Use Data',
          text: 'Data is used to power features, improve trust and safety, support verification, and provide customer support.',
        },
        {
          title: 'Your Controls',
          text: 'Users can update profile details and request support for privacy-related inquiries through our support channels.',
        },
      ]}
    />
  );
}
