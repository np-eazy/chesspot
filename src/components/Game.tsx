import { useEffect, useState } from "react";
import { Color } from "../game/Board";
import { ManualBoard, MoveStage } from "../game/ui/ManualBoard";
import { Square, SquareColor } from "../game/Square";
import PromotionPanel from "./PromotionPanel";
import { compileRawMoves } from "../game/notation/compileAndNotateMoves";
import { extractRawMoves } from "../game/notation/notationUtils";
import { Notation } from "./Notation";
import { ITALIAN_OPENING } from "../game/test/testGames";
import { DARK_SQUARE, FONT, GREEN, LIGHT_SQUARE, RED } from "../graphics/colors";
import { RGBColor } from "../graphics/utils";
import { oppositeOf } from "../game/utils/moveUtils";
import { PieceType } from "../game/Piece";
import { inCheck } from "../game/GameCondition";
import { notateGame } from "../game/notation/compileAndNotateFiles";

export const Game = () => {
    const [board, setBoard] = useState<ManualBoard>(
        new ManualBoard(compileRawMoves(extractRawMoves(ITALIAN_OPENING)))
    )
    const [gameTick, setGameTick] = useState<number>(0)
    const [inputText, setInputText] = useState("");
    const [mouseHover, setMouseHover] = useState(false)
        
    useEffect(() => {
        const interval = setInterval(() => {
            setGameTick((prevTick) => prevTick + 1);
        }, 10); // Update game tick every second
        setGameTick(gameTick + 1)
        return () => clearInterval(interval);
    }, []);

    const updateBoard = () => {
        setBoard(board)
        setGameTick(gameTick + 1)
    }

    const side = false;

    const renderSquare = (square: Square) => {
        const speed = 0.05;
        const multiplierA = Math.sin(gameTick * speed) * 0.2 * (true ? 1 : -1) + 0.8 * (true ? 1 : -1);
        const multiplierB = Math.cos(gameTick * speed) * 0.2 * (true ? 1 : -1) + 0.8 * (true ? 1 : -1);

        const baseColor: RGBColor = LIGHT_SQUARE.copy();
        const baseSquareColor: RGBColor = (square.color == SquareColor.DARK ? DARK_SQUARE : LIGHT_SQUARE).copy();

        const green = true ? Color.WHITE : Color.BLACK;
        const greenPieces = square.targetingPieces.get(green)!.length;
        const redPieces = square.targetingPieces.get(oppositeOf(green))!.length;
        if (greenPieces > redPieces) {
            baseSquareColor.addScaledColor(GREEN, 0.1 * (board.toMove == oppositeOf(green) ? 1 : multiplierA));
        } else if (redPieces > greenPieces) {
            baseSquareColor.addScaledColor(RED, 0.1 * (board.toMove == green ? 1 : multiplierB));
        }
        if (square.piece && (square.piece.color == green) && (greenPieces == 0)) {
            baseColor.addScaledColor(RED, 1);
        }

        const hoverPiece = mouseHover ? square.piece : null;
        if (board.selectedSquare == square) {
            if (board.toMove == green) {
                baseColor.addScaledColor(GREEN, 1);
                baseSquareColor.addScaledColor(GREEN, 0.1 * multiplierA);
            } else {
                baseColor.addScaledColor(RED, 1);
                baseSquareColor.addScaledColor(RED, 0.1 * multiplierB);
            }
        }
        for (let _ = 0; _ < square.targetingPieces.get(green)!.length; _++) {
            if (!inCheck(board, green)) {
                const piece = square.targetingPieces.get(green)!.find(piece => 
                    piece == board.selectedSquare?.piece);
                baseColor.addScaledColor(GREEN, piece ? 1 : 0.2 * multiplierA);
                baseSquareColor.addScaledColor(GREEN, piece ? 0.04 * multiplierA : 0.02);
            }
        }
        for (let _ = 0; _ < square.targetingPieces.get(oppositeOf(green))!.length; _++) {
            const piece = square.targetingPieces.get(oppositeOf(green))!.find(piece => piece == board.selectedSquare?.piece);
            baseColor.addScaledColor(RED, piece ? 0.2 : 0.05 * multiplierB);
            // baseSquareColor.addScaledColor(RED, piece ? 0.04 * multiplierB : 0.02);
        }
        if (inCheck(board, green)) {
            const king = board.pieces.find(piece => piece.color == green && piece.type == PieceType.KING);
            if (square == king!.square) {
                baseColor.addScaledColor(RED, 0.5 * multiplierB);
                // baseSquareColor.addScaledColor(RED, 0.02 * multiplierB);
            }
        }
        const fontBase = FONT.copy()
        if (square.piece) {
            fontBase.addScaledColor(square.piece.color == green ? GREEN : RED, 1);
        }
        return <div style={{
                border: "4px solid",
                borderColor: baseSquareColor.getHex(),
                display: "flex",
                justifyContent: "center"
            }}>
            <div key={square.rank * 8 + square.file} style={{
                width: 100,
                height: 100,
                border: "1px solid",
                borderColor: baseColor.getHex(),
                backgroundColor: baseSquareColor.getHex(),
                display: "flex",
                justifyContent: "center"
            }} 
            onMouseEnter={() => {
                setMouseHover(true)
            }}
            onMouseLeave={() => {
                setMouseHover(false)
            }}
            onMouseDown={() => {
                board.selectAndAdvance(square)
                updateBoard()
            }}>
                <div>
                    {/* <div style={{ fontSize: 12 }}>
                        {square.targetingPieces.get(Color.WHITE)!.map(piece => piece.symbol).join(" ")}
                        {square.targetingPieces.get(Color.BLACK)!.map(piece => piece.symbol).join(" ")}
                    </div> */}
                    <div style={{ fontSize: 100, color: fontBase.getHex() }}>
                        {square.piece ? square.piece.symbol : ""}
                    </div>
                </div>
            </div>
        </div>
        
                
    }


    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    };

    const handleSubmit = () => {
        setBoard(new ManualBoard(compileRawMoves(extractRawMoves(inputText))))
        // Additional logic to handle the submitted text can be added here
    };

    return <div>
    <div style={{minHeight: 100}}></div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'top', justifyContent: 'space-between', width: 1000}}>
            <div style={{minWidth: 200}}>
                <div style={{minHeight: 100}}></div>
                <div>
                    {board.toMove == Color.WHITE ? "White's turn" : "Black's turn"}
                </div>
                <div>
                    {board.condition}
                </div>
                <div style={{minHeight: 200}}></div>
                <div style={{ fontSize: 24 }} onClick={() => {
                    board.undo()
                    updateBoard()
                }}>
                    Undo
                </div>  
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {true ? 
                    board.squares.slice().reverse().map((row, index) => {
                        return <div key={board.squares.length - index - 1} style={{ display: 'flex', flexDirection: 'row' }}>
                            {row.map((square, index) => {
                                return renderSquare(square)
                            })}
                        </div>
                    }) : 
                    board.squares.map((row, index) => {
                        return <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                            {row.slice().reverse().map((square) => {
                                return renderSquare(square)
                            })}
                        </div>
                    })
                }
            </div>
            <div style={{ marginLeft: 10, minWidth: 400,  }}>
                <div style={{ width: "100%" }}>
                    {board.moveStage === MoveStage.PROMOTING &&
                    <PromotionPanel 
                        board={board} 
                        callback={() => {
                            updateBoard()
                        }}
                    />}
                </div>
                <div style={{minHeight: 100}}></div>
                <Notation board={board} />
                <div style={{minHeight: 100}}></div>
                <div style={{ marginRight: 10, height: 500 }}>
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
                    {board.debugDump()}
                </div>
            </div>
        </div>
        <div>
            {notateGame(board)}
        </div>
    </div>
    ;
};
