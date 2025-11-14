import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import "./GenerateQR.css";

export default function GenerateQR({ user }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load teacher's classes automatically
  useEffect(() => {
    if (user?.role === "teacher") {
      loadTeacherClasses();
    }
  }, [user]);

  const loadTeacherClasses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/teacher/classes?teacher_id=${user.id}`
      );
      setClasses(res.data);

      // Auto-select first class
      if (res.data.length > 0) {
        setSelectedClass(res.data[0].id);
      }
    } catch (err) {
      setError("Failed to load teacher classes.");
    }
  };

  const generateQR = async () => {
    setLoading(true);
    setError("");

    try {
      if (!selectedClass) {
        setError("Please select a subject/class.");
        setLoading(false);
        return;
      }

      // Create session
      const res = await axios.post(`${API_BASE}/api/create-session`, {
        class_id: selectedClass,
        qr_code: "qr",
      });

      const { session_id } = res.data;
      setSessionId(session_id);

      // Get token
      const qr = await axios.get(`${API_BASE}/api/qr/${session_id}/current`);
      setQrToken(qr.data.token);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to create QR session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-container">
      <h2>Generate QR Code</h2>

      {error && <p className="qr-error">{error}</p>}

      {/* Class Selector */}
      <label>Select Subject:</label>
      <select
        className="qr-select"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.class_name}
          </option>
        ))}
      </select>

      {!sessionId && (
        <button className="qr-btn" onClick={generateQR} disabled={loading}>
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      )}

      {sessionId && qrToken && (
        <div className="qr-box">
          <h3>Live QR Token</h3>
          <p>{qrToken}</p>
          <p className="note">This QR changes every few seconds.</p>
        </div>
      )}
    </div>
  );
}
