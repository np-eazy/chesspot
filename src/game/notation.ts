import { GameCondition, GameState, Move, MoveType } from "./GameState";
import { Piece, PieceType } from "./Piece";
import { evaluateGameCondition } from "./utils/conditionEval";
import { getCapturedPiece } from "./utils/moveUtils";
import { notateFile, notateCoords, notatePieceType, parseCoords, parseFile, parseRank, getPieceType } from "./utils/notationUtils";

export const compileRawMoves = (moves: string[]): GameState => {
    const gameState = new GameState();
    try {
        moves.forEach(move => {
            const validPieces: Piece[] = [];
            let movingPiece: Piece
            let toRank: number = 0;
            let toFile: number = 0;
            let promotion: PieceType | null = null;
            try {
                if (move == "O-O" || move == "0-0") {
                    validPieces.push(...gameState.pieces.filter(piece => piece.type == PieceType.KING && piece.color == gameState.toMove));
                    movingPiece = validPieces[0];
                    toRank = validPieces[0].square.rank;
                    toFile = validPieces[0].square.file + 2;
                } else if (move === "O-O-O" || move === "0-0-0") {
                    validPieces.push(...gameState.pieces.filter(piece => piece.type == PieceType.KING && piece.color == gameState.toMove));
                    movingPiece = validPieces[0];
                    toRank = validPieces[0].square.rank;
                    toFile = validPieces[0].square.file - 2;
                } else {
                    if (/^[a-h].*$/.test(move)) {
                        if (/^[a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(0, 2))!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == PieceType.PAWN 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[a-h][x][a-h][1-8].*$/.test(move)) {
                            const fromFile = parseFile(move[0])!;
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == PieceType.PAWN 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.square.file == fromFile
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else {
                            throw new Error("Unable to regex-parse pawn move");
                        }
                        if (/^.*[=][NBRQ].*$/.test(move)) {
                            promotion = getPieceType((move.split("="))[1]![0])!;
                        }
                    } else {
                        move = move.replace("x","");
                        const pieceType = getPieceType(move[0])!;
                        if (/^[NBRQK][a-h][1-8].*$/.test(move) && !(/^[NBRQK][a-h][1-8][a-h][1-8].*$/.test(move))) {
                            [toFile, toRank] = parseCoords(move.slice(1, 3))!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == pieceType 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][a-h][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            const fromFile = parseFile(move[1])!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == pieceType 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.square.file == fromFile
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][1-8][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            const fromRank = parseRank(move[1])!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == pieceType 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.square.rank == fromRank
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][a-h][1-8][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(3,5))!;
                            const [fromFile, fromRank] = parseCoords(move.slice(1, 3))!;
                            movingPiece = gameState.square(fromRank, fromFile).piece!;
                        } else {
                            throw new Error("Unable to regex-parse piece move");
                        }
                    }
                }
                gameState.manualMove(movingPiece!.square, gameState.square(toRank, toFile));
                if (promotion) {
                    gameState.amendPromotionMove(promotion);
                }
            } catch (e) {
                console.error(e);
            }
        });
    } catch (e) {
        console.error(e);
    }
    return gameState;
}
export const ambiguityCheck = (gameState: GameState, movingPiece: Piece) => {
    const toRank = movingPiece.square.rank;
    const toFile = movingPiece.square.file;
    let isAmbiguous = false;
    gameState.historyCallback((gameState: GameState) => {
        const ambiguousPieces = gameState.pieces.filter(piece => 
            piece.type == movingPiece.type 
            && piece != movingPiece
            && !piece.isCaptured
            && piece.color == movingPiece.color 
            && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID)
        if (ambiguousPieces.length > 0) {
            isAmbiguous = true;
        }
    }, 1)
    return isAmbiguous;
}
export const notateLastMove = (gameState: GameState): string => {
    const move = gameState.moveHistory[gameState.moveHistory.length - 1];
    if (move.moveType == MoveType.CASTLE) {
        const kingSwap = move.swaps.find(swap => swap.piece?.type == PieceType.KING)!;
        return (kingSwap.to!.file > kingSwap.from!.file) ? "O-O" : "O-O-O";
    }
    let movingPiece: Piece;
    let capturedPiece: Piece | undefined = undefined;
    let promotionPiece: Piece | undefined = undefined;
    if (move.moveType == MoveType.PROMOTION) {
        movingPiece = move.swaps.find(swap => swap.piece?.type == PieceType.PAWN)!.piece!;
        promotionPiece = move.swaps.find(swap => !swap.from)!.piece;
    } else {
        movingPiece = move.swaps.find(swap => swap.to)!.piece!;
        capturedPiece = getCapturedPiece(move);
    }

    let notation = "";
    if (movingPiece.type == PieceType.PAWN) {
        if (capturedPiece) {
            gameState.historyCallback((gameState: GameState) => {
                notation = notateFile(movingPiece.square.file) + "x"
            }, 1);
        } 
        notation += notateCoords(movingPiece.square.rank, movingPiece.square.file)
        if (move.moveType == MoveType.PROMOTION) {
            notation += "=" + notatePieceType(promotionPiece!.type);
        }
    } else {
        notation += notatePieceType(movingPiece.type);
        if (ambiguityCheck(gameState, movingPiece)) {
            gameState.historyCallback((gameState: GameState) => {
                notation += notateCoords(movingPiece.square.rank, movingPiece.square.file);
            }, 1);
        }
        if (capturedPiece) {
            notation += "x";
        }
        notation += notateCoords(movingPiece.square.rank, movingPiece.square.file)
    }
    const gameCondition = evaluateGameCondition(gameState);
    if (gameCondition == GameCondition.CHECKMATE) {
        notation += "#";
    } else if (gameCondition == GameCondition.CHECK) {
        notation += "+";
    } else if (gameCondition == GameCondition.STALEMATE 
        || gameCondition == GameCondition.REPETITION
        || gameCondition == GameCondition.INSUFFICIENT_MATERIAL
        || gameCondition == GameCondition.HUNDRED_MOVES_RULE) {
        notation += "=";
    }
    if (move.moveType == MoveType.EN_PASSANT) {
        notation += " (e.p.)";
    }
    return notation
}
export const notateGame = (gameState: GameState): string => {
    const moveHistory = gameState.moveHistory;
    const pairedMoves: [string, string][] = [];
    for (let i = 0; i <= moveHistory.length / 2; i++) {
        pairedMoves.push([
            moveHistory[i * 2]?.notation ?? "",
            moveHistory[i * 2 + 1]?.notation ?? ""
        ]);
    }
    return pairedMoves.map((move, i) => {
        return `${i + 1}. ${move[0]} ${move[1]}`
    }).join(" ");
}
