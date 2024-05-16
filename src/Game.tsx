import { useState } from "react";
import { GameState } from "./game/GameState";
import { Cell, CellColor } from "./game/Cell";

export const Game = () => {
    const [gameState, setGameState] = useState<GameState>(new GameState())
    const [gameTick, setGameTick] = useState<number>(0)

    const updateGameState = () => {
        setGameState(gameState)
        setGameTick(gameTick + 1)
    }

    const renderCell = (cell: Cell) => {
        return <div>
            <div style={{
            width: 100,
            fontSize: 8,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "pre-wrap", // Allows text to wrap to the next line
            overflowWrap: "break-word" // Ensures words break to prevent overflow
        }}>
            {JSON.stringify({ rank: cell.rank, file: cell.file, pieceRank: cell.piece?.rank, pieceFile: cell.piece?.file }, null, 2)}
        </div>
        <div style={{
            width: 100,
            height: 100,
            border: cell.isSelected ? "1px solid blue" : "none",
            backgroundColor: cell.color == CellColor.DARK ? "#dddddd" : "#ffffff",
            fontSize: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }} onMouseDown={() => {
            gameState.select(cell)
            updateGameState()
        }}>
            {cell.piece ? cell.piece.symbol : ""}
        </div>
        </div>
        
        
    }
    return <div style={{ margin: 20, display: 'flex', flexDirection: 'column' }}>
        {gameState.board.slice().reverse().map((row, index) => {
            return <div key={gameState.board.length - index - 1} style={{ display: 'flex', flexDirection: 'row' }}>
                {row.map((cell, index) => {
                    return renderCell(cell)
                })}
            </div>
        })}
    </div>;
};
