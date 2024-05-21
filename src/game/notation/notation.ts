import { GameCondition, GameState, MoveType } from "../GameState";
import { Piece, PieceType } from "../Piece";
import { evaluateGameCondition } from "../utils/conditionEval";
import { ambiguityCheck, getCapturedPiece, oppositeOf } from "../utils/moveUtils";
import { notateFile, notateCoords, notatePieceType, parseCoords, parseFile, parseRank, getPieceType, extractRawMoves } from "./notationUtils";
 
export const compileRawMoves = (moves: string[]): GameState => {
    const gameState = new GameState();
    try {
        moves.forEach(move => {
            const validPieces: Piece[] = [];
            let movingPiece: Piece
            let toRank: number = 0;
            let toFile: number = 0;
            let promotion: PieceType | undefined;
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
                        // TODO: There exists an edge case with en passant; there are cases where doubled pawns can capture, one normally and one en passant.
                        if (/^[a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(0, 2))!;
                            movingPiece = gameState.pieces.find(piece => 
                                piece.type == PieceType.PAWN 
                                && !piece.isCaptured
                                && piece.color == gameState.toMove
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID
                                && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.EN_PASSANT
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
                            promotion = getPieceType((move.split("="))[1]![0]) ?? undefined;
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
        promotionPiece = move.swaps.find(swap => !swap.from && swap.piece!.color == movingPiece.color)!.piece;
        capturedPiece = move.swaps.find(swap => !swap.to && swap.piece!.color == oppositeOf(movingPiece.color))?.piece;
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
        if (move.moveType == MoveType.PROMOTION) {
            notation += notateCoords(promotionPiece!.square.rank, promotionPiece!.square.file)
            notation += "=" + notatePieceType(promotionPiece!.type);
        } else {
            notation += notateCoords(movingPiece.square.rank, movingPiece.square.file)
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
        notation += " e.p.";
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
export const compilePGN = (pgn: string): GameState => {
    // TODO: Process further info
    // TODO: Remove bracketed/annotated information between moves
    const splits = pgn.split("]");
    const rawMoves = splits[splits.length - 1];
    return compileRawMoves(extractRawMoves(rawMoves));
}


