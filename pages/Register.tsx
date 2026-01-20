import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RegistrationData } from '../types';

const { useNavigate } = ReactRouterDOM as any;

// Requirements-based constants
const EVENT_ONLY_BASE = 999;
const IDEATHON_BASE = 1599; // First person
const IDEATHON_ADDITIONAL = 1499; // Every +1 person

const STALL_OPTIONS = {
  'None': 0,
  'Outdoor Experience Stall (9ftx9ft)': 6000,
  'Indoor Corporate Stall (10ftx10ft)': 10000
};

const ORG_TYPES = ["Startup", "MSME", "Corporate / MNC", "Investor / VC / Angel", "Bank / Financial Institution", "Academia / Research", "Government / PSU", "Incubator / Accelerator", "Student", "Other"];
const DOMAINS = ["AI / ML", "Semiconductor", "Robotics / Electronics", "MedTech / HealthTech", "Clean Energy / ClimateTech", "SpaceTech / DefenceTech", "AgriTech", "FinTech", "Manufacturing / Industry 4.0", "Cybersecurity", "Biotech / Life Sciences", "Smart Mobility", "Quantum", "Bio informatics", "Legal / IP", "Other"];
const ROLES = ["Founder / Co-Founder", "Innovator", "Investor", "Mentor", "Banker / Financial Facilitator", "Industry Leader", "Academia / Researcher", "Policy / Government", "Student / Aspiring Entrepreneur"];
const PURPOSES = ["Investment / Funding Opportunities", "Mentorship & Expert Guidance", "Bank & Financial Support", "Industry Partnerships", "Policy & Government Connect", "Market Access / Pilots", "Networking & Ecosystem Exposure"];

