import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function ACDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ac, setAc] = useState(null);
  const [history, setHistory] = useState([]);

  const [showRepairForm, setShowRepairForm] = useState(false);

  const [repairDate, setRepairDate] = useState("");
  const [repairDetails, setRepairDetails] = useState("");
  const [technician, setTechnician] = useState("");
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState("Running");

  /* ================= LOAD AC ================= */

  const loadAC = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ac/${id}`);
      const data = await res.json();

      setAc(data);
      setStatus(data.status || "Running");
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  /* ================= LOAD HISTORY ================= */

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ac-history/${id}`);
      const data = await res.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    }
  }, [id]);

  useEffect(() => {
    loadAC();
    loadHistory();
  }, [loadAC, loadHistory]);

  /* ================= SAVE REPAIR ================= */

  const saveRepair = async () => {
    try {
      await fetch(`${API}/ac/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          repairDate,
          repairDetails,
          technician,
          remark,
          status
        })
      });

      alert("AC Updated Successfully ✅");

      setShowRepairForm(false);

      setRepairDate("");
      setRepairDetails("");
      setTechnician("");
      setRemark("");

      loadAC();
      loadHistory();

    } catch {
      alert("Update Failed ❌");
    }
  };

  if (!ac) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    marginBottom: "25px"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "linear-gradient(135deg,#74ebd5,#ACB6E5)"
      }}
    >
      <button onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div style={{ ...cardStyle, marginTop: "20px" }}>
        <h2 style={{ color: "#1565c0" }}>
          ❄ {ac.acNo}
        </h2>

        <p><b>Plant:</b> {ac.plant}</p>
        <p><b>Brand:</b> {ac.brand}</p>
        <p><b>Serial No:</b> {ac.serialNo}</p>
        <p><b>Capacity:</b> {ac.capacityTon} Ton</p>
        <p><b>Location:</b> {ac.location}</p>
        <p><b>Status:</b> {ac.status}</p>
      </div>

      <div style={cardStyle}>
        <button
          onClick={() => setShowRepairForm(!showRepairForm)}
          style={{
            background: "linear-gradient(45deg,#ff9800,#ff5722)",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          🔧 Repair Update
        </button>

        {showRepairForm && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="date"
              value={repairDate}
              onChange={(e) => setRepairDate(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Repair Details"
              value={repairDetails}
              onChange={(e) => setRepairDetails(e.target.value)}
              style={{ width: "300px" }}
            />

            <br /><br />

            <input
              placeholder="Technician Name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              style={{ width: "300px" }}
            />

            <br /><br />

            <input
              placeholder="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              style={{ width: "300px" }}
            />

            <br /><br />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Running">Running</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Stopped">Stopped</option>
            </select>

            <br /><br />

            <button
              onClick={saveRepair}
              style={{
                background: "green",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              💾 Save
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#fff" }}>
          🕒 AC Repair History
        </h2>

        {history.length === 0 && (
          <p style={{ color: "#fff" }}>
            No Repair History
          </p>
        )}

        {history.map((h, index) => (
          <div
            key={index}
            style={{
              background: "#ffffff",
              padding: "15px",
              borderRadius: "12px",
              marginTop: "15px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.15)"
            }}
          >
            <p>
              <b>Date:</b>{" "}
              {new Date(h.updatedAt).toLocaleString()}
            </p>

            <p>
              <b>Repair Date:</b>{" "}
              {h.repairDate}
            </p>

            <p>
              <b>Repair Details:</b>{" "}
              {h.repairDetails}
            </p>

            <p>
              <b>Technician:</b>{" "}
              {h.technician}
            </p>

            <p>
              <b>Remark:</b>{" "}
              {h.remark}
            </p>

            <hr />

            <p>
              <b>Old Status:</b>{" "}
              {h.oldData?.status}
            </p>

            <p>
              <b>Old Location:</b>{" "}
              {h.oldData?.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ACDetail;