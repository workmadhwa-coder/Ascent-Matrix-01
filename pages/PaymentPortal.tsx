import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getRegistrationById } from '../services/storage';
import { CreditCard, Award } from '../components/Icons';
import { RegistrationData } from '../types';

const { useLocation, useNavigate } = ReactRouterDOM as any;

const loadRazorpay = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Accessing environment variables
const getBaseUrl = () => {
  const env = (import.meta as any).env;
  // This fix prevents the double-slash error (e.g., .com//api)
  const rawUrl = env?.VITE_API_BASE_URL || 'https://backend-3bat.onrender.com';
  return rawUrl.replace(/\/$/, ''); 
};

const API_BASE_URL = getBaseUrl();

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationId = location.state?.registrationId;

  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!registrationId) {
      navigate('/register');
      return;
    }
    loadRegistration();
  }, [registrationId]);

  const loadRegistration = async () => {
    try {
      const data = await getRegistrationById(registrationId);
      if (!data) {
        navigate('/register');
        return;
      }
      setRegistration(data);
    } catch (error) {
      console.error("Failed to load registration:", error);
      navigate('/register');
    }
  };

  const handlePayNow = async () => {
    if (!registration || isInitializing) return;
    setIsInitializing(true);

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert("Failed to load Razorpay. Please try again.");
        return;
      }

      // Step 1: Create Order on Backend
      const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(registration.totalAmount),
          registrationId: registration.id
        })
      });

      const orderData = await response.json();

      if (!orderData.id) {
        throw new Error("Failed to create Razorpay order");
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ascent Matrix 2026",
        description: "Official Delegate Pass",
        order_id: orderData.id,
        handler: async function (rzpResponse: any) {
          try {
            // Step 2: Verify payment with backend
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                registrationId: registration.id
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status === 'success') {
              navigate('/confirm', { 
                state: { 
                  registrationId: registration.id, 
                  razorpayResponse: rzpResponse 
                } 
              });
            } else {
              console.error('Payment verification failed:', verifyData);
              navigate('/fail', { 
                state: { 
                  registrationId: registration.id, 
                  orderId: orderData.id 
                } 
              });
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            navigate('/fail', { 
              state: { 
                registrationId: registration.id, 
                orderId: orderData.id 
              } 
            });
          }
        },
        prefill: {
          name: registration.fullName,
          email: registration.email,
          contact: registration.phone
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: function() {
            setIsInitializing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(`Connection failed. Make sure backend is running at ${API_BASE_URL}`);
    } finally {
      setIsInitializing(false);
    }
  };

  if (!registration) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
        
        {/* Loading Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black uppercase tracking-widest text-[10px]">
              Preparing Secure Gateway...
            </p>
          </div>
        )}

        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>

        <div className="p-12">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
              Confirm Pass
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
              Official Gateway Integration
            </p>
          </header>
          
          {/* Amount Card */}
          <div className="bg-black/40 p-8 rounded-3xl border border-white/5 mb-10 space-y-4">
             <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  Delegate Registration
                </span>
                <span className="text-white font-bold text-sm">
                  {registration.fullName}
                </span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  Payable Amount
                </span>
                <span className="text-3xl font-black text-white italic tracking-tighter">
                  ₹{registration.totalAmount.toLocaleString()}
                </span>
             </div>
          </div>

          {/* Security Badge */}
          <div className="mb-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                <Award className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed">
               Secure SSL Encrypted Payment. Your data is protected by industry-standard encryption.
             </p>
          </div>

          {/* Action Button */}
          <button 
            onClick={handlePayNow}
            disabled={isInitializing}
            className="w-full py-5 rounded-3xl font-black text-lg bg-white text-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-6 h-6" />
            Pay Now with Razorpay
          </button>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-[8px] uppercase tracking-[0.2em] font-bold">
              Powered by Razorpay Secure • Ascent Matrix 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
