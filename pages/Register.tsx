import React, { useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { saveRegistration } from '../services/storage';
import { RegistrationData } from '../types';

const { useNavigate } = ReactRouterDOM as any;

// Updated pricing as per requirements
const BASE_PRICE = 999; 
const IDEATHON_PRICE = 1499;
const EXTRA_PERSON_PRICE = 750;

const STALL_OPTIONS = {
  'None': 0,
  '4mx8m': 6000,
  '6mx12m': 9000
};

const ORG_TYPES = ["Startup", "MSME", "Corporate / MNC", "Investor / VC / Angel", "Bank / Financial Institution", "Academia / Research", "Government / PSU", "Incubator / Accelerator", "Student", "Other"];

const DOMAINS = ["AI / ML", "Semiconductor", "Robotics / Electronics", "MedTech / HealthTech", "Clean Energy / ClimateTech", "SpaceTech / DefenceTech", "AgriTech", "FinTech", "Manufacturing / Industry 4.0", "Cybersecurity", "Biotech / Life Sciences", "Smart Mobility", "Quantum", "Bio informatics", "Legal / IP", "Other"];
const ROLES = ["Founder / Co-Founder", "Innovator", "Investor", "Mentor", "Banker / Financial Facilitator", "Industry Leader", "Academia / Researcher", "Policy / Government", "Student / Aspiring Entrepreneur"];

const PURPOSES = ["Investment / Funding Opportunities", "Mentorship & Expert Guidance", "Bank & Financial Support", "Industry Partnerships", "Policy & Government Connect", "Market Access / Pilots", "Networking & Ecosystem Exposure"];

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [isIdeathon, setIsIdeathon] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [stallType, setStallType] = useState<keyof typeof STALL_OPTIONS>('None');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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
    ndaAccepted: false
  });

  const calculateTotal = () => {
    // Determine base price based on selection
    const activeBasePrice = isIdeathon ? IDEATHON_PRICE : BASE_PRICE;
    
    // Calculate additional people (Base pass includes 1 person now based on logic, 
    // or adjust attendeeCount - 1 if the first person is the base user)
    const additionalCount = Math.max(0, attendeeCount - 1);
    
    let total = activeBasePrice + (additionalCount * EXTRA_PERSON_PRICE);
    total += STALL_OPTIONS[stallType];
    return total;
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
      if (!formData.problemStatement) newErrors.push('problemStatement');
      if (!formData.solution) newErrors.push('solution');
      if (!pdfFile) newErrors.push('pdf');
      if (!formData.ndaAccepted) newErrors.push('ndaAccepted');
    } else if (step === 3) {
      if (formData.domains.length === 0) newErrors.push('domains');
      if (formData.domains.includes('Other') && !formData.domainsOther) newErrors.push('domainsOther');
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
    }
  };

  const handleProceedToPayment = async () => {
    setIsSaving(true);

    const registrationData: RegistrationData = {
      id: registrationIdRef.current,
      fullName: formData.fullName,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      state: formData.state,
      organization: formData.organization,
      designation: formData.designation,
      orgType: formData.orgType,
      orgTypeOther: formData.orgTypeOther,
      domains: formData.domains,
      domainsOther: formData.domainsOther,
      ecosystemRole: formData.ecosystemRole,
      purposes: formData.purposes,
      qucInterest: formData.qucInterest,
      stallType,
      stallPrice: STALL_OPTIONS[stallType],
      ticketCount: attendeeCount,
      totalAmount: calculateTotal(),
      paymentStatus: 'PENDING',
      registrationDate: new Date().toISOString(),
      checkedIn: false,
      ticketType: isIdeathon ? 'Event + Ideathon' : 'Summit Pass'
    };

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('registrationId', registrationIdRef.current);
      if (isIdeathon && pdfFile) {
        formDataToSend.append('pdf', pdfFile);
      }
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('organization', formData.organization);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('orgType', formData.orgType);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('domains', JSON.stringify(formData.domains));
      formDataToSend.append('ecosystemRole', formData.ecosystemRole);
      formDataToSend.append('purposes', JSON.stringify(formData.purposes));
      formDataToSend.append('problemStatement', formData.problemStatement || '');
      formDataToSend.append('solution', formData.solution || '');
      formDataToSend.append('stallType', stallType);
      formDataToSend.append('stallPrice', STALL_OPTIONS[stallType].toString());
      formDataToSend.append('ticketCount', attendeeCount.toString());
      formDataToSend.append('totalAmount', calculateTotal().toString());
      formDataToSend.append('ticketType', isIdeathon ? 'Event + Ideathon' : 'Summit Pass');

      const backendUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'https://backend-3bat.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/ticket/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to save registration');
      }

      // NAVIGATE TO PAYMENT PAGE (Not back to registration)
      navigate('/payment', { 
        state: { 
          registrationId: registrationIdRef.current,
          amount: calculateTotal()
        } 
      });

    } catch (err) {
      console.error('Registration error:', err);
      alert(err instanceof Error ? err.message : "Error saving registration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDomainSelect = (domain: string) => {
    if (formData.domains.includes(domain)) {
      setFormData({ ...formData, domains: formData.domains.filter(d => d !== domain) });
    } else if (formData.domains.length < 2) {
      setFormData({ ...formData, domains: [...formData.domains, domain] });
    }
  };

  const handlePurposeSelect = (purpose: string) => {
    if (formData.purposes.includes(purpose)) {
      setFormData({ ...formData, purposes: formData.purposes.filter(p => p !== purpose) });
    } else {
      setFormData({ ...formData, purposes: [...formData.purposes, purpose] });
    }
  };

  const inputClass = (field: string) => `w-full bg-zinc-900 border rounded-xl px-5 py-4 text-white outline-none transition-all duration-300 ${
    errors.includes(field) ? 'border-red-500 animate-shake bg-red-500/5' : 'border-zinc-800 focus:border-purple-500'
  }`;

  const currentTotal = calculateTotal();

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic text-center mb-8">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => { setIsIdeathon(false); setStep(1); }}
                className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-[2rem] cursor-pointer hover:border-zinc-500 transition-all group"
              >
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-purple-500 transition-colors">Normal Event</h3>
                <p className="text-zinc-500 text-sm mb-6">Access to sessions, networking, and exhibition.</p>
                <p className="text-3xl font-black text-white italic">₹999<span className="text-xs text-zinc-500 not-italic ml-1">/ person</span></p>
              </div>
              <div 
                onClick={() => { setIsIdeathon(true); setStep(1); }}
                className="p-8 bg-zinc-900 border-2 border-purple-500/50 rounded-[2rem] cursor-pointer hover:border-purple-500 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-purple-600 text-[10px] font-bold px-3 py-1">BEST VALUE</div>
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-purple-500 transition-colors">Event + Ideathon</h3>
                <p className="text-zinc-500 text-sm mb-6">Includes event pass plus pitching entry & prizes.</p>
                <p className="text-3xl font-black text-white italic">₹1499<span className="text-xs text-zinc-500 not-italic ml-1">/ person</span></p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">1. Delegate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass('fullName')} />
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={inputClass('gender')}>
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option><option>Prefer not to say</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="tel" placeholder="Mobile Number (10 Digits)" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className={inputClass('phone')} />
              <input type="email" placeholder="Email ID" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass('email')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass('city')} />
              <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClass('state')} />
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Attendees</p>
              <div className="flex items-center gap-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 w-fit mb-4">
                <button type="button" onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))} className="w-10 h-10 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700">-</button>
                <span className="text-xl font-bold text-white w-8 text-center">{attendeeCount}</span>
                <button type="button" onClick={() => setAttendeeCount(attendeeCount + 1)} className="w-10 h-10 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700">+</button>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Exhibition Stall</p>
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
                {(Object.keys(STALL_OPTIONS) as Array<keyof typeof STALL_OPTIONS>).map((option) => (
                  <button
  key={option}
  onClick={() => setStallType(option)}
  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-32 ${
    stallType === option ? 'border-blue-600' : 'border-gray-300'
  }`}
>
                    <span className="text-white font-black uppercase text-sm">{option === 'None' ? 'No Stall' : option}</span>
                    <span className="text-purple-400 font-bold text-xs">{option === 'None' ? '-' : `₹${STALL_OPTIONS[option].toLocaleString()}`}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 p-8 bg-zinc-900/80 rounded-[2rem] border-2 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-600 to-pink-600"></div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div className="text-right w-full">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 block">Payable Total</span>
                  <span className="text-5xl font-black text-white italic tracking-tighter">₹{currentTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-zinc-800">
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-purple-500 hover:text-white transition-all">Next Step</button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">2. Organization</h2>
            <input type="text" placeholder="Organization / Institution Name" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className={inputClass('organization')} />
            <input type="text" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className={inputClass('designation')} />
            <select value={formData.orgType} onChange={e => setFormData({...formData, orgType: e.target.value})} className={inputClass('orgType')}>
              <option value="">Type of Organization</option>
              {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            {formData.orgType === 'Other' && (
              <input type="text" placeholder="Specify Type" value={formData.orgTypeOther} onChange={e => setFormData({...formData, orgTypeOther: e.target.value})} className={inputClass('orgTypeOther')} />
            )}
            <div className="flex justify-between pt-10 border-t border-zinc-800">
              <button onClick={() => setStep(1)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm hover:bg-purple-500 hover:text-white transition-all">Next Step</button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-2">3. Primary Domain</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 italic">Select up to 2 sectors</p>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl border transition-all ${errors.includes('domains') ? 'border-red-500 bg-red-500/5 animate-shake' : 'border-transparent'}`}>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => handleDomainSelect(d)} className={`p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.domains.includes(d) ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  {d}
                </button>
              ))}
            </div>
            {formData.domains.includes('Other') && (
              <input type="text" placeholder="Specify Domain" value={formData.domainsOther} onChange={e => setFormData({...formData, domainsOther: e.target.value})} className={inputClass('domainsOther')} />
            )}
            <div className="flex justify-between pt-10 border-t border-zinc-800">
              <button onClick={() => setStep(2)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm hover:bg-purple-500 hover:text-white transition-all">Next Step</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">4. Ecosystem Identity</h2>
            <div className={`grid grid-cols-1 gap-3 p-4 rounded-2xl border transition-all ${errors.includes('ecosystemRole') ? 'border-red-500 bg-red-500/5 animate-shake' : 'border-transparent'}`}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setFormData({...formData, ecosystemRole: r})} className={`p-5 rounded-xl border text-left font-black uppercase text-xs transition-all ${formData.ecosystemRole === r ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-10 border-t border-zinc-800">
              <button onClick={() => setStep(3)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm hover:bg-purple-500 hover:text-white transition-all">Next Step</button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-8">5. Engagement & QUC</h2>
            <div className={`grid grid-cols-1 gap-2 p-4 rounded-2xl border transition-all ${errors.includes('purposes') ? 'border-red-500 bg-red-500/5 animate-shake' : 'border-transparent'}`}>
              {PURPOSES.map(p => (
                <button key={p} onClick={() => handlePurposeSelect(p)} className={`p-4 rounded-xl border text-left text-[10px] font-bold uppercase transition-all ${formData.purposes.includes(p) ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  {p}
                </button>
              ))}
            </div>

            <p className="text-zinc-300 font-bold mb-4 italic mt-8">Future QUC Session Participation?</p>
            <div className={`flex gap-4 p-4 rounded-2xl border transition-all ${errors.includes('qucInterest') ? 'border-red-500 bg-red-500/5 animate-shake' : 'border-transparent'}`}>
              {["Yes", "No", "Maybe"].map(val => (
                <button key={val} onClick={() => setFormData({...formData, qucInterest: val})} className={`flex-1 py-4 rounded-xl border font-black uppercase text-xs transition-all ${formData.qucInterest === val ? 'bg-green-600 border-green-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  {val}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-10 border-t border-zinc-800">
              <button onClick={() => setStep(4)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-sm hover:bg-purple-500 hover:text-white transition-all">Review Final</button>
            </div>
          </div>
        );

      case 5.5:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-purple-500 uppercase italic mb-4">Ideathon Details</h2>
            <textarea placeholder="Problem Statement" value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} className={`${inputClass('problemStatement')} min-h-[100px]`} />
            <textarea placeholder="Proposed Solution" value={formData.solution} onChange={e => setFormData({...formData, solution: e.target.value})} className={`${inputClass('solution')} min-h-[100px]`} />
            <div className={`p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer hover:border-purple-500 ${
              pdfFile ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800'
            } ${errors.includes('pdf') ? 'border-red-500 bg-red-500/5 animate-shake' : ''}`}>
              <label className="cursor-pointer block">
                <p className="text-zinc-500 text-xs font-bold mb-2">Upload 2-Page Idea PDF (Max 5MB)</p>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="text-white text-xs cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        setErrors([...errors.filter(x => x !== 'pdf'), 'pdf']);
                        alert('Only PDF files are allowed');
                      } else if (file.size > 5 * 1024 * 1024) {
                        setErrors([...errors.filter(x => x !== 'pdf'), 'pdf']);
                        alert('File size must be less than 5MB');
                      } else {
                        setPdfFile(file);
                        setErrors(errors.filter(x => x !== 'pdf'));
                      }
                    }
                  }}
                />
                {pdfFile && <p className="text-purple-400 text-xs mt-2 font-bold">✓ {pdfFile.name}</p>}
              </label>
            </div>
            <div className="flex items-center gap-3 p-2">
              <input type="checkbox" id="nda" checked={formData.ndaAccepted} onChange={e => setFormData({...formData, ndaAccepted: e.target.checked})} className="w-5 h-5 accent-purple-600" />
              <label htmlFor="nda" className="text-zinc-400 text-[10px] uppercase font-bold">
                I agree to the <a href="#" className="text-purple-500 underline">NDA Policy</a>. Your idea is safe with us.
              </label>
            </div>
            {errors.includes('ndaAccepted') && <p className="text-red-500 text-[10px]">Please accept the NDA</p>}
            <div className="flex justify-between pt-6 border-t border-zinc-800">
              <button onClick={() => setStep(5)} className="text-zinc-500 font-black uppercase text-sm">Back</button>
              <button onClick={handleNext} className="bg-purple-600 text-white px-12 py-4 rounded-xl font-black uppercase text-sm">Review Final</button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-white uppercase italic mb-4">Final Review</h2>
            <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
              <div className="p-8">
                <h4 className="text-[10px] font-black uppercase text-purple-500 mb-4 tracking-widest">Delegate Profile</h4>
                <p className="text-white font-black text-xl italic leading-none mb-2">{formData.fullName}</p>
                <p className="text-zinc-500 text-sm font-bold">{formData.email} | {formData.phone}</p>
                <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">{formData.city}, {formData.state}</p>
              </div>
              <div className="p-8">
                <h4 className="text-[10px] font-black uppercase text-purple-500 mb-4 tracking-widest">Organization & Role</h4>
                <p className="text-white font-black text-lg italic leading-none mb-1">{formData.organization}</p>
                <p className="text-zinc-400 text-sm font-bold">{formData.designation}</p>
              </div>
              <div className="p-8 bg-purple-600/5">
                <h4 className="text-[10px] font-black uppercase text-pink-500 mb-4 tracking-widest">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-zinc-400 uppercase font-black">
                    <span>{isIdeathon ? 'Event + Ideathon' : 'Normal Event'} (x{attendeeCount})</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white font-black uppercase text-xl italic tracking-tighter">Grand Total</span>
                    <span className="text-4xl font-black text-purple-400 italic">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-10">
              <button onClick={() => setStep(isIdeathon ? 5.5 : 5)} className="text-zinc-500 font-black uppercase text-sm">Edit Details</button>
              <button 
                onClick={handleProceedToPayment} 
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50"
              >
                {isSaving ? 'Initializing...' : 'Confirm & Proceed to Pay'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-purple-500/30 p-8 rounded-[2rem] max-w-md w-full animate-fade-in-up shadow-2xl">
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Are you participating in Ideathon?</h3>
            <div className="space-y-3 mb-8 text-zinc-400 text-sm">
              <p className="flex items-center gap-2">🏆 <span className="font-bold text-white">₹30,000</span> for best 3 projects</p>
              <p className="flex items-center gap-2">📜 <span className="font-bold text-white">Free Patent</span> & expert consultation</p>
              <p className="flex items-center gap-2">🔥 <span className="font-bold text-white">Only ₹1,499</span> inclusive of event pass</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsIdeathon(true); setShowUpsell(false); setStep(5.5); }} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-purple-500 transition-all">Yes, I want to attend</button>
              <button onClick={() => { setShowUpsell(false); setStep(6); }} className="w-full bg-transparent text-zinc-600 py-2 font-black uppercase text-xs tracking-widest">No, Thanks</button>
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
        <div className="bg-zinc-950/40 p-4 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative">
          <div className="absolute top-0 right-12 w-24 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full -translate-y-1/2"></div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Register;
