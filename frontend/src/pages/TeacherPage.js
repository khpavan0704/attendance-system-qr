import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function TeacherPage({ user }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    axios.get("/api/classes")
      .then(res => setClasses(res.data))
      .catch(err => console.error("Failed to load classes:", err));
  }, []);

  const generateQR = async () => {
    if (!selectedClassId) {
      alert("Please select a class first");
      return;
    }

    const qr_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const res = await axios.post("/api/create-session", {
        class_id: selectedClassId,
        qr_code
      });

      alert(`✅ QR Created Successfully!\nSession ID: ${res.data.session_id}\nQR Code: ${qr_code}`);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Generate QR Code</h2>

      <label>Select Class</label><br />
      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        className="form-select"
        style={{ width: "300px", marginTop: "10px" }}
      >
        <option value="">-- Select Class --</option>
        {classes.map(cls => (
          <option key={cls.id} value={cls.id}>
            {cls.class_name}
          </option>
        ))}
      </select>

      <br /><br />

      <button className="generate-btn" onClick={generateQR}>
        Generate New QR Code
      </button>
    </div>
  );
}
