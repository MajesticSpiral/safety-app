import React, { useState, useEffect } from "react";

function InspectionsTab() {
  const [activeTab, setActiveTab] = useState("templates");
  const [templateFolders, setTemplateFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [submittedTemplates, setSubmittedTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://localhost:4000"; // ✅ Change this for production

  // Fetch template folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch(`${API_BASE}/api/templateFolders`);
        if (!res.ok) throw new Error("Failed to fetch template folders");
        const folders = await res.json();
        setTemplateFolders(folders);
        setFilteredFolders(folders);
      } catch (err) {
        console.warn("Using fallback folders:", err);
        const dummyFolders = [
          { id: 1, template_folder_name: "Kronospan Daily" },
          { id: 2, template_folder_name: "Safety Audit" },
          { id: 3, template_folder_name: "Machine Inspection" },
        ];
        setTemplateFolders(dummyFolders);
        setFilteredFolders(dummyFolders);
      }
    }
    fetchFolders();
  }, []);

  // Fetch submitted templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch(`${API_BASE}/api/submittedTemplates`);
        if (!res.ok) throw new Error("Failed to fetch submitted templates");
        const templates = await res.json();
        setSubmittedTemplates(templates);
      } catch (err) {
        console.warn("Using fallback templates:", err);
        const dummyTemplates = [
          {
            recordID: 1,
            template_name: "Kronospan Daily",
            employee_id: 4,
            dateAdded: new Date().toISOString(),
            questions_and_answers: [
              { question: "Is the press running?", answer: "Yes" },
              { question: "Any leaks?", answer: "No" },
            ],
          },
          {
            recordID: 2,
            template_name: "Safety Audit",
            employee_id: 5,
            dateAdded: new Date().toISOString(),
            questions_and_answers: [
              { question: "Are guards in place?", answer: "Yes" },
              { question: "Emergency stops functional?", answer: "" },
            ],
          },
        ];
        setSubmittedTemplates(dummyTemplates);
      }
    }
    fetchTemplates();
  }, []);

  const filteredSubmittedTemplates = submittedTemplates.filter((template) =>
    template.template_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inspections-tab">
      <div className="segment">
        <button
          className={`segment-button ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          Templates
        </button>
        <button
          className={`segment-button ${activeTab === "inProgress" ? "active" : ""}`}
          onClick={() => setActiveTab("inProgress")}
        >
          Completed
        </button>
      </div>

      {activeTab === "inProgress" && (
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      )}

      <div className="tab-content">
        {activeTab === "templates" && (
          <div className="templates-list">
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="card">
                <div className="card-header">
                  <h3>{folder.template_folder_name}</h3>
                  <p>Folder ID: {folder.id}</p>
                </div>
                <div className="card-content">
                  <button className="btn" onClick={() => setSelectedTemplate(folder.id)}>
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "inProgress" && (
          <div className="submitted-templates">
            {filteredSubmittedTemplates.length === 0 && <p>No submitted templates found.</p>}
            {filteredSubmittedTemplates.map((template) => (
              <div key={template.recordID} className="card">
                <div className="card-header">
                  <p><strong>Date Added:</strong> {new Date(template.dateAdded).toLocaleDateString()}</p>
                  <h3>{template.template_name}</h3>
                  <p><strong>Record ID:</strong> {template.recordID}</p>
                  <p><strong>User ID:</strong> {template.employee_id}</p>
                </div>
                <div className="card-content">
                  {template.questions_and_answers?.map((qa, idx) => (
                    <div key={idx} className={`qa-item ${qa.answer ? "answered" : ""}`}>
                      <p><strong>Q:</strong> {qa.question}</p>
                      <textarea readOnly value={qa.answer || ""}></textarea>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InspectionsTab;
