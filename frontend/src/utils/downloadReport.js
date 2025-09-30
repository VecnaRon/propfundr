import { jsPDF } from "jspdf";

export const downloadProjectReport = (project) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Project Report", 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`Project Name: ${project.name}`, 20, 40);
  doc.text(`Status: ${project.status}`, 20, 50);
  doc.text(`Funding Progress: ${project.fundingProgress}%`, 20, 60);
  doc.text(`Start Date: ${new Date(project.startDate).toLocaleDateString()}`, 20, 70);
  doc.text(`End Date: ${new Date(project.endDate).toLocaleDateString()}`, 20, 80);
  doc.text(`Total Investment: $${project.totalInvestment.toLocaleString()}`, 20, 90);

  doc.text("Project Updates:", 20, 110);
  if (project.milestones && project.milestones.length > 0) {
    project.milestones.forEach((milestone, index) => {
      doc.text(`- ${milestone}`, 20, 120 + index * 10);
    });
  } else {
    doc.text("No milestones available.", 20, 120);
  }

  doc.save(`${project.name.replace(/\s+/g, "_")}_Report.pdf`);
};
