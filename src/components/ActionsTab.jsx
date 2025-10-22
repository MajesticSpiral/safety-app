import React, { useState, useEffect } from "react";

function ActionsTab() {
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [creatingAction, setCreatingAction] = useState(false);
  const [newAction, setNewAction] = useState({
    action_name: "",
    description: "",
    status: "To Do",
  });
  const [userId, setUserId] = useState(null);

  const API_BASE = "http://localhost:4000"; // ✅ Change this to your backend URL

  // ✅ Load user ID from sessionStorage
  useEffect(() => {
    const storedId = sessionStorage.getItem("id");
    if (storedId) {
      setUserId(storedId);
    } else {
      console.error("No user ID found in sessionStorage");
    }
  }, []);

  // Fetch actions when userId is loaded
  useEffect(() => {
    if (userId) loadActions();
  }, [userId]);

  const loadActions = async () => {
    try {
      const response = await fetch(`${API_BASE}/actions?userId=${userId}`);
      const data = await response.json();
      const mappedActions = data.map((a) => ({
        ...a,
        recordID: a.id,
      }));
      setActions(mappedActions);
      setFilteredActions(mappedActions);
    } catch (error) {
      console.error("Error fetching actions:", error);
      alert("Failed to fetch actions. Please try again later.");
    }
  };

  const filterActions = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    setFilteredActions(
      actions.filter(
        (a) => a.action_name && a.action_name.toLowerCase().includes(text)
      )
    );
  };

  const openCreateForm = () => setCreatingAction(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAction({ ...newAction, [name]: value });
  };

  const addAction = async () => {
    if (!newAction.action_name || !newAction.description || !newAction.status) {
      alert("Please fill in all required fields before saving the action.");
      return;
    }

    try {
      const payload = { ...newAction, employee_id: Number(userId) };
      const response = await fetch(`${API_BASE}/addAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add action");

      const addedAction = { ...payload, recordID: Date.now() };
      const updated = [...actions, addedAction];
      setActions(updated);
      setFilteredActions(updated);
      resetForm();
    } catch (error) {
      console.error("Error adding action:", error);
      alert("Failed to add action. Please try again later.");
    }
  };

  const resetForm = () => {
    setNewAction({ action_name: "", description: "", status: "To Do" });
    setCreatingAction(false);
  };

  const getStatusColors = (status) => {
    switch (status.trim().toLowerCase()) {
      case "in progress":
        return { color: "#337ab7", fontWeight: "bold" };
      case "completed":
        return { color: "#5cb85c", fontWeight: "bold" };
      case "to do":
        return { color: "#a94442", fontWeight: "bold" };
      default:
        return { color: "#555" };
    }
  };

  return (
    <div
      className="actions-tab"
      style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}
    >
      <h1 style={{ textAlign: "center", color: "#007bff" }}>Actions</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search actions..."
        value={searchText}
        onChange={filterActions}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #007bff",
          margin: "16px 0",
        }}
      />

      {/* Create button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={openCreateForm}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Create New Action
        </button>
      </div>

      {/* Create Action Form */}
      {creatingAction && (
        <div
          className="card"
          style={{
            border: "1px solid #007bff",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ color: "#007bff" }}>New Action</h3>

          <input
            type="text"
            name="action_name"
            placeholder="Action Name"
            value={newAction.action_name}
            onChange={handleInputChange}
            style={{
              width: "100%",
              marginBottom: "8px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #007bff",
            }}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newAction.description}
            onChange={handleInputChange}
            style={{
              width: "100%",
              marginBottom: "8px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #007bff",
            }}
          />
          <input
            type="text"
            name="status"
            placeholder="Status (To Do / In Progress / Completed)"
            value={newAction.status}
            onChange={handleInputChange}
            style={{
              width: "100%",
              marginBottom: "8px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #007bff",
            }}
          />

          <button
            onClick={addAction}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Save Action
          </button>
        </div>
      )}

      {/* List of actions */}
      {filteredActions.map((a) => (
        <div
          key={a.recordID}
          className="card"
          style={{
            border: "1px solid #007bff",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ color: "#007bff" }}>{a.action_name}</h3>
          <p><strong>Record ID:</strong> {a.recordID}</p>
          <p><strong>Assigned User:</strong> {a.employee_id}</p>
          <p><strong>Description:</strong> {a.description}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span style={getStatusColors(a.status)}>{a.status}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default ActionsTab;
