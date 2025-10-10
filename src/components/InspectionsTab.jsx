import React, { useState, useEffect } from "react";

function InspectionsTab() {
  const [activeTab, setActiveTab] = useState("templates");
  const [templateFolders, setTemplateFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [submittedTemplates, setSubmittedTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch template folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch("/api/templateFolders");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const dummyFolders = [
            { id: 1, template_folder_name: "Kronospan Daily" },
            { id: 2, template_folder_name: "Safety Audit" },
            { id: 3, template_folder_name: "Machine Inspection" },
          ];
          setTemplateFolders(dummyFolders);
          setFilteredFolders(dummyFolders);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch template folders");
        const folders = await res.json();
        setTemplateFolders(folders);
        setFilteredFolders(folders);
      } catch {
        setTemplateFolders([]);
        setFilteredFolders([]);
      }
    }
    fetchFolders();
  }, []);

  // Fetch submitted templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/submittedTemplates");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
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
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch submitted templates");
        const templates = await res.json();
        setSubmittedTemplates(templates);
      } catch {
        setSubmittedTemplates([]);
      }
    }
    fetchTemplates();
  }, []);

  const filteredSubmittedTemplates = submittedTemplates.filter((template) =>
    template.template_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inspections-tab">
      {/* Segment Buttons */}
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

      {/* Search bar */}
      {activeTab === "inProgress" && (
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {/* Templates Tab */}
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

        {/* Completed Tab */}
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
