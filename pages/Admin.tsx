import React, { useState, useEffect } from 'react';
import { RegistrationData, SponsorshipInquiry } from '../types';
import { QrCode, X, Briefcase, TrendingUp, Users, CheckCircle, CreditCard, Calendar, Download, FileText, ExternalLink } from '../components/Icons';

const API_BASE_URL = 'https://backend-3bat.onrender.com';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'sponsorships' | 'ideathon' | 'events'>('registrations');
  const [isLoading, setIsLoading] = useState(false);
  
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [sponsorships, setSponsorships] = useState<SponsorshipInquiry[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // We pull registrations for both 'registrations', 'ideathon', and 'events' tabs
      const endpoint = activeTab === 'sponsorships' ? '/api/admin/sponsorships' : '/api/admin/registrations';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (activeTab === 'sponsorships') {
        setSponsorships(data);
      } else {
        setRegistrations(data);
      }
    } catch (err) {
      console.error("Data load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setToken(data.token);
        setIsAuthenticated(true);
      } else {
        alert('Invalid Credentials');
      }
    } catch (err) {
      alert('Auth Server Down');
    }
  };

  const downloadCSV = () => {
    const dataToExport = activeTab === 'sponsorships' ? sponsorships : registrations;
    if (dataToExport.length === 0) return alert("No data to download");

    const headers = Object.keys(dataToExport[0]).join(",");
    const rows = dataToExport.map(item => 
      Object.values(item).map(val => `"${val}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logic to separate the registration list based on tab
  const getFilteredList = () => {
    let list = registrations;
    if (activeTab === 'ideathon') {
      list = registrations.filter(r => r.category?.toLowerCase().includes('ideathon'));
    } else if (activeTab === 'events') {
      list = registrations.filter(r => !r.category?.toLowerCase().includes('ideathon'));
    }

    return list.filter(r => 
      r.fullName.toLowerCase().includes(search.toLowerCase()) || 
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.organization.toLowerCase().includes(search.toLowerCase())
    );
  };

  const stats = {
    total: registrations.length,
    paid: registrations.filter(r => r.paymentStatus === 'PAID').length,
    revenue: registrations.filter(r => r.paymentStatus === 'PAID').reduce((a, b) => a + (b.totalAmount || 0), 0),
    ideathon: registrations.filter(r => r.category?.toLowerCase().includes('ideathon')).length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-purple-500" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-purple-500" required />
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl">Secure Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 pt-32">
      {/* Header & Download */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Command Center</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Firebase Real-time Matrix</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-lg"
        >
          <Download className="w-4 h-4" /> Download All {activeTab}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Reg', val: stats.total, icon: Users, col: 'text-white' },
          { label: 'Paid Pass', val: stats.paid, icon: CheckCircle, col: 'text-green-400' },
          { label: 'Revenue', val: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, col: 'text-purple-400' },
          { label: 'Ideathon', val: stats.ideathon, icon: Briefcase, col: 'text-pink-500' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
            <s.icon className={`w-5 h-5 ${s.col} mb-2`} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.col} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-wrap bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          {(['registrations', 'ideathon', 'events', 'sponsorships'] as const).map((t) => (
            <button 
              key={t}
              onClick={() => { setActiveTab(t); setSearch(''); }} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <input 
          type="text" 
          placeholder="Search identity..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl text-xs text-white outline-none w-full lg:w-64 focus:border-purple-500 transition-all" 
        />
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-500 font-black uppercase animate-pulse">Synchronizing Cloud Matrix...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                <tr>
                  <th className="p-6">Identity</th>
                  <th className="p-6">Organization</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Proof (PDF)</th>
                  <th className="p-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {getFilteredList().map((r: any) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="text-white font-black uppercase italic text-sm">{r.fullName}</div>
                      <div className="text-[10px] text-zinc-500 font-bold">{r.email}</div>
                    </td>
                    <td className="p-6 text-zinc-400 text-xs font-bold uppercase">{r.organization}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="p-6">
                      {r.pdfUrl || r.paymentProof ? (
                        <a 
                          href={r.pdfUrl || r.paymentProof} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-all text-[10px] font-black uppercase"
                        >
                          <FileText className="w-4 h-4" /> View Doc <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-700 text-[10px] font-black uppercase">No Document</span>
                      )}
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => setSelectedReg(r)} 
                        className="text-[10px] font-black text-zinc-500 uppercase hover:text-white transition-colors border border-zinc-800 px-4 py-2 rounded-xl group-hover:border-zinc-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Delegate File: {selectedReg.id.slice(0,8)}</h3>
              <button onClick={() => setSelectedReg(null)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Full Name</h4>
                  <p className="text-white font-bold">{selectedReg.fullName}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Category</h4>
                  <p className="text-white font-bold uppercase">{selectedReg.category || 'General'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Contact</h4>
                  <p className="text-zinc-400 text-sm font-mono">{selectedReg.phone}</p>
                  <p className="text-zinc-400 text-sm font-mono">{selectedReg.email}</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Payment Details</h4>
                  <p className="text-white text-xl font-black">₹{selectedReg.totalAmount}</p>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase">{selectedReg.paymentStatus}</p>
                </div>
              </div>
              
              {selectedReg.pdfUrl && (
                <div className="pt-4">
                   <a 
                    href={selectedReg.pdfUrl} 
                    target="_blank" 
                    className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Open Full PDF Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
