// Offline.jsx
import React, { useState } from "react";
import Online from "./Online";
import Gameplay from "./Gameplay";

function Offline() {
  const [showOnline, setShowOnline] = useState(false);

  if (showOnline) {
    return <Online />;
  }

  return (
    <div>
      <div
        style={{
          textAlign: "center",
        }}>
        <div>
          <h2>Wanna Go Online</h2>
          <br />
          <button
            style={{
              marginTop: "0px",
              backgroundColor: "transparent",
              color: "white",
            }}
            onClick={() => setShowOnline(true)}>
            Go Online
          </button>
        </div>
      </div>

      <br />
      <br />
      <br />
      <Gameplay />
    </div>
  );
}

export default Offline;
