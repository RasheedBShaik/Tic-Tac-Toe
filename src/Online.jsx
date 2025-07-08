import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

const Online = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [player, setPlayer] = useState("");
  const [gameData, setGameData] = useState(null);
  const [winner, setWinner] = useState(null);

  const emptyBoard = Array(9).fill("");

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }
    return board.includes("") ? null : "Draw";
  };

  const createRoom = async () => {
    const newRoomId = Math.random().toString(36).slice(2, 8); // e.g., "xk3p9b"
    const ref = doc(db, "rooms", newRoomId);
    const initialData = {
      board: Array(9).fill(""),
      currentPlayer: "X",
    };

    try {
      await setDoc(ref, initialData);
      console.log("Room created successfully with ID:", newRoomId);
      setPlayer("X");
      setRoomId(newRoomId);
    } catch (error) {
      console.error("🔥 Failed to create room:", error);
      alert("Could not create room. See console for details.");
    }
  };

  const joinRoom = async () => {
    if (!inputRoomId.trim()) {
      alert("Please enter a valid Room ID.");
      return;
    }

    const ref = doc(db, "rooms", inputRoomId);
    try {
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setPlayer("O");
        setRoomId(inputRoomId);
        console.log("Joined room:", inputRoomId);
      } else {
        alert("Room not found!");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Check console for details.");
    }
  };

  const makeMove = async (index) => {
    if (
      !gameData ||
      gameData.board[index] !== "" ||
      gameData.currentPlayer !== player ||
      winner
    )
      return;

    const updatedBoard = [...gameData.board];
    updatedBoard[index] = player;

    const result = checkWinner(updatedBoard);

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        board: updatedBoard,
        currentPlayer: player === "X" ? "O" : "X",
      });

      if (result) setWinner(result);
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setGameData(data);
        const possibleWinner = checkWinner(data.board);
        if (possibleWinner !== winner) {
          setWinner(possibleWinner);
        }
      }
    });

    return () => unsub();
  }, [roomId, winner]); // Remove 'winner' from dependency list to avoid warning

  const resetGame = async () => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        board: emptyBoard,
        currentPlayer: "X",
      });
      setWinner(null);
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Online Multiplayer Tic Tac Toe</h1>

      {!roomId ? (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <div style={{ margin: "10px 0" }}>
            <input
              placeholder="Enter Room ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
            />
          </div>
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <h3>Room ID: {roomId}</h3>
          <p>You are Player: {player}</p>

          {gameData && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 100px)",
                gap: "5px",
                margin: "20px auto",
                width: "fit-content",
              }}>
              {gameData.board.map((cell, i) => (
                <div
                  key={i}
                  onClick={() => makeMove(i)}
                  style={{
                    width: 100,
                    height: 100,
                    border: "2px solid #333",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 28,
                    fontWeight: "bold",
                    background: cell ? "#ddd" : "#fff",
                    cursor:
                      cell === "" &&
                      gameData.currentPlayer === player &&
                      !winner
                        ? "pointer"
                        : "default",
                  }}>
                  {cell}
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: "18px", marginTop: "10px" }}>
            {winner
              ? winner === "Draw"
                ? "It's a Draw!"
                : `🏆 Winner: ${winner}`
              : `Current Turn: ${gameData?.currentPlayer}`}
          </p>

          {winner && (
            <button onClick={resetGame} style={{ marginTop: "10px" }}>
              Play Again
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Online;
