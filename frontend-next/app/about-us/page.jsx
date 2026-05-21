import InfoPageLayout from '../components/InfoPageLayout';

export default function AboutUsPage() {
  return (
    <InfoPageLayout
      title="About Us"
      lead="Home Buddy is built to make property transactions safer, clearer, and faster for buyers, renters, and sellers in Nigeria."
      highlights={['Verified Listings', 'Role-Based Dashboards', 'Trust-First Process']}
      sections={[
        {
          title: 'Our Mission',
          text: 'We are committed to reducing fraud and improving trust in real estate through strong verification and transparent workflows.',
        },
        {
          title: 'What We Do',
          text: 'From discovery to listing management, we provide modern tools that help users act confidently in every property decision.',
        },
        {
          title: 'Our Focus',
          text: 'We focus on local market realities in Nigeria, combining technology and support to improve outcomes for all stakeholders.',
        },
      ]}
    />
  );
}
