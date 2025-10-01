import React, { useEffect, useState } from "react";
import "../styles/RevenueTracking.css";
import { FaDollarSign, FaChartLine, FaMoneyCheckAlt } from "react-icons/fa";

const RevenueTracking = () => {
  const [revenueData, setRevenueData] = useState({
    totalDividends: 0,
    totalReturns: 0,
    totalFees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
       const token = sessionStorage.getItem("token");
        const response = await fetch("/revenue-tracking", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch revenue data");

        const data = await response.json();
        setRevenueData({
          totalDividends: data.totalDividends || 0,
          totalReturns: data.totalReturns || 0,
          totalFees: data.totalFees || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) return <div className="revenue-loading">Loading revenue data...</div>;
  if (error) return <div className="revenue-error">Error: {error}</div>;

  return (
    <div className="revenue-tracking-container">
      <h2 className="revenue-title">Total Revenue Overview</h2>
      <div className="revenue-grid">
        {[  
          { title: "Total Dividends Earned", value: revenueData.totalDividends, icon: <FaDollarSign className="icon" /> },
          { title: "Total Investment Returns", value: revenueData.totalReturns, icon: <FaChartLine className="icon" /> },
          { title: "Total Platform Fees", value: revenueData.totalFees, icon: <FaMoneyCheckAlt className="icon" /> },
        ].map((item, index) => (
          <div key={index} className="revenue-card">
            {item.icon}
            <h3>{item.title}</h3>
            <p>${item.value.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueTracking;
