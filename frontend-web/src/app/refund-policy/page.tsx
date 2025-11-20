import type { Metadata } from 'next';
import {
  LegalPage,
  LegalSection
} from '@/components/legal/LegalPage';
import { companyProfile } from '@/components/legal/companyInfo';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | ClicktoSell',
  description:
    'Understand how refunds, cancellations and dispute resolutions work on ClicktoSell.'
};

const sections: LegalSection[] = [
  {
    title: 'Scope of This Policy',
    body: [
      'This Refund & Cancellation Policy governs all paid services on ClicktoSell including featured listings, Boost plans, subscription packages, delivery add-ons and escrow-backed transactions between buyers and sellers.',
      'Peer-to-peer transactions that happen offline or via cash remain outside our direct control; however, buyers and sellers must still follow these guidelines when raising disputes through ClicktoSell.'
    ]
  },
  {
    title: 'Buyer Cancellations',
    body: [
      'Buyers may cancel an order until the seller confirms shipment or marks the item as delivered. Once delivery is confirmed, cancellations convert into refund requests and require supporting evidence.',
      'Digital subscriptions (such as membership tiers) can be cancelled anytime, but charges already processed for the active billing cycle are non-refundable.'
    ],
    bullets: [
      'Use the in-app “Cancel Order” button or contact support within 12 hours.',
      'Provide a reason and any screenshots that justify the cancellation.',
      'Repeated frivolous cancellations may impact your account standing.'
    ]
  },
  {
    title: 'Seller Cancellations',
    body: [
      'Sellers should cancel orders only when inventory is unavailable or when the buyer fails mandatory KYC checks. Sellers must inform the buyer via in-app chat and cancel the order to initiate an automatic refund.',
      'Non-responsive sellers may face automatic cancellation initiated by ClicktoSell.'
    ],
    bullets: [
      { label: 'Auto-cancellation', description: 'Orders without any seller action for 72 hours are cancelled and refunded automatically.' },
      { label: 'Penalty', description: 'Repeated order drops can reduce seller quality scores or lead to temporary listing limits.' }
    ]
  },
  {
    title: 'Refund Eligibility',
    body: [
      'Refunds are evaluated on the basis of verifiable evidence such as tracking proofs, delivery confirmation, chat logs, photos and third-party documents.',
      'For escrow-protected orders, funds remain with ClicktoSell until the dispute is closed. For direct payments, we work with Razorpay to process refunds back to the original payment method.'
    ],
    bullets: [
      'Item not received or significantly not as described.',
      'Damaged products delivered via ClicktoSell partner logistics.',
      'Duplicate payment or erroneous charges for ClicktoSell value-added services.',
      'Failed KYC or compliance checks initiated by ClicktoSell.'
    ]
  },
  {
    title: 'Refund Timelines',
    body: [
      'We aim to resolve most disputes within 5-7 business days. Once approved, refunds are triggered immediately via Razorpay and typically reflect within 5 business days for bank accounts and 7-10 days for credit cards.',
      'If additional investigation is required, we will keep both parties informed through email and dashboard notifications.'
    ],
    bullets: [
      { label: 'UPI / Wallet / Net Banking', description: '2-5 business days after approval.' },
      { label: 'Credit / Debit Cards', description: 'Up to 7-10 business days subject to issuing bank policies.' },
      { label: 'ClicktoSell Credits', description: 'Instant credit back to the wallet.' }
    ]
  },
  {
    title: 'Non-Refundable Scenarios',
    body: [
      'Payments made for promotional placements (featured ads, spotlight banners) are non-refundable once the campaign starts.',
      'We may also decline refunds when evidence is inconclusive, delivery was completed successfully, or the buyer circumvents the in-app payment flow and pays directly in cash.'
    ],
    bullets: [
      'Consumable or perishable goods inspected and accepted by the buyer.',
      'Services that have already been rendered (e.g., listing boosts).',
      'Breaches of Terms of Service, fraudulent chargebacks or malicious claims.'
    ]
  },
  {
    title: 'How to Raise a Refund Request',
    body: [
      'Use the “Report an Issue” button on the relevant transaction, choose the category and upload supporting documents.',
      'For payments processed outside the platform, we can only provide mediation support; financial refunds must be handled directly between buyer and seller.'
    ],
    highlight: (
      <>
        If the in-app workflow is unavailable, email{' '}
        <a
          href={`mailto:${companyProfile.supportEmail}`}
          className="underline font-semibold"
        >
          {companyProfile.supportEmail}
        </a>{' '}
        with your order ID, payment reference, screenshots and a brief summary.
      </>
    )
  },
  {
    title: 'Escalations & Regulatory Compliance',
    body: [
      'If a refund is delayed beyond the stated timelines, you may escalate to our Grievance Officer. We comply with RBI OPGSP and card network regulations for chargebacks and reversals.'
    ],
    bullets: [
      { label: 'Grievance Email', description: companyProfile.grievanceEmail },
      { label: 'Subject Line', description: '“Refund Escalation – <Order ID>”' },
      { label: 'Response Time', description: 'We respond within 48 working hours and aim to close escalations within 7 working days.' }
    ]
  }
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      description="Clear steps for cancelling orders, requesting refunds and escalating disputes for ClicktoSell orders."
      lastUpdated="20 November 2025"
      sections={sections}
    />
  );
}

