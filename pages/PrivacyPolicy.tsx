import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-950 border border-white/5 p-10 md:p-16 rounded-[3rem] shadow-2xl">
        
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8">
          Privacy Protocols
        </h1>

        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-12 italic">
          Effective Date: January 2026
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed text-sm">

          {/* SECTION 1 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              1. Information Collected
            </h2>
            <p>
              Ascent Matrix collects personal information provided voluntarily by delegates during
              registration and participation. This may include your full name, email address,
              contact number, institutional or organizational affiliation, registration identifiers,
              and transaction references.
            </p>
            <p className="mt-3">
              Sensitive financial information such as card numbers, CVV, UPI credentials, or banking
              passwords is <span className="text-white font-semibold">never collected or stored</span> by us.
            </p>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              2. Purpose of Data Usage
            </h2>
            <p>
              The information collected is used strictly for legitimate business and operational
              purposes, including event registration, delegate verification, payment confirmation,
              issuance of digital tickets and QR codes, official communication, and compliance with
              applicable legal obligations.
            </p>
            <p className="mt-3">
              Personal data is <span className="text-white font-semibold">not sold, rented, or used for unsolicited marketing</span>.
            </p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              3. Data Security & Storage
            </h2>
            <p>
              We employ reasonable administrative, technical, and organizational safeguards to
              protect personal data against unauthorized access, alteration, disclosure, or misuse.
              Data is stored on secure cloud infrastructure with access limited to authorized
              personnel only.
            </p>
            <p className="mt-3">
              Payment transactions are processed through authorized third-party payment gateways,
              and Ascent Matrix bears no responsibility for gateway-level security beyond reasonable
              due diligence.
            </p>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              4. Media, Photography & Digital Footprint
            </h2>
            <p>
              By registering for or attending the event, delegates acknowledge and consent to being
              photographed, audio-recorded, or video-recorded during the event. Such media may be
              used by Ascent Matrix for documentation, reporting, marketing, or promotional purposes
              without further notice or compensation.
            </p>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              5. Data Sharing & Legal Disclosure
            </h2>
            <p>
              Personal data shall not be disclosed to third parties except where required for event
              execution, payment processing, or when mandated by applicable law, court order, or
              governmental authority.
            </p>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              6. User Rights & Contact Information
            </h2>
            <p>
              Delegates may request access, correction, or deletion of their personal data, subject
              to applicable legal and regulatory requirements, by contacting us through the details
              provided below.
            </p>
            <p className="mt-4 text-white font-semibold">
              Email: <span className="font-normal">connect@ascentmatrix.com</span>
            </p>
            <p className="text-white font-semibold">
              Phone: <span className="font-normal">7026370266</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
