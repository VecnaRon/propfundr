import React, { useState, useEffect } from 'react';
import '../styles/FinancialReports.css'; // Add your CSS for this page

const FinancialReports = () => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch financial report data from the backend API
    fetch('http://192.168.100.30:5000/owner/financial-reports') // Replace with your actual backend URL
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch financial reports');
        }
        return response.json();
      })
      .then(data => {
        setFinancialData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading financial reports...</div>; // Show loading state
  }

  if (error) {
    return <div className="error">{error}</div>; // Show error state
  }

  // Check for missing data fields
  if (!financialData || !financialData.transactions) {
    return <div className="error">No financial data available.</div>;
  }

  return (
    <div className="financial-reports">
      <h2>Financial Reports</h2>

      {/* Summary Overview Section */}
      <div className="summary-overview">
        <h3>Summary Overview</h3>
        <p>Total Revenue: ${financialData.totalRevenue ? financialData.totalRevenue.toLocaleString() : 'N/A'}</p>
        <p>Total Expenses: ${financialData.totalExpenses ? financialData.totalExpenses.toLocaleString() : 'N/A'}</p>
        <p>Net Profit: ${financialData.netProfit ? financialData.netProfit.toLocaleString() : 'N/A'}</p>
        <p>Return on Investment (ROI): {financialData.roi || 'N/A'}%</p>
      </div>

      {/* Detailed Report Section */}
      <div className="detailed-report">
        <h3>Detailed Financial Report</h3>
        {financialData.transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {financialData.transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.amount.toLocaleString()}</td>
                  <td>{transaction.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