const Register = () => {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const errorFieldsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // States
  const [step, setStep] = useState(0);
  const [isIdeathon, setIsIdeathon] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [stallType, setStallType] = useState<keyof typeof STALL_OPTIONS>('None');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string, body: React.ReactNode } | null>(null);

  const registrationIdRef = useRef(`AM26-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    organization: '',
    designation: '',
    orgType: '',
    orgTypeOther: '',
    domains: [] as string[],
    domainsOther: '',
    ecosystemRole: '',
    purposes: [] as string[],
    qucInterest: '',
    problemStatement: '',
    solution: '',
    ndaAccepted: false,
    tcAccepted: false
  });

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const calculateTotal = () => {
    if (isIdeathon) {
      // First is 1599, rest are 1499
      const totalTickets = IDEATHON_BASE + (Math.max(0, attendeeCount - 1) * IDEATHON_ADDITIONAL);
      return totalTickets + STALL_OPTIONS[stallType];
    } else {
      // Every person is 999
      const totalTickets = attendeeCount * EVENT_ONLY_BASE;
      return totalTickets + STALL_OPTIONS[stallType];
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);

  const checkValidation = () => {
    const newErrors: string[] = [];
    if (step === 1) {
      if (!formData.fullName) newErrors.push('fullName');
      if (!formData.gender) newErrors.push('gender');
      if (!validatePhone(formData.phone)) newErrors.push('phone');
      if (!validateEmail(formData.email)) newErrors.push('email');
      if (!formData.city) newErrors.push('city');
      if (!formData.state) newErrors.push('state');
    } else if (step === 2) {
      if (!formData.organization) newErrors.push('organization');
      if (!formData.designation) newErrors.push('designation');
      if (!formData.orgType) newErrors.push('orgType');
    } else if (step === 5.5) {
      if (!formData.problemStatement || formData.problemStatement.length > 250) newErrors.push('problemStatement');
      if (!formData.solution || formData.solution.length > 750) newErrors.push('solution');
      if (!pdfFile) newErrors.push('pdf');
      if (!formData.ndaAccepted) newErrors.push('ndaAccepted');
      if (!formData.tcAccepted) newErrors.push('tcAccepted');
    } else if (step === 3) {
      if (formData.domains.length === 0) newErrors.push('domains');
    } else if (step === 4) {
      if (!formData.ecosystemRole) newErrors.push('ecosystemRole');
    } else if (step === 5) {
      if (formData.purposes.length === 0) newErrors.push('purposes');
      if (!formData.qucInterest) newErrors.push('qucInterest');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (checkValidation()) {
      if (step === 5) {
        if (!isIdeathon) {
          setShowUpsell(true);
        } else {
          setStep(5.5);
        }
      } else if (step === 5.5) {
        setStep(6);
      } else {
        setStep(prev => prev + 1);
      }
      setErrors([]);
    } else {
      // Scroll to first error field
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]') as HTMLElement;
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const openStallInfo = () => {
    setModalContent({
      title: "Premium Exhibition Stall",
      body: (
        <div className="space-y-3 text-zinc-300 text-sm">
          <p>Opting for a stall positions your brand at the forefront of the event with high-visibility professional space.</p>
          
          <div className="bg-zinc-800/30 p-3 rounded-lg">
            <p className="font-bold text-purple-400 mb-2 text-xs">Why Choose a Stall?</p>
            <ul className="space-y-1 text-xs">
              <li>✦ Live product demonstrations</li>
              <li>✦ Personalized service consultations</li>
              <li>✦ Stronger brand recall & engagement</li>
              <li>✦ High-quality leads & opportunities</li>
            </ul>
          </div>

          <div className="border border-zinc-700 rounded-lg p-3">
            <p className="font-bold text-green-400 mb-2 text-xs">Stall Configurations:</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Outdoor (9ft × 9ft)</span>
                <span className="text-zinc-400">₹6,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-semibold">Indoor (10ft × 10ft)</span>
                <span className="text-zinc-400">₹10,000</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/30 p-3 rounded-lg">
            <p className="font-bold text-green-400 mb-2 text-xs">Amenities Included:</p>
            <ul className="space-y-1 text-xs">
              <li>✔ 2 premium chairs</li>
              <li>✔ 1 display table</li>
              <li>✔ Dedicated visitor space</li>
            </ul>
          </div>
        </div>
      )
    });
  };

  const openNDAModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalContent({
      title: "Non-Disclosure Agreement (NDA)",
      body: (
        <div className="text-xs text-zinc-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-bold text-white">This Non-Disclosure Agreement (the "Agreement") is entered into by and between Ascent Matrix (the "Organizer") and the Participant (the "Disclosing Party") to ensure the protection and confidential treatment of intellectual property and proprietary data submitted during the Ideathon.</p>
          
          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">1. Definition of Confidential Information</strong></p>
            <p>"Confidential Information" shall include all written summaries, problem statements, solutions, technical designs, business models, and any other proprietary material submitted by the Participant for the Ascent Matrix Ideathon.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">2. Purpose of Disclosure</strong></p>
            <p>The Organizer shall use the Confidential Information solely for the following purposes:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Evaluation and judging of the ideathon entries</li>
              <li>Determining eligibility for prizes and benefits</li>
              <li>Administrative coordination of the Ascent Matrix event</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">3. Obligations of the Organizer</strong></p>
            <p>The Organizer agrees to:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Maintain Confidentiality:</strong> Hold all submitted data in strict confidence and take reasonable precautions to prevent unauthorized access</li>
              <li><strong>Restrict Access:</strong> Limit access to Confidential Information only to designated judges, mentors, and event staff</li>
              <li><strong>Non-Misuse:</strong> Not utilize any idea for commercial purpose without express written consent</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">4. Exclusions</strong></p>
            <p>This Agreement does not apply to information that is public knowledge, already known, or independently developed.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">5. Intellectual Property Rights</strong></p>
            <p>The Participant retains all rights to their original ideas and projects, subject to the terms and conditions of the Ascent Matrix prize structure.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">6. Term</strong></p>
            <p>The obligations of confidentiality shall remain in effect for a period of two (2) years from the date of submission.</p>
          </div>
        </div>
      )
    });
  };

  const openTCModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalContent({
      title: "Terms and Conditions",
      body: (
        <div className="text-xs text-zinc-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-bold text-white">TERMS AND CONDITIONS (T&C)</p>
          
          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">1. Eligibility and Participation</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Participants must provide accurate and complete information during registration</li>
              <li>Submissions must be original works of the Participant. Plagiarism or unauthorized use of third-party intellectual property will result in immediate disqualification</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">2. Submission Guidelines</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>All entries must be submitted in the requested format (1-2 page summary/problem statement)</li>
              <li>Late submissions beyond the specified deadline will not be considered for evaluation or prizes</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">3. Evaluation and Judging</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>The decisions of the Ascent Matrix judging panel are final and binding</li>
              <li>The Organizer reserves the right to not award prizes if submissions do not meet minimum quality standards</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">4. Prizes and Benefits</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Prizes are non-transferable and cannot be exchanged for cash unless otherwise specified</li>
              <li>Winners are responsible for any personal tax implications resulting from the receipt of prizes</li>
            </ul>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">5. Marketing and Publicity Grant</strong></p>
            <p>By participating, the Participant grants the Organizer a non-exclusive, royalty-free, worldwide license to use the Participant's name, likeness, and photograph for promotional materials and event recaps. This does not grant rights to the technical "inner workings" protected under the NDA.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">6. Limitation of Liability</strong></p>
            <p>Ascent Matrix shall not be held liable for any technical malfunctions, data loss, or any damages resulting from participation.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">7. Modifications and Cancellation</strong></p>
            <p>The Organizer reserves the right to modify timeline, prize structure, or rules, or to cancel the event due to unforeseen circumstances, with prior notice.</p>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <p><strong className="text-purple-400">8. Governing Law</strong></p>
            <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of Republic of India.</p>
          </div>
        </div>
      )
    });
  };

  const handleProceedToPayment = async () => {
    setIsSaving(true);
    // Logic for API calls as per your original code...
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('registrationId', registrationIdRef.current);
        if (isIdeathon && pdfFile) formDataToSend.append('pdf', pdfFile);
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('state', formData.state);
        formDataToSend.append('organization', formData.organization);
        formDataToSend.append('designation', formData.designation);
        formDataToSend.append('totalAmount', calculateTotal().toString());
        formDataToSend.append('ticketType', isIdeathon ? 'Event + Ideathon' : 'Summit Pass');

        const backendUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'https://backend-3bat.onrender.com';
        const response = await fetch(`${backendUrl}/api/ticket/register`, { method: 'POST', body: formDataToSend });

        if (!response.ok) throw new Error('Failed to save registration');
        navigate('/payment', { state: { registrationId: registrationIdRef.current, amount: calculateTotal() } });
    } catch (err) {
        alert("Error saving registration.");
    } finally {
        setIsSaving(false);
    }
  };

  const inputClass = (field: string) => `w-full bg-zinc-900 border rounded-xl px-5 py-4 text-white outline-none transition-all duration-300 ${
    errors.includes(field) ? 'border-red-500 animate-shake ring-2 ring-red-500/20' : 'border-zinc-800 focus:border-purple-500'
  }`;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic text-center mb-8">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Card */}
              <div 
                onClick={() => { setIsIdeathon(false); setStep(1); }}
                className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-[2rem] cursor-pointer hover:border-purple-500 transition-all group relative"
              >
                <div className="mb-4 text-2xl">🎟️</div>
                <h3 className="text-xl font-black text-white uppercase mb-4 group-hover:text-purple-500 transition-colors">Event Entry Pass</h3>
                <div className="space-y-2 text-zinc-500 text-xs mb-6 font-medium">
                    <p>✅ Full access to the event session & keynotes</p>
                    <p>🎤 Learn from industry experts & innovators</p>
                    <p>🤝 Network with founders, mentors & peers</p>
                    <p>🚀 Exposure to cutting-edge ideas & trends</p>
                </div>
                <p className="text-3xl font-black text-white italic">₹999<span className="text-xs text-zinc-500 not-italic ml-1">/ person</span></p>
              </div>

              {/* Ideathon Card */}
              <div 
                onClick={() => { setIsIdeathon(true); setStep(1); }}
                className="p-8 bg-zinc-900 border-2 border-purple-500/50 rounded-[2rem] cursor-pointer hover:border-purple-500 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-purple-600 text-[10px] font-bold px-3 py-1">BUILD. COMPETE. WIN.</div>
                <div className="mb-4 text-2xl">🚀</div>
                <h3 className="text-xl font-black text-white uppercase mb-4 group-hover:text-purple-500 transition-colors">Event + Ideathon Pass</h3>
                <div className="space-y-2 text-zinc-500 text-xs mb-6 font-medium">
                    <p>🎟️ Complete event access + Ideathon participation</p>
                    <p>🧠 Submit 1–2 page idea synopsis</p>
                    <p>🏆 Winners get a FREE Provisional Patent (Worth ₹25,000)</p>
                    <p>💻 Winners get FREE Software Support for up to ₹20,000</p>
                </div>
                <p className="text-3xl font-black text-white italic">₹1599<span className="text-xs text-zinc-500 not-italic ml-1">/ person</span></p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">1. Delegate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error={errors.includes('fullName') ? 'true' : 'false'}>
                <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass('fullName')} />
              </div>
              <div data-error={errors.includes('gender') ? 'true' : 'false'}>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={inputClass('gender')}>
                  <option value="">Select Gender</option>
                  <option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error={errors.includes('phone') ? 'true' : 'false'}>
                <input type="tel" placeholder="Mobile Number" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className={inputClass('phone')} />
              </div>
              <div data-error={errors.includes('email') ? 'true' : 'false'}>
                <input type="email" placeholder="Email ID" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass('email')} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error={errors.includes('city') ? 'true' : 'false'}>
                <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass('city')} />
              </div>
              <div data-error={errors.includes('state') ? 'true' : 'false'}>
                <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClass('state')} />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Quantity (+1 Adds More)</p>
              <div className="flex items-center gap-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 w-fit mb-4">
                <button type="button" onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))} className="w-10 h-10 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700">-</button>
                <span className="text-xl font-bold text-white w-8 text-center">{attendeeCount}</span>
                <button type="button" onClick={() => setAttendeeCount(attendeeCount + 1)} className="w-10 h-10 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700">+</button>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Exhibition Stall (Optional)</p>
                <button onClick={openStallInfo} className="text-purple-500 text-[10px] font-bold underline uppercase">Get more info about stalls</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(STALL_OPTIONS) as Array<keyof typeof STALL_OPTIONS>).map((option) => (
                  <button
                    key={option}
                    onClick={() => setStallType(option)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-28 ${
                      stallType === option ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900'
                    }`}
                  >
                    <span className="text-white font-black uppercase text-[10px] leading-tight">{option}</span>
                    <span className="text-purple-400 font-bold text-xs">{option === 'None' ? '-' : `₹${STALL_OPTIONS[option].toLocaleString()}`}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 p-6 bg-zinc-900 rounded-[2rem] border-2 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center">
                <div className="text-right w-full">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">Payable Total</span>
                  <span className="text-4xl font-black text-white italic">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-zinc-800">
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-purple-500 hover:text-white transition-all">Next Step</button>
            </div>
          </div>
        );

      case 5.5:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-purple-500 uppercase italic mb-4">Ideathon Details</h2>
            <div className="space-y-1" data-error={errors.includes('problemStatement') ? 'true' : 'false'}>
                <textarea 
                    placeholder="Problem Statement" 
                    maxLength={250}
                    value={formData.problemStatement} 
                    onChange={e => setFormData({...formData, problemStatement: e.target.value})} 
                    className={`${inputClass('problemStatement')} min-h-[100px]`} 
                />
                <p className="text-[10px] text-zinc-500 text-right uppercase font-bold">{formData.problemStatement.length}/250 Characters</p>
            </div>
            
            <div className="space-y-1" data-error={errors.includes('solution') ? 'true' : 'false'}>
                <textarea 
                    placeholder="Proposed Solution" 
                    maxLength={750}
                    value={formData.solution} 
                    onChange={e => setFormData({...formData, solution: e.target.value})} 
                    className={`${inputClass('solution')} min-h-[150px]`} 
                />
                <p className="text-[10px] text-zinc-500 text-right uppercase font-bold">{formData.solution.length}/750 Characters</p>
            </div>

            <div data-error={errors.includes('pdf') ? 'true' : 'false'} className={`p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer hover:border-purple-500 ${
              pdfFile ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800'
            } ${errors.includes('pdf') ? 'border-red-500 bg-red-500/5 animate-shake' : ''}`}>
              <label className="cursor-pointer block">
                <p className="text-zinc-500 text-xs font-bold mb-2 uppercase">Upload Idea Synopsis (PDF Max 5MB)</p>
                <input 
                  type="file" accept=".pdf" className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                <div className="text-white text-xs py-2 bg-zinc-800 rounded-lg text-center font-bold">
                    {pdfFile ? `✓ ${pdfFile.name}` : "Click to select PDF"}
                </div>
              </label>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3" data-error={errors.includes('ndaAccepted') ? 'true' : 'false'}>
                  <input type="checkbox" id="nda" checked={formData.ndaAccepted} onChange={e => setFormData({...formData, ndaAccepted: e.target.checked})} className="mt-1 w-5 h-5 accent-purple-600" />
                  <label htmlFor="nda" className={`text-[10px] uppercase font-bold leading-tight ${errors.includes('ndaAccepted') ? 'text-red-400' : 'text-zinc-400'}`}>
                    I agree to the <button onClick={openNDAModal} className="text-purple-500 underline">NDA Policy</button>. We ensure protection and confidential treatment of your data.
                  </label>
                </div>
                <div className="flex items-start gap-3" data-error={errors.includes('tcAccepted') ? 'true' : 'false'}>
                  <input type="checkbox" id="tc" checked={formData.tcAccepted} onChange={e => setFormData({...formData, tcAccepted: e.target.checked})} className="mt-1 w-5 h-5 accent-purple-600" />
                  <label htmlFor="tc" className={`text-[10px] uppercase font-bold leading-tight ${errors.includes('tcAccepted') ? 'text-red-400' : 'text-zinc-400'}`}>
                    I agree to the <button onClick={openTCModal} className="text-purple-500 underline">Terms and Conditions</button>.
                  </label>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-zinc-800">
              <button onClick={() => setStep(5)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-purple-600 text-white px-12 py-4 rounded-xl font-black uppercase text-sm">Review Final</button>
            </div>
          </div>
        );

      /* Placeholder for Step 2, 3, 4, 5, 6 as they remain largely identical to original columns but included in logic */
      case 2: return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">2. Organization</h2>
            <div data-error={errors.includes('organization') ? 'true' : 'false'}>
              <input type="text" placeholder="Organization / Institution Name" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className={inputClass('organization')} />
            </div>
            <div data-error={errors.includes('designation') ? 'true' : 'false'}>
              <input type="text" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className={inputClass('designation')} />
            </div>
            <div data-error={errors.includes('orgType') ? 'true' : 'false'}>
              <select value={formData.orgType} onChange={e => setFormData({...formData, orgType: e.target.value})} className={inputClass('orgType')}>
                  <option value="">Type of Organization</option>
                  {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex justify-between pt-10 border-t border-zinc-800">
                <button onClick={() => setStep(1)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
                <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm">Next Step</button>
            </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-2">3. Primary Domain</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map(d => (
                    <button key={d} onClick={() => {
                        const domains = formData.domains.includes(d) ? formData.domains.filter(x => x !== d) : [...formData.domains, d].slice(0, 2);
                        setFormData({...formData, domains});
                    }} className={`p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.domains.includes(d) ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        {d}
                    </button>
                ))}
            </div>
            <div className="flex justify-between pt-10 border-t border-zinc-800">
                <button onClick={() => setStep(2)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
                <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm">Next Step</button>
            </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">4. Ecosystem Identity</h2>
            <div className="grid grid-cols-1 gap-3">
                {ROLES.map(r => (
                    <button key={r} onClick={() => setFormData({...formData, ecosystemRole: r})} className={`p-5 rounded-xl border text-left font-black uppercase text-xs transition-all ${formData.ecosystemRole === r ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                        {r}
                    </button>
                ))}
            </div>
            <div className="flex justify-between pt-10 border-t border-zinc-800">
                <button onClick={() => setStep(3)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
                <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm">Next Step</button>
            </div>
        </div>
      );
      case 5: return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">5. Engagement & QUC</h2>
            <div className="grid grid-cols-1 gap-2">
                {PURPOSES.map(p => (
                    <button key={p} onClick={() => {
                        const purposes = formData.purposes.includes(p) ? formData.purposes.filter(x => x !== p) : [...formData.purposes, p];
                        setFormData({...formData, purposes});
                    }} className={`p-4 rounded-xl border text-left text-[10px] font-bold uppercase transition-all ${formData.purposes.includes(p) ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        {p}
                    </button>
                ))}
            </div>
            <div className="flex gap-4 mt-8">
                {["Yes", "No", "Maybe"].map(val => (
                    <button key={val} onClick={() => setFormData({...formData, qucInterest: val})} className={`flex-1 py-4 rounded-xl border font-black uppercase text-xs transition-all ${formData.qucInterest === val ? 'bg-green-600 border-green-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        {val}
                    </button>
                ))}
            </div>
            <div className="flex justify-between pt-10 border-t border-zinc-800">
                <button onClick={() => setStep(4)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
                <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm">Review Final</button>
            </div>
        </div>
      );
      case 6: return (
        <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic">Final Review</h2>
            <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 divide-y divide-white/5 overflow-hidden">
                <div className="p-8">
                    <h4 className="text-[10px] font-black uppercase text-purple-500 mb-4 tracking-widest">Delegate Profile</h4>
                    <p className="text-white font-black text-xl italic">{formData.fullName}</p>
                    <p className="text-zinc-500 text-sm">{formData.email} | {formData.phone}</p>
                </div>
                <div className="p-8 bg-purple-600/5">
                    <h4 className="text-[10px] font-black uppercase text-pink-500 mb-4 tracking-widest">Financial Summary</h4>
                    <div className="flex justify-between items-center">
                        <span className="text-white font-black uppercase text-xl italic tracking-tighter">Grand Total</span>
                        <span className="text-4xl font-black text-purple-400 italic">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-between pt-10">
                <button onClick={() => setStep(isIdeathon ? 5.5 : 5)} className="text-zinc-500 font-black uppercase text-sm">Edit Details</button>
                <button onClick={handleProceedToPayment} disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest">
                    {isSaving ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center">
                Please contact us for any issues during the payment:<br/>
                <span className="text-purple-400">business@madhwainfotech.com</span>
              </p>
            </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4" ref={topRef}>
      {/* Dynamic Modal Implementation */}
      {modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] max-w-lg w-full relative animate-fade-in-up max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-start p-6 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white uppercase italic flex-1">{modalContent.title}</h3>
              <button onClick={() => setModalContent(null)} className="ml-4 bg-purple-600 hover:bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all flex-shrink-0">&times;</button>
            </div>
            <div className="text-sm overflow-y-auto flex-1 p-6">
              {modalContent.body}
            </div>
            <div className="border-t border-zinc-800 p-6">
              <button onClick={() => setModalContent(null)} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-black uppercase text-xs transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-purple-500/30 p-8 rounded-[2rem] max-w-md w-full animate-fade-in-up">
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Are you participating in Ideathon?</h3>
            <div className="space-y-3 mb-8 text-zinc-400 text-sm">
                <p>🏆 <span className="font-bold text-white">Free Patent</span> worth ₹25,000</p>
                <p>💻 Software support & prize pools</p>
                <p>🔥 Only <span className="font-bold text-white">₹1,599</span> total</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsIdeathon(true); setShowUpsell(false); setStep(5.5); }} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase">Upgrade to Ideathon</button>
              <button onClick={() => { setShowUpsell(false); setStep(6); }} className="w-full text-zinc-600 py-2 font-black uppercase text-xs">No, continue with summit only</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 mb-16 justify-center">
          {[0, 1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-purple-600' : 'bg-zinc-800'}`}></div>
          ))}
        </div>
        <div className="bg-zinc-950/40 p-6 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-12 w-24 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          {renderStep()}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Register;
