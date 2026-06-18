import { useState } from "react";
import CGLDashboard from "./CGLDashboard";

function Home() {
  const [selectedPlant, setSelectedPlant] = useState(null);

  if (selectedPlant === "CGL") {
    return <CGLDashboard />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>STEEL PLANT DASHBOARD</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <button onClick={() => setSelectedPlant("CGL")}>CGL Motors</button>
        <button>Mill Motors</button>
        <button>CCL Motors</button>
        <button>Pickling Motors</button>
      </div>
    </div>
  );
}

export default Home;
