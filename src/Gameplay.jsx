// Gameplay.jsx
import React, { useState } from "react";
import "./App.css";

const Gameplay = () => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moveOrder, setMoveOrder] = useState([]);
  const [winner, setWinner] = useState(null);

  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (board) => {
    for (let [a, b, c] of winningCombos) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const newMoveOrder = [...moveOrder, index];
    if (newMoveOrder.length > 6) {
      const oldest = newMoveOrder.shift();
      newBoard[oldest] = "";
    }

    setBoard(newBoard);
    setMoveOrder(newMoveOrder);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setMoveOrder([]);
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <>
      <div className="start">Let's Start the Game</div>

      {winner && (
        <div
          style={{
            marginTop: 10,
            marginBottom: 15,
            fontSize: 24,
            textAlign: "center",
          }}>
          Player <strong>{winner}</strong> wins!
        </div>
      )}
      <div className="bigBox">
        {board.map((value, index) => (
          <div
            key={index}
            className="box"
            onClick={() => handleClick(index)}
            style={{
              cursor: value === "" && !winner ? "pointer" : "default",
            }}>
            {value}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 15 }}>
        <button
          onClick={resetGame}
          style={{
            fontSize: 18,
            color: "white",
            backgroundColor: "transparent",
          }}>
          Reset Game
        </button>
      </div>
    </>
  );
};

export default Gameplay;
