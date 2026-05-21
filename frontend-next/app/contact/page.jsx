import InfoPageLayout from '../components/InfoPageLayout';

export default function ContactPage() {
  return (
    <InfoPageLayout
      title="Contact"
      lead="Reach our support and operations teams for listing issues, account help, partnerships, and general inquiries."
      highlights={['24/7 Ticket Support', 'Email Assistance', 'Business Partnerships']}
      sections={[
        {
          title: 'Customer Support',
          text: 'For account access, listing updates, and buyer-seller communication issues, contact support@homebuddy.ng.',
        },
        {
          title: 'Business & Partnerships',
          text: 'Agencies, developers, and service providers can reach our partnerships desk at partnerships@homebuddy.ng.',
        },
        {
          title: 'Office Hours',
          text: 'Support is available Monday to Friday, 8:00 AM to 6:00 PM WAT. Urgent incidents are monitored continuously.',
        },
      ]}
    />
  );
}
