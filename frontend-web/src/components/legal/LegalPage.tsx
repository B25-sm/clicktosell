import { ReactNode } from 'react';
import { companyProfile } from './companyInfo';

export type LegalBullet =
  | string
  | {
      label: string;
      description: string;
    };

export interface LegalSection {
  title: string;
  body: string[];
  bullets?: LegalBullet[];
  highlight?: ReactNode;
}

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections
}: LegalPageProps) {
  return (
    <div className="bg-gradient-to-br from-brand-light to-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <p className="uppercase tracking-[0.3em] text-brand-primary text-xs">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark">
            {title}
          </h1>
          <p className="text-lg text-brand-muted leading-relaxed">
            {description}
          </p>
          <p className="text-sm text-brand-muted">
            Last updated on <span className="font-semibold">{lastUpdated}</span>
          </p>
        </header>

        <div className="grid gap-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-green-500 flex items-center justify-center text-white font-semibold">
                  {section.title.charAt(0)}
                </div>
                <h2 className="text-2xl font-semibold text-brand-dark">
                  {section.title}
                </h2>
              </div>
              {section.body.map((paragraph, index) => (
                <p
                  key={`${section.title}-p-${index}`}
                  className="text-base leading-relaxed text-brand-muted"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {section.bullets.map((item, index) => {
                    if (typeof item === 'string') {
                      return <li key={`${section.title}-li-${index}`}>{item}</li>;
                    }

                    return (
                      <li key={`${section.title}-li-${index}`}>
                        <span className="font-semibold text-brand-dark">
                          {item.label}:
                        </span>{' '}
                        {item.description}
                      </li>
                    );
                  })}
                </ul>
              )}
              {section.highlight && (
                <div className="bg-brand-light/60 border border-brand-primary/20 rounded-2xl p-4 text-sm text-brand-dark">
                  {section.highlight}
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="bg-brand-dark text-white rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold">Need help with this policy?</h2>
          <p className="text-white/80">
            Our compliance and customer success teams are here to help. Reach
            out through any of the channels below and we&apos;ll respond within
            1 business day.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/10 rounded-2xl p-4 space-y-1">
              <p className="text-sm uppercase tracking-wide text-white/70">
                Email
              </p>
              <p className="text-lg font-semibold">{companyProfile.supportEmail}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 space-y-1">
              <p className="text-sm uppercase tracking-wide text-white/70">
                Phone
              </p>
              <p className="text-lg font-semibold">{companyProfile.supportPhone}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 space-y-1 md:col-span-2">
              <p className="text-sm uppercase tracking-wide text-white/70">
                Registered Office
              </p>
              <p className="text-lg font-semibold">
                {companyProfile.legalName}
              </p>
              <p className="text-white/80">{companyProfile.corporateAddress}</p>
              <p className="text-sm text-white/60">
                CIN: {companyProfile.cin} · GSTIN: {companyProfile.gstin}
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-sm uppercase tracking-wide text-white/70">
              Grievance Officer (as per RBI guidelines)
            </p>
            <p className="text-lg font-semibold">{companyProfile.grievanceOfficer}</p>
            <p className="text-white/80">{companyProfile.grievanceEmail}</p>
            <p className="text-white/80">{companyProfile.grievancePhone}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

