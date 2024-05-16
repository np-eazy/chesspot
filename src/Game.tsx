import { useState } from "react";
import { Color, GameState } from "./game/GameState";
import { Cell, CellColor } from "./game/Cell";

export const Game = () => {
    const [gameState, setGameState] = useState<GameState>(new GameState())
    const [gameTick, setGameTick] = useState<number>(0)

    const updateGameState = () => {
        setGameState(gameState)
        setGameTick(gameTick + 1)
    }

    const renderCell = (cell: Cell) => {
        return <div style={{
            width: 100,
            height: 100,
            border: cell.isSelected ? "1px solid blue" : "none",
            backgroundColor: cell.color == CellColor.DARK ? "#dddddd" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }} onMouseDown={() => {
            gameState.select(cell)
            updateGameState()
        }}>
            <div style={{ fontSize: 12 }}>
                {cell.targetingPieces.get(Color.WHITE)!.map(piece => piece.symbol).join(" ")}
                {cell.targetingPieces.get(Color.BLACK)!.map(piece => piece.symbol).join(" ")}
            </div>
            <div style={{ fontSize: 80 }}>
                {cell.piece ? cell.piece.symbol : ""}
            </div>
        </div>        
    }
    return <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 24 }}>
                {gameState.turn == Color.WHITE ? "White's turn" : "Black's turn"}
            </div>
            <div style={{ fontSize: 24 }} onClick={() => {
                gameState.undo()
                updateGameState()
            }}>
                Undo
            </div>
        </div>
        <div style={{ margin: 20, display: 'flex', flexDirection: 'column' }}>
            {gameState.board.slice().reverse().map((row, index) => {
                return <div key={gameState.board.length - index - 1} style={{ display: 'flex', flexDirection: 'row' }}>
                    {row.map((cell, index) => {
                        return renderCell(cell)
                    })}
                </div>
            })}
        </div>
    </div>
    ;
};
