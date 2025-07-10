import React, { useState } from "react";
import Offline from "./Offline";
import Online from "./Online";

const Select = () => {
  const [visibleComponent, setVisibleComponent] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <title> Tic Tac Toe </title>
      {/* ✅ Show title only before a selection */}
      {visibleComponent === null && (
        <>
          <h1 style={{ textAlign: "center", color: "#00ffff" }}>Select Mode</h1>

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

          {/* ✅ Footer only shown during selection */}
          <pre
            className="me"
            style={{
              textAlign: "center",
              color: "red",
              fontWeight: "500",
              borderRadius: "10px",
              backgroundColor: "lightyellow",
              marginTop: "50px",
              padding: "10px",
              paddingLeft: "30px",
              paddingRight: "30px",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0px 0px 5px 8px #ff00ff",
            }}>
            Made By Rasheed with
            <div style={{ fontSize: "30px", fontWeight: "600" }}> ♡ </div>
          </pre>
        </>
      )}

      {/* ✅ Show selected game component */}
      <div style={{ marginTop: "20px" }}>
        {visibleComponent === "online" && <Online />}
        {visibleComponent === "offline" && <Offline />}
      </div>
    </div>
  );
};

export default Select;
