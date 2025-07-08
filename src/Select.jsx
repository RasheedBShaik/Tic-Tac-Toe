import React, { useState } from "react";
import Offline from "./Offline";
import Online from "./Online";

const Select = () => {
  const [visibleComponent, setVisibleComponent] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      {/* <h2 style={{ textAlign: "center" }}>Select Game Mode</h2> */}

      {/* ✅ Show buttons only before a selection */}
      {visibleComponent === null && (
        <div
          style={{
            display: "flex",
            paddingTop: "50px",
            justifyContent: "space-around",
          }}>
          <button
            onClick={() => setVisibleComponent("online")}
            style={{ marginLeft: "10px" }}>
            Online
          </button>
          <button
            onClick={() => setVisibleComponent("offline")}
            style={{ marginLeft: "10px" }}>
            Offline
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        {visibleComponent === "online" && <Online />}
        {visibleComponent === "offline" && <Offline />}
      </div>
    </div>
  );
};

export default Select;
