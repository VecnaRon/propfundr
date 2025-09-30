import React from "react";
import "../styles/ProjectDetailsModal.css";


const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{project.name || "Untitled Project"}</h2>
        
        <h3>Project Overview</h3>
        <p><strong>Status:</strong> {project.status || "Unknown"}</p>
        <p><strong>Funding Progress:</strong> ${project.fundingRaised?.toLocaleString()} / ${project.fundingGoal?.toLocaleString()} ({project.fundingProgress || 0}%)</p>
        <p><strong>Project Timeline:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"} – {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Total Investment:</strong> ${project.totalInvestment?.toLocaleString() || "0.00"}</p>
        <div className="progress-bar"><div className="progress" style={{ width: `${project.fundingProgress || 0}%` }}></div></div>

        <h3>Milestones & Updates</h3>
        <ul>
          {project.milestones?.length > 0 ? (
            project.milestones.map((milestone, index) => (
              <li key={index}><strong>{milestone.title}</strong> - {milestone.description} ({milestone.status}) {milestone.dateAchieved ? `Completed on: ${new Date(milestone.dateAchieved).toLocaleDateString()}` : ""}</li>
            ))
          ) : (
            <li>No milestones available.</li>
          )}
        </ul>
        <p><strong>Recent Updates:</strong> {project.recentUpdates || "No updates available."}</p>

        <h3>Financial Reports & Transactions</h3>
        <ul>
          {project.investmentBreakdown?.length > 0 ? (
            project.investmentBreakdown.map((investor, index) => (
              <li key={index}>{investor.name}: ${investor.amount?.toLocaleString()}</li>
            ))
          ) : (
            <li>No investment breakdown available.</li>
          )}
        </ul>
        <p><strong>Withdrawals/Payouts:</strong> {project.payouts || "No payout records."}</p>

        <h3>Document Management</h3>
        <ul>
          {project.documents?.length > 0 ? (
            project.documents.map((doc, index) => (
              <li key={index}><a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a></li>
            ))
          ) : (
            <li>No documents available.</li>
          )}
        </ul>

        <h3>Actions for Owners</h3>
        <button onClick={() => alert("Updating Project Progress...")}>Update Project Progress</button>
        <button onClick={() => alert("Uploading New Milestone Update...")}>Upload New Milestone</button>
        <button onClick={() => alert("Adding New Document...")}>Add New Document</button>
        <button onClick={() => alert("Posting an Update...")}>Post an Update</button>

        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
