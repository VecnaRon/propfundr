import React, { useEffect, useState } from 'react';

const ProjectComparison = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjectComparison = async () => {
      try {
        const response = await fetch('http://192.168.100.30:5000/api/project-comparison');
        const data = await response.json();
        
        console.log('API Response:', data); // Debugging
        setProjects(data.projects || []); // ✅ Ensure projects is an array
      } catch (error) {
        console.error('Error fetching project comparison:', error);
      }
    };

    fetchProjectComparison();
  }, []);

  return (
    <div className="project-comparison">
      <h2>Project Comparison</h2>
      {projects.length === 0 ? (
        <p>No projects available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Funding Raised</th>
              <th>Progress (%)</th>
              <th>Financial Returns</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>${project.fundingRaised?.toFixed(2) || '0.00'}</td>
                <td>{project.progress || 0}%</td>
                <td>${project.financialReturns?.toFixed(2) || '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProjectComparison;
