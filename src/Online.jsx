import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import Gameplay from "./Gameplay";
import Offline from "./Offline";

const Online = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [player, setPlayer] = useState("");
  const [gameData, setGameData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showOffline, setShowOffline] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

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
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
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

    const updatedBoard = [...gameData.board];
    const updatedMoveOrder = [...(gameData.moveOrder || [])];

    if (updatedMoveOrder.length >= 6) {
      const oldestIndex = updatedMoveOrder.shift();
      updatedBoard[oldestIndex] = "";
    }

    updatedBoard[index] = player;
    updatedMoveOrder.push(index);

    const result = checkWinner(updatedBoard);

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        board: updatedBoard,
        currentPlayer: player === "X" ? "O" : "X",
        moveOrder: updatedMoveOrder,
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

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        sender: player,
        text: chatInput.trim(),
        timestamp: serverTimestamp(),
      });
      console.log("Sending message to room:", roomId);
      setChatInput("");
    } catch (err) {
      alert("Failed to send message.");
    }
  };

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

          {/* Chat Section */}
          <div style={{ marginTop: "40px" }}>
            <h2>Chat</h2>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px auto",
                width: "300px",
                background: "#f9f9f9",
                borderRadius: "10px",
                textAlign: "left",
                backgroundColor: "transparent",
              }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: "8px",
                    color: "pink",
                    fontSize: "20px",
                  }}>
                  <strong>{msg.sender}: </strong>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <input
              style={{
                width: "200px",
                padding: "8px",
                fontSize: "16px",
                borderRadius: "6px",
                textAlign: "left",
              }}
              type="text"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
            </button>
          </div>
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
