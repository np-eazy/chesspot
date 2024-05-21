import { useState } from "react";
import { Color, GameState, MoveStage } from "../game/GameState";
import { Square, SquareColor } from "../game/Square";
import PromotionPanel from "./PromotionPanel";
import { compilePGN as compileGameStateFromPGN, compileRawMoves, notateGame } from "../game/notation/notation";
import { extractRawMoves } from "../game/notation/notationUtils";
import { Notation } from "./Notation";
import { KASPAROV_V_ANAND, EN_PASSANT_TEST, KASPAROV_V_TOPALOV, MORPHY_V_KARL, PROMOTION_TEST } from "../game/test/testGames";

export const Game = () => {
    const [gameState, setGameState] = useState<GameState>(
        compileRawMoves(extractRawMoves(EN_PASSANT_TEST))

    )
    const [gameTick, setGameTick] = useState<number>(0)
    const [inputText, setInputText] = useState("");


    const updateGameState = () => {
        setGameState(gameState)
        setGameTick(gameTick + 1)
    }

    const renderSquare = (square: Square) => {
        return <div key={square.rank * 8 + square.file} style={{
            width: 100,
            height: 100,
            border: square.isSelected ? "1px solid blue" : "none",
            backgroundColor: square.color == SquareColor.DARK ? "#dddddd" : "#ffffff",
            display: "flex",
            justifyContent: "center"
        }} onMouseDown={() => {
            // TODO: Make sure only one square is selected
            gameState.selectAndAdvance(square)
            updateGameState()
        }}>
            <div style={{ fontSize: 12 }}>
                {square.targetingPieces.get(Color.WHITE)!.map(piece => piece.symbol).join(" ")}
                {square.targetingPieces.get(Color.BLACK)!.map(piece => piece.symbol).join(" ")}
            </div>
            <div style={{ fontSize: 80 }}>
                {square.piece ? square.piece.symbol : ""}
            </div>
        </div>        
    }


    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    };

    const handleSubmit = () => {
        setGameState(compileGameStateFromPGN(inputText))
        // Additional logic to handle the submitted text can be added here
    };

    return <div>
            <div>
                <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Enter text here..."
                    rows={5}
                    cols={33}
                />
                <button onClick={handleSubmit}>Submit</button>
            </div>
        <div>
            {gameState.condition}
        </div>
        {gameState.moveStage === MoveStage.PROMOTING &&
        <PromotionPanel 
            gameState={gameState} 
            callback={() => {
                updateGameState()
            }}
        />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 24 }}>
                {gameState.toMove == Color.WHITE ? "White's turn" : "Black's turn"}
            </div>
            <div style={{ fontSize: 24 }} onClick={() => {
                gameState.undo()
                updateGameState()
            }}>
                Undo
            </div>
        </div>
        <div style={{ margin: 20, display: 'flex', flexDirection: 'column' }}>
            {gameState.toMove == Color.WHITE ? 
                gameState.board.slice().reverse().map((row, index) => {
                    return <div key={gameState.board.length - index - 1} style={{ display: 'flex', flexDirection: 'row' }}>
                        {row.map((square, index) => {
                            return renderSquare(square)
                        })}
                    </div>
                }) : 
                gameState.board.map((row, index) => {
                    return <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                        {row.slice().reverse().map((square) => {
                            return renderSquare(square)
                        })}
                    </div>
                })
            }
        </div>
        {/* <Notation gameState={gameState} /> */}
        <div>
            {notateGame(gameState)}
        </div>
    </div>
    ;
};
