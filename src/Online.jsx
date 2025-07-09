import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import Gameplay from "./Gameplay";
import Offline from "./Offline";

const Online = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [player, setPlayer] = useState("");
  const [gameData, setGameData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showOffline, setShowOffline] = useState(false);

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
    const newRoomId = Math.random().toString(36).slice(2, 8);
    const ref = doc(db, "rooms", newRoomId);
    const initialData = {
      board: Array(9).fill(""),
      currentPlayer: "X",
      moveOrder: [],
    };
    try {
      await setDoc(ref, initialData);
      setPlayer("X");
      setRoomId(newRoomId);
    } catch (error) {
      alert("Could not create room.");
    }
  };

  const joinRoom = async () => {
    const ref = doc(db, "rooms", inputRoomId);
    try {
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setPlayer("O");
        setRoomId(inputRoomId);
      } else {
        alert("Room not found");
      }
    } catch (err) {
      alert("Error joining room.");
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

    // Deep copy of the board and moveOrder
    const updatedBoard = [...gameData.board];
    const updatedMoveOrder = [...(gameData.moveOrder || [])];

    // ✅ Remove oldest move if 6 already placed
    // each player can keep only maximum 3 moves on board
    if (updatedMoveOrder.length >= 6) {
      const oldestIndex = updatedMoveOrder.shift(); // remove first
      updatedBoard[oldestIndex] = ""; // clear cell
    }

    // ✅ Apply new move
    updatedBoard[index] = player;
    updatedMoveOrder.push(index);

    const result = checkWinner(updatedBoard);

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        board: updatedBoard,
        currentPlayer: player === "X" ? "O" : "X",
        moveOrder: updatedMoveOrder, // 🔁 updated array without old move
      });

      if (result) setWinner(result);
    } catch (err) {
      console.error("Error making move:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setGameData(data);
        const possibleWinner = checkWinner(data.board);
        if (possibleWinner !== winner) setWinner(possibleWinner);
      }
    });

    return () => unsub();
  }, [roomId, winner]);

  const resetGame = async () => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        board: emptyBoard,
        currentPlayer: "X",
        moveOrder: [],
      });
      setWinner(null);
    } catch (err) {
      console.error("Error resetting game");
    }
  };

  if (showOffline) return <Offline />;

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Create / Join room</h1>
      <br />
      {!roomId ? (
        <>
          <button onClick={createRoom}>Create Room</button>
          <br />
          <input
            style={{
              margin: "25px",
              fontSize: "20px",
              height: "40px",
              borderRadius: "10px",
              textAlign: "center",
            }}
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />

          <br />
          <button onClick={joinRoom}>Join Room</button>
        </>
      ) : (
        <>
          <p>Room ID: {roomId}</p>
          <p>You are Player: {player}</p>

          {gameData && (
            <Gameplay
              board={gameData.board}
              onCellClick={makeMove}
              currentPlayer={gameData.currentPlayer}
              winner={winner}
              isOnline={true}
              onReset={resetGame}
            />
          )}
        </>
      )}
      <br />
      <br />
      <button onClick={() => setShowOffline(true)} style={{ marginTop: 20 }}>
        Go Offline
      </button>
    </div>
  );
};

export default Online;
