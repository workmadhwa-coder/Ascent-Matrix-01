import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-950 border border-white/5 p-10 md:p-16 rounded-[3rem] shadow-2xl">
        
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8">
          Terms of Delegate Engagement
        </h1>

        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-12 italic">
          Official Terms & Conditions of Participation
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed text-sm">

          {/* SECTION 1 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              1. Registration & Admission
            </h2>
            <p>
              Entry to Ascent Matrix events is strictly permitted only upon successful registration
              and confirmed payment. Each digital pass issued is unique to the registered delegate
              and is non-transferable. Any attempt to misuse, duplicate, or transfer access
              credentials may result in denial of entry without refund.
            </p>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              2. Delegate Conduct & Compliance
            </h2>
            <p>
              Delegates are required to maintain professional conduct at all times. Any behavior
              deemed disruptive, unethical, unlawful, or detrimental to the safety or dignity of
              other participants may result in immediate removal from the event premises without
              any entitlement to refund or compensation.
            </p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              3. Intellectual Property & Usage Restrictions
            </h2>
            <p>
              All content presented during the event, including but not limited to presentations,
              materials, branding, and audio-visual content, remains the intellectual property of
              Ascent Matrix, its speakers, or licensors. Unauthorized recording, reproduction,
              distribution, or commercial exploitation is strictly prohibited.
            </p>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              4. Limitation of Liability
            </h2>
            <p>
              Participation in the event is at the delegate’s sole risk. Ascent Matrix shall not be
              responsible or liable for any personal injury, loss, theft, or damage to property,
              whether occurring within or outside the event venue, to the maximum extent permitted
              by applicable law.
            </p>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              5. Event Modifications & Force Majeure
            </h2>
            <p>
              Ascent Matrix reserves the right to modify, postpone, or cancel the event due to
              circumstances beyond reasonable control, including but not limited to governmental
              restrictions, natural disasters, public health emergencies, or technical failures.
              Such modifications shall not give rise to any claim for damages or compensation.
            </p>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India. Any
              disputes arising out of or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the competent courts of Bangalore.
            </p>
          </section>

          {/* SECTION 7 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              7. Contact Information
            </h2>
            <p>
              For official communication, clarifications, or legal notices, delegates may contact
              Ascent Matrix using the details below.
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

export default TermsConditions;
