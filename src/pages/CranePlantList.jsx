import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function CranePlantList() {
  const { plant } = useParams();
  const navigate = useNavigate();

  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎨 Different Attractive Colors (max 6 cranes)
  const craneColors = [
    "#ff6b6b", // Red
    "#4dabf7", // Blue
    "#51cf66", // Green
    "#ffd43b", // Yellow
    "#845ef7", // Purple
    "#ff922b", // Orange
  ];

  useEffect(() => {
    const fetchCranes = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API}/cranes?plant=${plant}`);

        if (!res.ok) {
          throw new Error("Failed to fetch cranes");
        }

        const data = await res.json();
        setCranes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Error loading cranes");
      } finally {
        setLoading(false);
      }
    };

    fetchCranes();
  }, [plant]);

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/crane")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>
        {plant} - Crane List
      </h2>

      {loading && <p>Loading cranes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && cranes.length === 0 && (
        <p style={{ marginTop: "20px" }}>No cranes found</p>
      )}

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {cranes.map((crane, index) => (
          <div
            key={crane._id}
            style={{
              padding: "35px",
              borderRadius: "18px",
              backgroundColor: craneColors[index % 6],
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: `0 8px 20px ${craneColors[index % 6]}80`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = `0 12px 28px ${craneColors[index % 6]}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 8px 20px ${craneColors[index % 6]}80`;
            }}
            onClick={() => navigate(`/crane/detail/${crane._id}`)}
          >
            {crane.craneNo}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CranePlantList;