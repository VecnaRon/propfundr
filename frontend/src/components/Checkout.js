import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const Checkout = () => {
  const [amount, setAmount] = useState("10.00"); // Default amount
  const [{ isPending }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false); // Loading state for API calls

  const createOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.100.30:5000/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "USD" }),
      });

      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();
      setLoading(false);
      return data.id; // Return PayPal order ID
    } catch (error) {
      console.error("❌ Error creating order:", error);
      alert("Failed to create order. Please try again.");
      setLoading(false);
      return null;
    }
  };

  const captureOrder = async (orderID) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID }),
      });

      if (!res.ok) throw new Error("Failed to capture order");
      const data = await res.json();
      console.log("✅ Order captured:", data);
      alert("Payment successful!");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error capturing order:", error);
      alert("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        disabled={loading} // Disable input when processing payment
      />
      {isPending && <p>Loading PayPal...</p>}
      {loading && <p>Processing payment...</p>}

      <PayPalButtons
        createOrder={createOrder}
        onApprove={(data) => captureOrder(data.orderID)}
        disabled={loading} // Disable buttons while processing
      />
    </div>
  );
};

export default Checkout;
