import InfoPageLayout from '../components/InfoPageLayout';

export default function AboutUsPage() {
  return (
    <InfoPageLayout
      title="About Us"
      lead="Home Buddy is a modern real estate platform helping people find verified homes easily, safely and stress-fre. We combine smart technology with trusted property solutions to simplify housing, reduce fraud, and improve the way people live."
      highlights={['Verified Listings', 'Role-Based Dashboards', 'Trust-First Process', 'Trusted Living', 'Smart Real Estate']}
      sections={[
        {
          title: 'Our Mission',
          text: 'To simplify property search and management by providing verified listings, trusted connections and seamless digital solutions.',
        },
        {
          title: 'Our Vision',
          text: 'To become Nigeria\'s most trusted smart and real estate platform, transforming how people find and manage homes through technology, transperency and convenience.',
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
