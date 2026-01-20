import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, X, Briefcase, TrendingUp, Users, CheckCircle, 
  Download, FileText, ExternalLink, Search, Database, ShieldCheck 
} from 'lucide-react';
import { RegistrationData, SponsorshipInquiry } from '../types';

const API_BASE_URL = 'http://localhost:3000';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'ideathon' | 'events' | 'sponsorships'>('registrations');
  const [isLoading, setIsLoading] = useState(false);
  
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [sponsorships, setSponsorships] = useState<SponsorshipInquiry[]>([]);
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'sponsorships' ? '/api/admin/sponsorships' : '/api/admin/registrations';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (activeTab === 'sponsorships') {
        setSponsorships(Array.isArray(data) ? data : []);
      } else {
        setRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Data pull failed:", err);
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
      Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `ascent_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredList = useMemo(() => {
    let list = registrations;
    if (activeTab === 'ideathon') {
      list = registrations.filter(r => r.ticketType?.toLowerCase().includes('ideathon'));
    } else if (activeTab === 'events') {
      list = registrations.filter(r => !r.ticketType?.toLowerCase().includes('ideathon'));
    } else if (activeTab === 'sponsorships') {
      return sponsorships.filter(s => s.companyName.toLowerCase().includes(search.toLowerCase()));
    }

    return list.filter(r => 
      r.fullName?.toLowerCase().includes(search.toLowerCase()) || 
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.organization?.toLowerCase().includes(search.toLowerCase())
    );
  }, [registrations, sponsorships, activeTab, search]);

  const stats = {
    total: registrations.length,
    paid: registrations.filter(r => r.paymentStatus === 'PAID').length,
    revenue: registrations.filter(r => r.paymentStatus === 'PAID').reduce((a, b) => a + (b.totalAmount || 0), 0),
    ideathon: registrations.filter(r => r.ticketType?.toLowerCase().includes('ideathon')).length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl text-center">
          <ShieldCheck className="w-12 h-12 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8">Admin Control</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none" required />
            <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 pt-24">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            <Database className="text-purple-500" /> Control Matrix
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 ml-1">Secure Firebase Data Stream</p>
        </div>
        <button onClick={downloadCSV} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all">
          <Download className="w-4 h-4" /> Export All Data
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Reg', val: stats.total, icon: Users, col: 'text-white' },
          { label: 'Paid Pass', val: stats.paid, icon: CheckCircle, col: 'text-green-400' },
          { label: 'Revenue', val: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, col: 'text-purple-400' },
          { label: 'Ideathon', val: stats.ideathon, icon: Briefcase, col: 'text-pink-500' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-white/5 p-6 rounded-3xl">
            <s.icon className={`w-5 h-5 ${s.col} mb-3`} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.col} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          {['registrations', 'ideathon', 'events', 'sponsorships'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input type="text" placeholder="Search Matrix..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 pl-12 pr-4 py-3 rounded-xl text-xs text-white outline-none focus:border-purple-500" />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-500 font-black uppercase animate-pulse">Syncing with DB...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                <tr>
                  <th className="p-6">Delegate / ID</th>
                  <th className="p-6">Organization</th>
                  <th className="p-6">Type</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Cloudinary Proof</th>
                  <th className="p-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredList.map((r: any) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="text-white font-black uppercase italic text-sm">{r.fullName || r.companyName}</div>
                      <div className="text-[10px] text-zinc-500 font-bold">{r.id}</div>
                    </td>
                    <td className="p-6 text-zinc-400 text-xs font-bold uppercase">{r.organization || r.tier}</td>
                    <td className="p-6 text-zinc-500 text-[10px] font-black uppercase">{r.ticketType || "General"}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {r.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-6">
                      {r.pdfUrl ? (
                        <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-white transition-all text-[10px] font-black uppercase">
                          <FileText className="w-4 h-4" /> View PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-zinc-800 text-[10px] font-black uppercase italic">No Link Found</span>}
                    </td>
                    <td className="p-6">
                      <button onClick={() => setSelectedReg(r)} className="text-[10px] font-black text-zinc-500 uppercase border border-zinc-800 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all">Inspect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Full Data File</h3>
              <button onClick={() => setSelectedReg(null)} className="p-2 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 grid grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Full Name</p><p className="text-white font-bold">{selectedReg.fullName}</p></div>
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Email</p><p className="text-white font-bold">{selectedReg.email}</p></div>
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Phone</p><p className="text-white font-bold">{selectedReg.phone}</p></div>
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Organization</p><p className="text-white font-bold">{selectedReg.organization}</p></div>
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Location</p><p className="text-white font-bold">{selectedReg.city}, {selectedReg.state}</p></div>
              <div><p className="text-[10px] text-purple-500 font-black uppercase mb-1">Ticket Type</p><p className="text-white font-bold">{selectedReg.ticketType}</p></div>
              <div className="col-span-2 bg-zinc-900 p-6 rounded-2xl">
                <p className="text-[10px] text-green-500 font-black uppercase mb-2">Ideathon Problem Statement</p>
                <p className="text-zinc-400 text-sm italic">{selectedReg.problemStatement || "Not provided"}</p>
                <p className="text-[10px] text-green-500 font-black uppercase mt-4 mb-2">Proposed Solution</p>
                <p className="text-zinc-400 text-sm italic">{selectedReg.solution || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
