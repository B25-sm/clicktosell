import type { Metadata } from 'next';
import { companyProfile } from '@/components/legal/companyInfo';

export const metadata: Metadata = {
  title: 'Contact Us | ClicktoSell',
  description:
    'Reach ClicktoSell support, sales or compliance teams via phone, email or postal address.'
};

const contactChannels = [
  {
    label: 'Customer Support',
    description:
      'Get help with listings, payments, account access, or technical issues.',
    email: companyProfile.supportEmail,
    phone: companyProfile.supportPhone,
    response: 'Replies within 1 business day'
  },
  {
    label: 'Partnerships & Sales',
    description:
      'Discuss enterprise classifieds solutions, dealerships, or API partnerships.',
    email: 'partners@clicktosell.com',
    phone: '+91 80 4800 9901',
    response: 'Replies within 2 business days'
  },
  {
    label: 'Compliance & Legal',
    description:
      'Report security issues, legal notices, takedown requests, or data privacy concerns.',
    email: companyProfile.grievanceEmail,
    phone: companyProfile.grievancePhone,
    response: 'Replies within 48 working hours'
  }
];

const officeHours = [
  { day: 'Monday – Friday', time: '09:00 AM – 08:00 PM IST' },
  { day: 'Saturday', time: '09:00 AM – 06:00 PM IST' },
  { day: 'Sunday & Public Holidays', time: 'On-call support for payment escalations only' }
];

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-brand-light to-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <p className="uppercase tracking-[0.3em] text-brand-primary text-xs">
            Contact
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark">
            We&apos;re here to help
          </h1>
          <p className="text-lg text-brand-muted leading-relaxed">
            Whether you need assistance with a transaction, have a compliance
            query, or want to partner with us, reach out through the channels
            below. Our teams respond quickly during business hours.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {contactChannels.map((channel) => (
            <div
              key={channel.label}
              className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 space-y-4"
            >
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wide text-brand-primary/70">
                  {channel.response}
                </p>
                <h2 className="text-2xl font-semibold text-brand-dark">
                  {channel.label}
                </h2>
                <p className="text-brand-muted">{channel.description}</p>
              </div>
              <div className="space-y-2 text-brand-dark">
                <a
                  href={`mailto:${channel.email}`}
                  className="block text-lg font-semibold hover:text-brand-primary transition-colors"
                >
                  {channel.email}
                </a>
                <a
                  href={`tel:${channel.phone.replace(/\s+/g, '')}`}
                  className="block text-sm text-brand-muted hover:text-brand-primary transition-colors"
                >
                  {channel.phone}
                </a>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-soft p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="uppercase text-xs tracking-[0.3em] text-brand-primary">
                Visit Us
              </p>
              <h2 className="text-3xl font-bold text-brand-dark">
                Registered & corporate office
              </h2>
              <p className="text-brand-muted leading-relaxed">
                {companyProfile.legalName}
                <br />
                {companyProfile.corporateAddress}
              </p>
              <p className="text-sm text-brand-muted">
                CIN: {companyProfile.cin} · GSTIN: {companyProfile.gstin}
              </p>
              <div className="space-y-1">
                {officeHours.map((slot) => (
                  <p key={slot.day} className="text-sm text-brand-muted">
                    <span className="font-semibold text-brand-dark">
                      {slot.day}:
                    </span>{' '}
                    {slot.time}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-brand-light/80 border border-brand-primary/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-2xl font-semibold text-brand-dark">
                Raise a ticket
              </h3>
              <p className="text-brand-muted">
                Share your order ID, registered email, and a short description
                of the issue. Our helpdesk automatically routes it to the right
                specialist.
              </p>
              <ul className="space-y-2 text-sm text-brand-dark">
                <li>1. Email support@clicktosell.com with subject “Support Ticket – &lt;Issue&gt;”.</li>
                <li>2. Attach screenshots, invoices, or chat transcripts if relevant.</li>
                <li>3. Expect an acknowledgement within 30 minutes.</li>
              </ul>
              <p className="text-sm text-brand-muted">
                Emergency payment disputes can also be reported via the 24x7 IVR
                line mentioned in Razorpay receipts.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-brand-dark text-white rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold">Grievance Officer</h2>
          <p className="text-white/80">
            In line with RBI and Information Technology Act requirements, our
            Grievance Officer addresses escalated complaints that remain
            unresolved beyond the standard SLA.
          </p>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{companyProfile.grievanceOfficer}</p>
            <p>{companyProfile.grievanceEmail}</p>
            <p>{companyProfile.grievancePhone}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

