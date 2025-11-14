import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import "./StudentAttendance.css";

export default function StudentAttendance({ user }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line
  }, [selectedClass]);

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const url =
        selectedClass === "all"
          ? `${API_BASE}/api/student/attendance?student_id=${user.id}`
          : `${API_BASE}/api/student/attendance?student_id=${user.id}&class_id=${selectedClass}`;

      const res = await axios.get(url);
      setAttendanceData(res.data);
    } catch (err) {
      setError(
        "Failed to load attendance: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status, locationOk) => {
    if (status === "Present" && locationOk) return "badge-present";
    if (status === "Present" && !locationOk) return "badge-warning";
    return "badge-absent";
  };

  const getStatusText = (status, locationOk) => {
    if (status === "Present" && locationOk) return "Present ✓";
    if (status === "Present" && !locationOk)
      return "Present (Location Mismatch)";
    return "Absent";
  };

  if (loading) {
    return (
      <div className="attendance-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading attendance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadAttendance} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { attendance_records = [], statistics = [] } = attendanceData || {};

  const uniqueClasses = [
    ...new Map(
      attendance_records.map((record) => [
        record.class_id,
        record.class_name,
      ])
    ).entries(),
  ].map(([id, name]) => ({ id, name }));

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>My Attendance</h2>
        <p className="student-info">
          {user.student_id && <span>ID: {user.student_id}</span>}
          {user.section && <span>Section: {user.section}</span>}
        </p>
      </div>

      {uniqueClasses.length > 1 && (
        <div className="class-filter">
          <label>Filter by Subject:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Subjects</option>
            {uniqueClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {statistics && statistics.length > 0 && (
        <div className="stats-grid">
          {statistics.map((stat) => (
            <div key={stat.class_id} className="stat-card">
              <div className="stat-header">
                <h3>{stat.class_name}</h3>
                <span
                  className={`percentage ${
                    stat.percentage >= 75
                      ? "good"
                      : stat.percentage >= 60
                      ? "warning"
                      : "low"
                  }`}
                >
                  {stat.percentage}%
                </span>
              </div>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value present">{stat.present}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value absent">{stat.absent}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stat.total}</span>
                </div>
              </div>
              <div className="stat-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {attendance_records.length === 0 ? (
        <div className="no-records">
          <p>No attendance records found.</p>
          <p className="hint">
            Scan the QR code in class to mark your attendance.
          </p>
        </div>
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {attendance_records.map((record) => (
                <tr key={record.attendance_id}>
                  <td className="subject-cell">{record.class_name}</td>

                  {/* FIX: use scan_timestamp only */}
                  <td className="date-cell">
                    {formatDate(record.scan_timestamp)}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        record.status,
                        record.location_ok
                      )}`}
                    >
                      {getStatusText(record.status, record.location_ok)}
                    </span>
                  </td>

                  <td className="location-cell">
                    {record.location_ok ? (
                      <span className="location-ok">✓ Verified</span>
                    ) : (
                      <span className="location-fail">✗ Mismatch</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
