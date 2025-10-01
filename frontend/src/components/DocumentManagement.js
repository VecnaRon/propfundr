import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/DocumentManagement.css";

const DocumentManagement = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://192.168.100.22:5000/api/documents/${projectId}`);
      setDocuments(response.data.filter(doc => !doc.name.endsWith('.json')));
    } catch (error) {
      setMessage('Error fetching documents.');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPreview(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
    if (!description) {
      setMessage('Please provide a description.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      setLoading(true);
      await axios.post(`/documents/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Document uploaded successfully!');
      setFile(null);
      setDescription('');
      setTags('');
      setPreview('');
      fetchDocuments();
    } catch (error) {
      setMessage('Error uploading document.');
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    if (docName.endsWith('.json')) {
      setMessage('JSON metadata files cannot be deleted.');
      return;
    }
  
    const encodedDocName = encodeURIComponent(docName); // To handle any special characters in the document name
  
    try {
      setLoading(true);
      await axios.delete(`/documents/delete/${projectId}/${encodedDocName}`);
      setMessage('Document deleted successfully!');
      fetchDocuments();
    } catch (error) {
      setMessage('Error deleting document.');
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="document-management">
      <h2>Document Management</h2>
      <div className="project-selection">
        <h3>Select a Project</h3>
        <select onChange={(e) => setProjectId(e.target.value)} value={projectId || ''}>
          <option value="">-- Select a Project --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      {projectId && (
        <div>
          <div className="upload-section">
            <input type="file" onChange={handleFileChange} disabled={loading} />
            {preview && <div className="file-preview">{file.type.startsWith("image/") ? <img src={preview} alt="Preview" width="100" /> : <p>Preview not available.</p>}</div>}
            <textarea placeholder="Document Description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
            <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <button onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Document'}</button>
            {message && <p>{message}</p>}
          </div>
          <div className="document-list">
            <h3>Uploaded Documents</h3>
            {loading ? <p>Loading documents...</p> : (
              <ul>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <li key={doc.id} className="document-item">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name} ({doc.uploadDate})</a>
                      <p>{doc.description}</p>
                      <p>Tags: {doc.tags}</p>
                      <button onClick={() => handleDelete(doc.id, doc.name)} disabled={loading}>Delete</button>
                    </li>
                  ))
                ) : (
                  <li>No documents uploaded yet.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;

