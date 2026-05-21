import InfoPageLayout from '../components/InfoPageLayout';

export default function SupportPage() {
  return (
    <InfoPageLayout
      title="Support"
      lead="Need help with your account, listing approvals, or media uploads? Our support desk is ready to assist."
      highlights={['Account Help', 'Listing Support', 'Technical Assistance']}
      sections={[
        {
          title: 'Account & Access',
          text: 'If you cannot sign in or verify your profile, contact support with your registered email for faster resolution.',
        },
        {
          title: 'Listing and Document Issues',
          text: 'For upload failures or listing submission issues, include screenshots and listing type so we can troubleshoot quickly.',
        },
        {
          title: 'Escalations',
          text: 'Critical marketplace incidents are prioritized and tracked by our operations team until closure.',
        },
      ]}
    />
  );
}
