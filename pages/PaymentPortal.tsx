import React, { useState, useEffect } from "react";
import * as ReactRouterDOM from "react-router-dom";
import { getRegistrationById } from "../services/storage";
import { CreditCard, Award } from "../components/Icons";
import { RegistrationData } from "../types";

const { useLocation, useNavigate } = ReactRouterDOM as any;

// Load Razorpay script
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

// ===============================
// API BASE URL (NO FALLBACK)
// ===============================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationId = location.state?.registrationId;

  const [registration, setRegistration] =
    useState<RegistrationData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!registrationId) {
      navigate("/register");
      return;
    }
    loadRegistration();
  }, [registrationId]);

  const loadRegistration = async () => {
    try {
      const data = await getRegistrationById(registrationId);
      if (!data) {
        navigate("/register");
        return;
      }
      setRegistration(data);
    } catch {
      navigate("/register");
    }
  };

  const handlePayNow = async () => {
    if (!registration || isInitializing) return;
    setIsInitializing(true);

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert("Failed to load Razorpay");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(registration.totalAmount),
            registrationId: registration.id
          })
        }
      );

      if (!response.ok) {
        throw new Error("Order creation failed");
      }

      const orderData = await response.json();

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ascent Matrix 2026",
        description: "Official Delegate Pass",
        order_id: orderData.id,

        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(
              `${API_BASE_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  registrationId: registration.id
                })
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Verification failed");
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              navigate("/confirm", {
                state: { registrationId: registration.id }
              });
            } else {
              throw new Error("Invalid signature");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed");
            navigate("/fail", {
              state: { registrationId: registration.id }
            });
          }
        },

        prefill: {
          name: registration.fullName,
          email: registration.email,
          contact: registration.phone
        },

        theme: { color: "#7c3aed" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initialization failed");
    } finally {
      setIsInitializing(false);
    }
  };

  if (!registration) return null;

  return (
    <button onClick={handlePayNow} disabled={isInitializing}>
      Pay Now
    </button>
  );
};

export default PaymentPortal;
