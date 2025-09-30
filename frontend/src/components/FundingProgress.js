import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/FundingProgress.css';

const FundingProgress = () => {
  const { propertyId } = useParams(); // Extract propertyId from the route
  const [propertyData, setPropertyData] = useState({
    fundingGoal: 1000000,
    totalFunded: 0,
    fundingProgress: 0,
    milestones: [
      { percentage: 25, amount: 250000 },
      { percentage: 50, amount: 500000 },
      { percentage: 75, amount: 750000 },
      { percentage: 100, amount: 1000000 },
    ],
    recentContributions: [
      { name: 'Investor 1', amount: 50000, date: '2025-01-01' },
      { name: 'Investor 2', amount: 100000, date: '2025-01-05' },
    ],
    projectedROI: 12,
    timeLeft: '30 days',
  });

  useEffect(() => {
    // Fetch the funding data from the backend using propertyId
    fetch(`/properties/${propertyId}/funding-progress`)
      .then(response => response.json())
      .then(data => setPropertyData(prevData => ({
        ...prevData,
        fundingGoal: data.funding_goal,
        totalFunded: data.funded_amount,
        fundingProgress: (data.funded_amount / data.funding_goal) * 100, // Calculate funding progress
        milestones: data.milestones, // Assuming this data structure is also coming from the backend
        recentContributions: data.recent_contributions, // Assuming this data is part of the response
        projectedROI: data.roi_percentage,
        timeLeft: data.time_left,
      })))
      .catch(error => console.error('Error fetching funding progress:', error));
  }, [propertyId]);

  const { fundingGoal, totalFunded, fundingProgress, milestones, recentContributions, projectedROI, timeLeft } = propertyData;

  return (
    <div className="funding-progress">
      <h2>Funding Progress</h2>
      <div className="funding-overview">
        <p>Funding Goal: ${fundingGoal}</p>
        <p>Funds Raised: ${totalFunded}</p>
        <p>Progress: {fundingProgress}%</p>
      </div>

      <div className="funding-bar">
        <div className="funding-bar-progress" style={{ width: `${fundingProgress}%` }}></div>
      </div>

      <div className="milestones">
        <h3>Investment Milestones</h3>
        <ul>
          {milestones.map((milestone, index) => (
            <li key={index}>
              {milestone.percentage}% - ${milestone.amount}
            </li>
          ))}
        </ul>
      </div>

      <div className="recent-contributions">
        <h3>Recent Contributions</h3>
        <ul>
          {recentContributions.map((contribution, index) => (
            <li key={index}>
              {contribution.name} - ${contribution.amount} on {contribution.date}
            </li>
          ))}
        </ul>
      </div>

      <div className="projected-roi">
        <h3>Projected ROI</h3>
        <p>{projectedROI}%</p>
      </div>

      <div className="time-left">
        <h3>Time Left to Fund</h3>
        <p>{timeLeft}</p>
      </div>
    </div>
  );
};

export default FundingProgress;
