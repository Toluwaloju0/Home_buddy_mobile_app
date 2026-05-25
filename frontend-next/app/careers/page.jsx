import InfoPageLayout from '../components/InfoPageLayout';

export default function CareersPage() {
  return (
    <InfoPageLayout
      title="Careers"
      lead="Join Home Buddy Connect Limited and help build the trusted infrastructure powering modern real estate experiences in Nigeria."
      highlights={['Product & Engineering', 'Operations', 'Customer Success']}
      sections={[
        {
          title: 'Why Join Us',
          text: 'Work on meaningful products that improve trust, transparency, and access in one of the largest property markets.',
        },
        {
          title: 'Open Teams',
          text: 'We hire across engineering, design, operations, marketplace quality, and customer support functions.',
        },
        {
          title: 'How to Apply',
          text: 'Send your resume and role interest to careers@homebuddy.ng. Include links to relevant work where possible.',
        },
      ]}
    />
  );
}
