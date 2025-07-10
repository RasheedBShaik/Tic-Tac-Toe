import React, { useState } from "react";
import "./App.css";

const Gameplay = ({
  board: externalBoard,
  onCellClick,
  currentPlayer: externalPlayer,
  winner: externalWinner,
  isOnline = false,
  onReset,
}) => {
  // Local state for offline gameplay
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moveOrder, setMoveOrder] = useState([]);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });

  // Choose correct state based on mode
  const boardToUse = isOnline ? externalBoard : board;
  const winnerToUse = isOnline ? externalWinner : winner;

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

  const checkWinner = (b) => {
    for (let [a, b1, c] of winningCombos) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return b[a];
      }
    }
    return b.includes("") ? null : "Draw";
  };

  const handleClick = (index) => {
    if (board[index] || winnerToUse) return;

    const newBoard = [...board];
    const newMoveOrder = [...moveOrder, index];

    // Remove oldest if more than 6 moves
    if (newMoveOrder.length > 6) {
      const oldest = newMoveOrder.shift();
      newBoard[oldest] = "";
    }

    newBoard[index] = currentPlayer;

    const result = checkWinner(newBoard);
    setBoard(newBoard);
    setMoveOrder(newMoveOrder);

    if (result) {
      setWinner(result);
      if (result === "X" || result === "O") {
        setScore((prev) => ({ ...prev, [result]: prev[result] + 1 }));
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    if (isOnline && onReset) {
      onReset();
    } else {
      setBoard(Array(9).fill(""));
      setMoveOrder([]);
      setCurrentPlayer("X");
      setWinner(null);
    }
  };

  const resetScores = () => {
    setScore({ X: 0, O: 0 });
  };

  return (
    <>
      <div className="start">Let's Start the Game</div>

      {/* Score Display */}
      {!isOnline && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 20, margin: 30 }}>
            Player X Score: <strong>{score.X}</strong> | Player O Score:{" "}
            <strong>{score.O}</strong>
          </div>
          <button
            onClick={resetScores}
            style={{
              fontSize: 16,
              color: "white",
              backgroundColor: "transparent",
              marginTop: 30,
              marginBottom: 30,
            }}>
            Reset Scores
          </button>
        </div>
      )}

      {/* Winner Message */}
      {winnerToUse && (
        <div style={{ margin: "30px", fontSize: 24, textAlign: "center" }}>
          {winnerToUse === "Draw" ? (
            <>
              Game is a <strong>Draw</strong>
            </>
          ) : (
            <>
              Player <strong>{winnerToUse}</strong> wins!
            </>
          )}
        </div>
      )}

      {/* Game Board */}
      <div className="bigBox">
        {boardToUse.map((value, index) => (
          <div
            key={index}
            className="box"
            onClick={() => (isOnline ? onCellClick(index) : handleClick(index))}
            style={{
              cursor: value === "" && !winnerToUse ? "pointer" : "default",
            }}>
            {value}
          </div>
        ))}
      </div>

      {/* Reset Game Button */}
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
