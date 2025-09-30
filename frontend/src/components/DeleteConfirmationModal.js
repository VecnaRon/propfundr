import React from "react";
import "../styles/DeleteConfirmationModal.css"; // Ensure you style the modal

const DeleteConfirmationModal = ({ onConfirm, onCancel, selectedUsers }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {selectedUsers.length} selected user(s)?</p>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Yes, Delete</button>
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
