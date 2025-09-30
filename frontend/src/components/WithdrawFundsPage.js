import { useState, useEffect } from "react";
import "../styles/WithdrawFundsPage.css";
import { useNavigate } from "react-router-dom";

const WithdrawalPage = () => {
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState(""); // Store PayPal email
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
    const navigate = useNavigate();

  // Fetch withdrawable balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch("http://192.168.100.30:5000/api/wallet/withdrawable-balance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok) {
          setWithdrawableBalance(Number(data.withdrawable_balance) || 0);
        } else {
          setMessage(data.message || "Error fetching balance");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setMessage("Failed to load balance.");
      }
    };

    fetchBalance();
  }, []);

  // Handle Withdrawal Submission
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    if (parseFloat(withdrawAmount) > withdrawableBalance) {
      setMessage("Insufficient withdrawable balance.");
      return;
    }
    if (!paypalEmail) {
      setMessage("Please enter your PayPal email.");
      return;
    }

    setLoading(true);
    try {
     const token = sessionStorage.getItem("token");
      const response = await fetch("http://192.168.100.30:5000/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          paypalEmail, // Only send PayPal email
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Withdrawal request submitted successfully!");
        setWithdrawAmount("");
        setWithdrawableBalance((prev) => prev - parseFloat(withdrawAmount));
        navigate("/wallet");
      } else {
        setMessage(data.message || "Withdrawal failed.");
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setMessage("Server error. Try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="withdrawal-container">
      <h2>Withdraw Funds</h2>
      <p>Withdrawable Balance: <strong>${withdrawableBalance.toFixed(2)}</strong></p>

      <div>
        <label>Amount to Withdraw:</label>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label>PayPal Email:</label>
        <input
          type="email"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          placeholder="Enter your PayPal email"
        />
      </div>

      <button onClick={handleWithdraw} disabled={loading}>
        {loading ? "Processing..." : "Withdraw"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default WithdrawalPage;
