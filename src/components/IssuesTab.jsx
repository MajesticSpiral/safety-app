import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaCamera } from "react-icons/fa";

function IssuesTab() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [newIssue, setNewIssue] = useState({ issue_name: "", description: "", status: "Open", photos: [] });
  const [newAction, setNewAction] = useState({ action_name: "", description: "", status: "To Do" });
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const searchInputRef = useRef(null);

  const employeeId = parseInt(localStorage.getItem("id")); // Logged-in employee ID

  useEffect(() => {
    fetchIssues();
  }, []);

  // Fetch all issues from backend
  const fetchIssues = async () => {
    try {
      const res = await fetch("http://localhost:4000/issues", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // include JWT if needed
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text);
        alert("Server did not return JSON. Check backend.");
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch issues");
      }

      const data = await res.json();

      // Map issues and add sequential recordID
      const mappedIssues = data.map((issue, index) => ({
        ...issue,
        recordID: index + 1, // sequential number starting from 1
        photos: issue.photos || [],
        employee_id: issue.employee_id || employeeId
      }));

      setIssues(mappedIssues);
      setFilteredIssues(mappedIssues);
    } catch (err) {
      console.error("Error fetching issues:", err);
      alert("Unable to fetch issues. See console for details.");
    }
  };

  // Handle search
  const filterIssues = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    if (!text) {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(
        issues.filter(issue =>
          issue.issue_name.toLowerCase().includes(text) ||
          issue.description.toLowerCase().includes(text)
        )
      );
    }
  };

  // Handle form input changes
  const handleIssueChange = (e) => setNewIssue({ ...newIssue, [e.target.name]: e.target.value });
  const handleActionChange = (e) => setNewAction({ ...newAction, [e.target.name]: e.target.value });

  // Take photo placeholder
  const takePhoto = () => {
    const placeholder = "https://via.placeholder.com/150";
    setCapturedPhotos([...capturedPhotos, placeholder]);
  };

  // Convert DataURL to hex (optional for backend)
  const convertPhotosToHex = async (photos) => {
    return photos.map(photo => {
      const base64 = photo.split(",")[1] || photo;
      return Array.from(atob(base64))
        .map(c => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
    });
  };

  // Add Issue (and optional Action)
  const addIssue = async () => {
    if (!newIssue.issue_name || !newIssue.description) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const photosHex = await convertPhotosToHex(capturedPhotos);
      const issueData = { ...newIssue, photos: photosHex, employee_id: employeeId };

      // Create Issue
      const res = await fetch("http://localhost:4000/addIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(issueData)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text);
        alert("Server did not return JSON on issue creation.");
        return;
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add issue");

      // Refresh issue list
      await fetchIssues();

      // Create action if details exist
      if (newAction.action_name && newAction.description) {
        const latestIssue = issues.find(i =>
          i.issue_name === newIssue.issue_name && i.description === newIssue.description
        );
        const issueId = latestIssue?.recordID || result.id;
        if (issueId) {
          const actionData = { ...newAction, issue_id: issueId, employee_id: employeeId };
          const resAction = await fetch("http://localhost:4000/addAction", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify(actionData)
          });
          const resultAction = await resAction.json();
          if (!resAction.ok) throw new Error(resultAction.error || "Failed to add action");
        }
      }

      resetForm();
      setCreatingIssue(false);
      alert("Issue added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding issue/action. See console for details.");
    }
  };

  // Reset form
  const resetForm = () => {
    setNewIssue({ issue_name: "", description: "", status: "Open", photos: [] });
    setNewAction({ action_name: "", description: "", status: "To Do" });
    setCapturedPhotos([]);
  };

  return (
    <div style={{ padding: "16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Issues</h1>
        <button onClick={() => window.history.back()}><FaArrowLeft /></button>
      </header>

      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search issues..."
        value={searchText}
        onChange={filterIssues}
        style={{ width: "100%", padding: "8px", margin: "16px 0", borderRadius: "8px", border: "1px solid #ddd" }}
      />

      <button onClick={() => setCreatingIssue(true)}>Create New Issue</button>

      {creatingIssue && (
        <div style={{ marginTop: "16px", padding: "16px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Create New Issue</h3>
          <input type="text" name="issue_name" placeholder="Issue Name" value={newIssue.issue_name} onChange={handleIssueChange} style={{ marginBottom: "8px", width: "100%" }} />
          <input type="text" name="description" placeholder="Description" value={newIssue.description} onChange={handleIssueChange} style={{ marginBottom: "8px", width: "100%" }} />
          <input type="text" name="status" placeholder="Status" value={newIssue.status} disabled style={{ marginBottom: "8px", width: "100%" }} />

          <h4>Optional Action</h4>
          <input type="text" name="action_name" placeholder="Action Name" value={newAction.action_name} onChange={handleActionChange} style={{ marginBottom: "8px", width: "100%" }} />
          <input type="text" name="description" placeholder="Action Description" value={newAction.description} onChange={handleActionChange} style={{ marginBottom: "8px", width: "100%" }} />
          <input type="text" name="status" placeholder="Action Status" value={newAction.status} onChange={handleActionChange} style={{ marginBottom: "8px", width: "100%" }} />

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={takePhoto}><FaCamera /> Take Photo</button>
            <button onClick={addIssue}>Save Issue</button>
          </div>

          {capturedPhotos.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              {capturedPhotos.map((p, i) => <img key={i} src={p} alt={`photo-${i}`} style={{ width: "100px" }} />)}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "16px" }}>
        {filteredIssues.map((issue) => (
          <div key={issue.recordID} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "8px" }}>
            <h3>{issue.issue_name}</h3>
            <p><strong>Description:</strong> {issue.description}</p>
            <p><strong>Record ID:</strong> {issue.recordID}</p>
            <p><strong>Status:</strong> {issue.status}</p>
            <p><strong>Employee ID:</strong> {issue.employee_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IssuesTab;
