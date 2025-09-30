import React, { useState } from "react";
import Modal from "./Modal";

const ProjectCard = ({ project }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const openModal = (title) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className="project-card">
      <h3>{project.name}</h3>

      {/* Hover Dropdown */}
      <div className="hover-dropdown">
        <ul>
          <li onClick={() => openModal("Project Details")}>View Details</li>
          <li onClick={() => openModal("Edit Project")}>Edit Project</li>
          <li onClick={() => openModal("Delete Project")}>Delete Project</li>
        </ul>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <p>This is the content for "{modalTitle}". Customize as needed.</p>
      </Modal>
    </div>
  );
};

export default ProjectCard;
