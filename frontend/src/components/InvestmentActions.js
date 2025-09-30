import React, { useState, useEffect } from 'react';
import '../styles/InvestmentActions.css';

const InvestmentActions = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [error, setError] = useState(null);

  // Fetch wallet balance and transaction history
  const fetchInvestmentData = async () => {
    const token = sessionStorage.getItem("token"); 

    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }

    try {
      const walletResponse = await fetch('http://192.168.100.30:5000/api/wallet-balance', {
        headers: {
          Authorization: `Bearer ${token}` // Corrected the template literal
        }
      });

      const transactionsResponse = await fetch('http://192.168.100.30:5000/api/transaction-history', {
        headers: {
          Authorization: `Bearer ${token}` // Corrected the template literal
        }
      });

      if (walletResponse.ok && transactionsResponse.ok) {
        const walletData = await walletResponse.json();
        const transactionsData = await transactionsResponse.json();
        setWalletBalance(walletData.balance);
        setTransactionHistory(transactionsData);
      } else {
        setError('Failed to fetch investment data');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch investment data');
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const handleInvestment = async () => {
    const amount = parseFloat(investmentAmount);
  const token = sessionStorage.getItem("token");

    if (!token) {
      alert('Please log in to make an investment.');
      return;
    }

    if (amount > 0 && amount <= walletBalance) {
      try {
        const response = await fetch('http://192.168.100.30:5000/api/invest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Corrected the template literal
          },
          body: JSON.stringify({ amount, property: 'New Property' })
        });

        if (response.ok) {
          alert('Investment successful!');
          fetchInvestmentData(); // Refresh wallet and transaction history
        } else {
          alert('Investment failed. Please try again.');
        }
      } catch (err) {
        console.error(err);
        alert('Error processing investment.');
      }
    } else {
      alert('Invalid amount or insufficient balance.');
    }
    setInvestmentAmount('');
  };

  return (
    <div className="investment-actions">
      <h2>Investment Actions</h2>
      <div className="wallet-balance">
        <strong>Wallet Balance:</strong> ${walletBalance.toFixed(2)}
      </div>
      <div className="investment-form">
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          placeholder="Enter investment amount"
        />
        <button onClick={handleInvestment}>Invest Now</button>
      </div>
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <ul>
          {transactionHistory.length > 0 ? (
            transactionHistory.map((transaction) => (
              <li key={transaction.id}>
                {transaction.date} - {transaction.type} - ${transaction.amount.toFixed(2)}{' '}
                {transaction.property && `for ${transaction.property}`} {/* Corrected rendering of property */}
              </li>
            ))
          ) : (
            <li>No transactions available.</li>
          )}
        </ul>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default InvestmentActions;
