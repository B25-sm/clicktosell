import type { Metadata } from 'next';
import {
  LegalPage,
  LegalSection
} from '@/components/legal/LegalPage';
import { companyProfile } from '@/components/legal/companyInfo';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | ClicktoSell',
  description:
    'Learn how delivery, pickup and logistics assistance work on ClicktoSell.'
};

const sections: LegalSection[] = [
  {
    title: 'Overview',
    body: [
      `ClicktoSell operates as a managed marketplace that connects local buyers and sellers. Delivery can happen either in person or through ClicktoSell-approved logistics partners. This Shipping & Delivery Policy explains service levels, responsibilities and timelines so that every order remains traceable and compliant.`,
      'When a seller opts into our managed delivery program, ClicktoSell arranges pickup, insures the shipment and tracks the parcel until delivery confirmation. For peer-to-peer meetups, we provide safety checklists but the parties handle logistics directly.'
    ]
  },
  {
    title: 'Service Options',
    body: [
      'Sellers can choose the fulfilment mode while creating a listing or responding to an order. Available options may vary based on category, weight and pickup PIN code.'
    ],
    bullets: [
      { label: 'Doorstep Pickup & Delivery', description: 'Available for parcels up to 25 kg in cities where we have logistics partners. Includes live tracking and SMS updates.' },
      { label: 'Seller Drop-off', description: 'The seller drops the package at a partner hub within 24 hours of booking the shipment.' },
      { label: 'In-person Meetup', description: 'Buyer and seller coordinate directly; ClicktoSell only facilitates chat and payment escrow.' }
    ]
  },
  {
    title: 'Processing & Transit Timelines',
    body: [
      'Orders confirmed before 4 PM IST are typically scheduled for pickup on the same or next business day. Parcels are delivered within 2-7 business days depending on the destination.',
      'Certain categories (heavy appliances, restricted goods) might require additional verification, which can extend processing timelines.'
    ],
    bullets: [
      { label: 'Metro to Metro', description: '2-3 business days' },
      { label: 'Metro to Non-Metro', description: '3-5 business days' },
      { label: 'Remote / ODA', description: '5-7 business days' }
    ]
  },
  {
    title: 'Shipping Charges',
    body: [
      'Shipping fees are calculated dynamically based on weight, dimensions, insurance value and destination PIN code. Buyers see the exact charge before confirming payment.',
      'Sellers who include shipping in the listing price are responsible for any difference between quoted and actual charges.'
    ],
    bullets: [
      'Insurance up to ₹50,000 is included for eligible categories.',
      'Additional surcharges may apply for oversized goods.'
    ]
  },
  {
    title: 'Packaging & Handover',
    body: [
      'Sellers must package items securely using tamper-proof material. Fragile items should be cushioned properly and labelled “FRAGILE”.',
      'Logistics partners may refuse pickup if packaging is inadequate or if the declared contents violate our prohibited items list.'
    ],
    bullets: [
      'Include the shipping label generated inside ClicktoSell.',
      'Record an unboxing video before dispatch for dispute protection.',
      'Keep the pickup acknowledgement receipt until the order is completed.'
    ]
  },
  {
    title: 'Tracking & Updates',
    body: [
      'Tracking links are shared via SMS/email and are available inside the ClicktoSell dashboard. Statuses include Booked, Picked Up, In Transit, Out for Delivery and Delivered.',
      'If tracking does not update for 48 hours, contact support with the airway bill number so we can raise a high-priority ticket with the carrier.'
    ]
  },
  {
    title: 'Delivery Issues',
    body: [
      'In case of loss, damage or tampering, raise a dispute within 24 hours of the last tracking update. Provide unboxing videos, photos of the packaging and courier remarks.',
      'For failed delivery attempts, the courier will retry up to two times. After repeated failures, the parcel is returned to the seller (RTS).'
    ],
    bullets: [
      'Damage claims must be filed within 48 hours of delivery.',
      'Loss claims require FIR/affidavit for items above ₹25,000.',
      'Return-to-sender shipping costs may be deducted from the final settlement.'
    ]
  },
  {
    title: 'International Shipping',
    body: [
      'Cross-border shipping is not currently supported. Sellers must ensure that listings are restricted to domestic delivery within India.'
    ]
  },
  {
    title: 'Contact & Escalation',
    body: [
      'For logistics assistance, reach out to our support desk with the order ID, tracking number and issue description. Urgent issues can be escalated to our logistics command center.'
    ],
    highlight: (
      <>
        Call {companyProfile.supportPhone} or email{' '}
        <a
          href={`mailto:${companyProfile.supportEmail}`}
          className="underline font-semibold"
        >
          {companyProfile.supportEmail}
        </a>{' '}
        with the subject “Shipping Support – &lt;Order ID&gt;”.
      </>
    )
  }
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      description="Fulfilment options, timelines and dispute workflows for ClicktoSell-managed deliveries."
      lastUpdated="20 November 2025"
      sections={sections}
    />
  );
}

