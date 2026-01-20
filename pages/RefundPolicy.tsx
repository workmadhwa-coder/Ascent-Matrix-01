import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-950 border border-white/5 p-10 md:p-16 rounded-[3rem] shadow-2xl">
        
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8">
          Refund & Cancellation Policy
        </h1>

        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-12 italic">
          Delegate Registration & Payment Terms
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed text-sm">

          {/* SECTION 1 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              1. Delegate-Initiated Cancellation
            </h2>
            <p>
              All registrations for Ascent Matrix events are deemed final upon successful payment.
              Requests for cancellation, withdrawal, or substitution initiated by the delegate
              shall not be eligible for refund under any circumstances, except where explicitly
              stated otherwise in writing by the organizers.
            </p>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              2. Non-Refundable Nature of Fees
            </h2>
            <p>
              All delegate fees are non-refundable and non-transferable. Administrative charges,
              payment gateway fees, and associated operational costs are incurred immediately upon
              registration and are therefore not recoverable.
            </p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              3. Event Cancellation or Rescheduling
            </h2>
            <p>
              In the unlikely event that Ascent Matrix cancels the event, registered delegates may,
              at the sole discretion of the organizers, be offered either a full refund or automatic
              transfer of registration to a rescheduled date. The mode of resolution Preferred by the organizers of Ascent Matrix shall be final
              and binding.
            </p>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              4. Payment Failures & Gateway Disputes
            </h2>
            <p>
              If a payment is debited without successful registration confirmation, resolution shall
              be governed by the policies of the authorized payment gateway. Ascent Matrix shall
              provide reasonable assistance but shall not be liable for delays, reversals, or
              failures attributable to third-party service providers.
            </p>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              5. Force Majeure
            </h2>
            <p>
              Ascent Matrix shall not be held responsible for cancellation, postponement, or
              modification of the event due to circumstances beyond reasonable control, including
              but not limited to acts of God, government restrictions, natural disasters, public
              health emergencies, or technical failures. In such cases, no refund obligation shall
              arise.
            </p>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-4">
              6. Contact & Support
            </h2>
            <p>
              For official communication regarding payment or registration concerns, delegates may
              contact us through the details below.
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

export default RefundPolicy;
