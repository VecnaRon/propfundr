import React, { useState, useEffect } from 'react';
import '../styles/ProjectProgressUpdates.css';

const ProjectProgressUpdates = () => {
  const [milestones, setMilestones] = useState([]);
  const [funding, setFunding] = useState({ goal: 0, raised: 0 });
  const [error, setError] = useState(null);
  
  // Simulating getting the project ID of the logged-in user (replace with real method to get logged-in user’s project ID)
  const loggedInUserProjectId = sessionStorage.getItem('projectId'); // You can replace this with actual logic

  const progress = (funding.raised / funding.goal) * 100;

  useEffect(() => {
    const fetchProjectProgress = async () => {
      try {
        if (!loggedInUserProjectId) {
          setError('No project assigned to this user.');
          return;
        }

        const response = await fetch(`/project-progress?projectId=${loggedInUserProjectId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch project progress');
        }

        const data = await response.json();
        setMilestones(data.milestones);
        setFunding(data.funding);
      } catch (error) {
        console.error('Error fetching project progress:', error);
        setError('Failed to fetch project progress data');
      }
    };

    fetchProjectProgress();
  }, [loggedInUserProjectId]);

  return (
    <div className="project-progress-updates">
      <header className="header">
        <h1>Project Progress & Updates</h1>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="funding-progress">
        <h2>Funding Progress</h2>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{progress.toFixed(2)}%</span>
          </div>
        </div>
        <div className="funding-summary">
          <p>Goal: ${funding.goal.toLocaleString()}</p>
          <p>Raised: ${funding.raised.toLocaleString()}</p>
        </div>
      </section>

      <section className="milestones">
        <h2>Project Milestones</h2>
        <ul className="milestone-list">
          {milestones.length === 0 ? (
            <p>No milestones found for this project.</p>
          ) : (
            milestones.map((milestone, index) => (
              <li key={index} className={`milestone-item ${milestone.status.toLowerCase()}`}>
                <div className="milestone-details">
                  <h3>{milestone.name}</h3>
                  <p>{milestone.date}</p>
                </div>
                <div className="milestone-status">{milestone.status}</div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default ProjectProgressUpdates;
