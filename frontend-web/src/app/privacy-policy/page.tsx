import type { Metadata } from 'next';
import {
  LegalPage,
  LegalSection
} from '@/components/legal/LegalPage';
import { companyProfile } from '@/components/legal/companyInfo';

export const metadata: Metadata = {
  title: 'Privacy Policy | ClicktoSell',
  description:
    'Learn how ClicktoSell collects, uses, and protects your personal information while you buy or sell on our marketplace.'
};

const sections: LegalSection[] = [
  {
    title: 'Information We Collect',
    body: [
      'We only collect the data needed to operate a safe, high-quality marketplace. When you sign up or interact with ClicktoSell we may collect personal identifiers, contact information, verification documents and usage data.',
      'We also collect device data, log files, cookies and approximate location signals to help us keep your account secure and personalize your experience.'
    ],
    bullets: [
      { label: 'Account Data', description: 'Name, phone number, email, address, government ID proof when required for KYC.' },
      { label: 'Listing & Transaction Data', description: 'Listing metadata, chat history, order details, payment preferences and dispute submissions.' },
      { label: 'Device & Usage Data', description: 'IP address, device identifiers, browser information, timestamps, crash reports and referral URLs.' }
    ]
  },
  {
    title: 'How We Use Your Information',
    body: [
      'Your data powers essential marketplace workflows such as account creation, fraud prevention, communication between buyers and sellers, personalized recommendations and dispute resolution.',
      'We also analyse aggregated usage patterns to improve reliability, fulfil legal obligations and develop new safety features.'
    ],
    bullets: [
      'Verifying identity and enabling two-factor authentication.',
      'Processing listings, payments, refunds and subscription plans.',
      'Sending service communications, policy updates and promotional offers (with opt-out options).',
      'Detecting spam, abuse, prohibited items and payment risk.'
    ]
  },
  {
    title: 'Sharing & Disclosure',
    body: [
      'We never sell your personal data. We only share information with partners who help us operate ClicktoSell and only under strict contractual obligations.',
      'Examples include payment gateways, SMS/email providers, analytics vendors, logistics partners chosen by you and government agencies when legally required.'
    ],
    bullets: [
      { label: 'Razorpay', description: 'Card, UPI and net banking details are processed directly by Razorpay Software Pvt. Ltd. We only receive masked references and transaction status.' },
      { label: 'Law Enforcement', description: 'We may disclose relevant data if mandated by a lawful request or to defend our legal rights.' },
      { label: 'Business Transfers', description: 'If ClicktoSell undergoes a merger or acquisition, users will be notified before data ownership changes.' }
    ]
  },
  {
    title: 'Data Retention & Security',
    body: [
      'We retain data only for as long as it is needed for the stated purpose or to meet legal, accounting and regulatory obligations. Payment evidence is retained for a minimum of 8 years as per RBI and tax norms.',
      'Data is encrypted at rest and in transit, stored in ISO 27001 compliant data centers and protected by network segmentation, role-based access controls and automated threat monitoring.'
    ],
    bullets: [
      'Passwords are hashed with industry-standard algorithms; we never store plain text passwords.',
      'Sensitive documents are stored with restricted access and automatically purged after KYC verification wherever permitted.',
      'Employees access customer data strictly on a need-to-know basis and are bound by confidentiality agreements.'
    ]
  },
  {
    title: 'Your Choices & Rights',
    body: [
      'You can review or update profile data inside your dashboard, manage marketing preferences, download a data summary or request deletion subject to regulatory retention requirements.',
      'To exercise any privacy right, email us from your registered account so we can verify your identity before actioning the request.'
    ],
    bullets: [
      'Opt out of marketing emails via the unsubscribe link or by emailing support.',
      'Request access, correction, portability or deletion of your personal data.',
      'Appeal decisions related to KYC, account freezes or moderation outcomes.'
    ]
  },
  {
    title: 'Cookies & Tracking Technologies',
    body: [
      'We use cookies, device identifiers and similar technologies to keep you signed in, remember preferences, analyze performance and show relevant content.',
      'Essential cookies are required for the site to function. Analytics and marketing cookies are optional and can be controlled from your browser settings.'
    ],
    bullets: [
      { label: 'Essential', description: 'Authentication, security, payment session management.' },
      { label: 'Analytics', description: 'Measuring feature usage, crash diagnostics and improving UX.' },
      { label: 'Marketing', description: 'Optional push/email campaigns and retargeting pixels.' }
    ]
  },
  {
    title: 'Children’s Privacy',
    body: [
      'ClicktoSell is intended for users aged 18 and above. We do not knowingly collect data from minors. If you believe a minor has provided data, contact us and we will delete it immediately.'
    ]
  },
  {
    title: 'Policy Updates',
    body: [
      'We update this policy whenever we launch new features or regulatory frameworks change. Significant updates will be announced through email or in-product notifications.',
      `If you continue using ${companyProfile.brandName} after an update, it means you agree to the revised terms.`
    ],
    highlight: (
      <>
        For privacy questions or to escalate a concern, email{' '}
        <a
          href={`mailto:${companyProfile.supportEmail}`}
          className="underline"
        >
          {companyProfile.supportEmail}
        </a>{' '}
        with the subject line “Privacy Request”.
      </>
    )
  }
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="Transparent information about how we handle your personal data while delivering a trusted classifieds marketplace."
      lastUpdated="20 November 2025"
      sections={sections}
    />
  );
}

