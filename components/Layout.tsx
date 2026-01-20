import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Menu, X, Linkedin, Twitter, Instagram, Facebook, ChevronDown } from './Icons';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

// Mobile Dropdown Menu Item Component
const MobileDropdownItem: React.FC<{ 
  item: any; 
  onNavClick: (path: string) => void;
  onClose: () => void;
}> = ({ item, onNavClick, onClose }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-purple-500 transition-all rounded-lg"
      >
        <span>{item.name}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {expanded && (
        <div className="bg-white/5 border border-white/10 rounded-lg m-2 overflow-hidden">
          <div className="py-2 px-2">
            {item.dropdown.map((subItem: any) => (
              <Link
                key={subItem.name}
                to={subItem.path}
                onClick={() => {
                  onNavClick(subItem.path);
                  onClose();
                }}
                className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-purple-500 transition-all rounded-lg"
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('ascent_matrix_popup_seen');
    if (!hasSeenPopup && location.pathname === '/') {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('ascent_matrix_popup_seen', 'true');
  };

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPopup]);

  const handleRegisterClick = () => {
    closePopup();
    navigate('/register');
  };

  const navItems = [
    { name: 'Home', path: '/', dropdown: [] },
    { 
      name: 'Explore Matrix', 
      path: '#',
      dropdown: [
        { name: 'Welcome (Hero)', path: '/#hero' },
        { name: 'What is Ascent?', path: '/#about' },
        { name: 'The Pillars', path: '/#pillars' },
        { name: 'Outcomes', path: '/#outcomes' },
        { name: 'Summit Inauguration', path: '/#summit' },
        { name: 'The People (Portfolio)', path: '/#portfolio' },
        { name: 'Leadership Matrix', path: '/#committees' },
        { name: 'Global Partners', path: '/#partners' },
        { name: 'Join The Matrix (CTA)', path: '/#cta' }
      ]
    },
    { 
      name: 'About', 
      path: '#',
      dropdown: [
        { name: 'Venue Details', path: '/venue' },
        { name: 'Upcoming Events', path: '/upcoming' }
      ]
    },
    { name: 'Registration', path: '/register', dropdown: [] },
    { name: 'Sponsorship', path: '/sponsorship', dropdown: [] }
  ];

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    if (path.startsWith('/#')) {
      const elementId = path.substring(2);
      if (location.pathname === '/') {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar with Transparent Blur */}
      <nav className="fixed w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 h-20 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group">
                <img 
                    src="https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png" 
                    alt="Logo" 
                    className="h-10 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown.length > 0 ? (
                    <button className="flex items-center gap-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">
                      {item.name}
                      <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <Link to={item.path} className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  )}
                  {item.dropdown.length > 0 && (
                    <div className="absolute left-0 top-full w-64 bg-black/90 border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden backdrop-blur-2xl">
                      <div className="py-3 px-1">
                        {item.dropdown.map((subItem: any) => (
                          <Link key={subItem.name} to={subItem.path} onClick={() => handleNavClick(subItem.path)} className="block px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-purple-500 transition-all rounded-lg mx-2 mb-1">
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center">
  <Link
    to="/register"
    className="bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white px-8 py-3 rounded-xl font-black text-[10px] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] uppercase tracking-widest"
  >
    Register for Prelude
  </Link>
</div>

            <div className="-mr-2 flex lg:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="bg-white/10 inline-flex items-center justify-center p-2.5 rounded-xl text-white border border-white/10">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-black/95 via-black/90 to-black/95 pt-24 px-4">
            <div className="max-w-md mx-auto space-y-2">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.dropdown.length > 0 ? (
                    <MobileDropdownItem 
                      item={item} 
                      onNavClick={handleNavClick}
                      onClose={() => setIsOpen(false)}
                    />
                  ) : (
                    <Link 
                      to={item.path} 
                      onClick={() => {
                        handleNavClick(item.path);
                        setIsOpen(false);
                      }}
                      className="block px-6 py-4 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-purple-500 transition-all rounded-lg"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile CTA Button */}
              <div className="pt-6 pb-4">
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white px-6 py-4 rounded-xl font-black text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] uppercase tracking-widest"
                >
                  Register for Prelude
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Poster Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark blurred backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md" 
            onClick={closePopup}
          />
          
          {/* Modal Container */}
          <div className="relative z-50 w-full max-w-md bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Image */}
            <div className="w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 aspect-square sm:aspect-auto sm:h-96 flex items-center justify-center overflow-hidden">
              <img
                src="https://via.placeholder.com/500x600?text=Ascent+Matrix+Prelude+Registration"
                alt="Registration Poster"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-widest text-white">
                  Ascent Matrix Prelude
                </h3>
                <p className="text-sm text-zinc-400 uppercase tracking-wider">
                  Join the definitive quarterly engine for Indian Deep-Tech
                </p>
              </div>

              {/* Register Now Button */}
              <button
                onClick={handleRegisterClick}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white px-6 py-4 rounded-xl font-black text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] uppercase tracking-widest"
              >
                Register Now
              </button>

              {/* Dismiss text */}
              <p className="text-center text-xs text-zinc-500 uppercase tracking-wider">
                Click the X button or outside to dismiss
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer styled exactly as per reference image */}
      <footer className="bg-black border-t border-white/5 pt-20 pb-8 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            {/* Brand Section */}
            <div className="md:col-span-5 space-y-8">
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">ASCENT MATRIX</h3>
               <p className="text-zinc-400 text-[11px] leading-relaxed uppercase tracking-[0.15em] font-black max-w-sm">
                 The definitive quarterly engine for Indian Deep-Tech. Orchestrating policy, capital, and innovation at scale.
               </p>
               <div className="flex space-x-6 pt-2">
                 <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                 <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                 <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                 <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
               </div>
            </div>
            
            {/* Links Columns */}
            <div className="md:col-span-4 lg:col-span-3">
              <h4 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[11px] flex items-center">
                <span className="w-1 h-4 bg-purple-500 mr-3"></span>
                Ecosystem Portal
              </h4>
              <ul className="space-y-5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <li><Link to="/venue" className="hover:text-white transition-colors">The Venue Experience</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Delegate Registration</Link></li>
                <li><Link to="/sponsorship" className="hover:text-white transition-colors">Partnership Inquiry</Link></li>
                <li><Link to="/volunteer" className="hover:text-white transition-colors">Volunteer Management</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 lg:col-span-4">
              <h4 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[11px] flex items-center">
                <span className="w-1 h-4 bg-pink-500 mr-3"></span>
                Governance
              </h4>
              <ul className="space-y-5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Protocols</Link></li>
                <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms of Delegate Engagement</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright + Developers (Left) | Initiatives (Right) */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.25em]">
                  &copy; 2026 ASCENT MATRIX. DEVELOPED INDIA INITIATIVE.
                </p>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] flex flex-wrap gap-2">
                  <span className="text-zinc-600">DEVELOPERS:</span>
                  <a href="https://www.vinidrasoftech.com" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 transition-colors">VINIDRA SOFTECH</a>
                  <span className="text-zinc-700">X</span>
                  <a href="https://www.madhwainfotech.in" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors">MADHWA INFOTECH</a>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2">
               <span className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">VIKSIT BHARAT 2047</span>
               <span className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">AATMANIRBHAR BHARAT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
