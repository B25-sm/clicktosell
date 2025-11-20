import type { Metadata } from 'next';
import {
  LegalPage,
  LegalSection
} from '@/components/legal/LegalPage';
import { companyProfile } from '@/components/legal/companyInfo';

export const metadata: Metadata = {
  title: 'Terms of Service | ClicktoSell',
  description:
    'Review the terms, obligations and service rules that govern your use of ClicktoSell.'
};

const sections: LegalSection[] = [
  {
    title: 'Acceptance of the Terms',
    body: [
      `These Terms of Service constitute a legally binding agreement between you and ${companyProfile.legalName}. By creating an account, listing an item or using any feature of ${companyProfile.brandName}, you agree to comply with these terms, our Privacy Policy and any supplemental guidelines shared in-product.`,
      'We may update the Terms periodically. Continued use of the platform after changes take effect indicates acceptance of the updated Terms.'
    ]
  },
  {
    title: 'Eligibility & Account Responsibilities',
    body: [
      'Users must be at least 18 years old, capable of entering into contracts and compliant with Indian laws. You are responsible for the confidentiality of your login credentials and for all activity conducted through your account.',
      'ClicktoSell reserves the right to suspend or terminate accounts that provide false information, fail KYC checks or engage in prohibited activity.'
    ],
    bullets: [
      'Complete KYC verification when requested to unlock payments and withdrawals.',
      'Notify us immediately if you suspect unauthorized access to your account.',
      'Do not share your account or allow others to operate on your behalf without written approval.'
    ]
  },
  {
    title: 'Listings, Transactions & User Conduct',
    body: [
      'You are solely responsible for the accuracy, legality and condition of items or services you list. Listings must comply with Indian law and our community guidelines.',
      'All interactions between buyers and sellers should remain respectful, transparent and fraud-free. We may monitor chats for safety assurance.'
    ],
    bullets: [
      { label: 'Prohibited Content', description: 'Counterfeit items, regulated substances, weapons, wildlife, explicit adult content and any item banned by applicable law.' },
      { label: 'True Representation', description: 'Describe items honestly, disclose defects and fulfil agreed timelines.' },
      { label: 'Community Safety', description: 'No harassment, hate speech, spam, phishing or attempts to scrape data.' }
    ]
  },
  {
    title: 'Payments, Fees & Taxes',
    body: [
      'ClicktoSell partners with Razorpay and other RBI-compliant payment facilitators to process transactions. By initiating a payment, you authorize us to debit your chosen instrument for the amount displayed plus applicable fees.',
      'Some services (featured listings, subscription plans, escrow, doorstep delivery) may incur additional charges that will be shown before purchase. Merchants are responsible for indirect taxes (GST) on their sales.'
    ],
    bullets: [
      'Payment disputes must be raised within 48 hours of transaction completion.',
      'Chargebacks or payment reversals caused by inaccurate information may lead to account suspension.',
      'We may withhold payouts if we detect fraudulent activity, regulatory risk or pending disputes.'
    ]
  },
  {
    title: 'Refunds & Cancellations',
    body: [
      'Refunds follow our dedicated Refund & Cancellation Policy. Buyers and sellers should document delivery proof, chat conversations and payment receipts to expedite dispute resolution.',
      'ClicktoSell may mediate disputes but is not obligated to provide refunds for peer-to-peer transactions unless covered by an escrow program.'
    ],
    highlight: (
      <>
        Refer to the{' '}
        <a href="/refund-policy" className="underline font-semibold">
          Refund Policy
        </a>{' '}
        for detailed rules on eligibility, timelines and evidence requirements.
      </>
    )
  },
  {
    title: 'Intellectual Property & License',
    body: [
      'All rights, title and interest in the ClicktoSell platform, codebase, branding and content belong to ClicktoSell Marketplace Private Limited or its licensors.',
      'We grant you a limited, non-exclusive, non-transferable license to use the platform for lawful purposes. You may not copy, reverse engineer or sell any portion of the service.'
    ]
  },
  {
    title: 'Limitation of Liability',
    body: [
      'ClicktoSell provides the platform on an “as is” and “as available” basis. To the maximum extent permitted by law, we are not liable for indirect, incidental, punitive or consequential damages arising from your use of the service.',
      'Our total liability for any claim is limited to the lesser of ₹10,000 or the total fees paid to ClicktoSell in the previous 3 months.'
    ]
  },
  {
    title: 'Suspension & Termination',
    body: [
      'We may suspend, restrict or terminate access without notice if you breach these terms, violate applicable laws, fail verification, trigger excessive disputes or create security risks.',
      'Upon termination, your right to use the services ceases immediately, but outstanding obligations (fees, deliveries, disputes) survive.'
    ]
  },
  {
    title: 'Governing Law & Jurisdiction',
    body: [
      'These Terms are governed by the laws of India. Courts in Bengaluru, Karnataka shall have exclusive jurisdiction over disputes, subject to mandatory arbitration or mediation stated in our dispute programs.'
    ]
  },
  {
    title: 'Contact & Escalations',
    body: [
      'For clarifications about these Terms or to escalate unresolved issues, contact our support desk. Unresolved grievances can be escalated to our Grievance Officer per RBI and Information Technology Act requirements.'
    ],
    highlight: (
      <>
        Email{' '}
        <a
          href={`mailto:${companyProfile.grievanceEmail}`}
          className="underline font-semibold"
        >
          {companyProfile.grievanceEmail}
        </a>{' '}
        with your ticket ID for an escalation.
      </>
    )
  }
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="Rules that keep ClicktoSell safe, transparent and compliant for buyers, sellers and partners."
      lastUpdated="20 November 2025"
      sections={sections}
    />
  );
}

