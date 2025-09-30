import React, { useState, useEffect } from 'react';
import '../styles/InvestmentHistory.css';

const InvestmentHistory = () => {
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [earningsOverview, setEarningsOverview] = useState({
    totalInvested: 0,
    totalEarnings: 0,
    projectedROI: 0,
  });
  const [loading, setLoading] = useState(true);  // Add a loading state
  const [error, setError] = useState(null);  // Add an error state

  useEffect(() => {
    fetch('http://192.168.100.30:5000/owner/investment-history')  // Correct URL to your backend
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setInvestmentHistory(data.investments);
        setEarningsOverview(data.earningsOverview);
      })
      .catch(error => {
        console.error('Error fetching investment history:', error);
        // Optionally, you can update the state to display an error message in the UI
        alert('Failed to fetch investment history. Please try again later.');
      });
  }, []);
  
  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

  return (
    <div className="investment-history">
      <h2>Investment History</h2>

      {/* Earnings Overview Section */}
      <div className="earnings-overview">
        <h3>Earnings Overview</h3>
        <p>Total Invested: ${earningsOverview.totalInvested}</p>
        <p>Total Earnings: ${earningsOverview.totalEarnings}</p>
        <p>Projected ROI: {earningsOverview.projectedROI}%</p>
      </div>

      {/* Investment History Section */}
      <div className="investment-details">
        <h3>Past Investments</h3>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Amount Invested</th>
              <th>Investment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investmentHistory.length > 0 ? (
              investmentHistory.map((investment, index) => (
                <tr key={index}>
                  <td>{investment.property_title}</td>
                  <td>${investment.amount_invested}</td>
                  <td>{investment.investment_date}</td>
                  <td>{investment.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No investments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction History Section */}
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>Transaction Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {/* Render transaction history here */}
            {investmentHistory.length > 0 ? (
              investmentHistory.map((investment, index) => (
                investment.transactions.map((transaction, tIndex) => (
                  <tr key={tIndex}>
                    <td>{transaction.type}</td>
                    <td>${transaction.amount}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.transaction_id}</td>
                  </tr>
                ))
              ))
            ) : (
              <tr>
                <td colSpan="4">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvestmentHistory;
