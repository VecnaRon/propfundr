import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EditProjectModal.css";

const EditProjectModal = ({ project, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "Ongoing",
    fundingGoal: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load project data when modal opens
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        status: project.status || "Ongoing",
        fundingGoal: project.fundingGoal || "",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : "",
      });
    }
  }, [project]); // Re-run only when project changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    if (!project?.id) {
      setError("Invalid project data. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
    const token = sessionStorage.getItem("token");

      // Send updated project data to backend
      const { data: updatedProject } = await axios.put(
        `/projects/${project.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Project updated successfully!");

      // Update the parent component with the updated project
      onUpdate(updatedProject.project); // 'updatedProject.project' should be returned by backend
      onClose(); // Close modal after success

    } catch (error) {
      console.error("Error updating project:", error);
      if (error.response?.status === 404) {
        setError("Project not found. It may have been deleted.");
      } else if (error.response?.status === 400) {
        setError("Failed to update project. No changes detected or invalid data.");
      } else {
        setError("Failed to update project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Edit Project</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Project Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Fundraising">Fundraising</option>
          </select>

          <label>Funding Goal ($):</label>
          <input
            type="number"
            name="fundingGoal"
            value={formData.fundingGoal}
            onChange={handleChange}
            required
          />

          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;

