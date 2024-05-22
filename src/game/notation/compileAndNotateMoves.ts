import { Board } from "../Board";
import { Piece, PieceType } from "../Piece";
import { GameCondition, evaluateGameCondition } from "../GameCondition";
import { MoveType, ambiguityCheck, getCapturedPiece, getMovingPiece, getPromotingPiece } from "../utils/moveUtils";
import { initializeFEN } from "./compileAndNotateFiles";
import { notateFile, notateCoords, notatePieceType, parseCoords, parseFile, parseRank, getPieceType } from "./notationUtils";
import { STANDARD_FEN } from "./standardFEN";

/**
 * Compiles raw moves into a board object.
 * @param moves The raw moves to compile; these are all in standard chess notation.
 * @returns The board object.
 */
export const compileRawMoves = (moves: string[]): Board => {
    const board = new Board();
    initializeFEN(board, STANDARD_FEN);
    try {
        moves.forEach(move => {
            const validPieces: Piece[] = [];
            let movingPiece: Piece
            let toRank: number = 0;
            let toFile: number = 0;
            let promotion: PieceType | undefined;
            try {
                if (move == "O-O" || move == "0-0") {
                    validPieces.push(board.findPieces(board.toMove, PieceType.KING)! as Piece);
                    movingPiece = validPieces[0];
                    toRank = validPieces[0].square.rank;
                    toFile = validPieces[0].square.file + 2;
                } else if (move === "O-O-O" || move === "0-0-0") {
                    validPieces.push(board.findPieces(board.toMove, PieceType.KING)! as Piece);
                    movingPiece = validPieces[0];
                    toRank = validPieces[0].square.rank;
                    toFile = validPieces[0].square.file - 2;
                } else {
                    if (/^[a-h].*$/.test(move)) {
                        if (/^[a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(0, 2))!;
                            movingPiece = board.pieces.find(piece =>
                                piece.type == PieceType.PAWN
                                && !piece.isCaptured
                                && piece.color == board.toMove
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.EN_PASSANT
                            )!;
                        } else if (/^[a-h][x][a-h][1-8].*$/.test(move)) {
                            const fromFile = parseFile(move[0])!;
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            movingPiece = board.pieces.find(piece =>
                                piece.type == PieceType.PAWN
                                && !piece.isCaptured
                                && piece.color == board.toMove
                                && piece.square.file == fromFile
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else {
                            throw new Error("Unable to regex-parse pawn move");
                        }
                        if (/^.*[=][NBRQ].*$/.test(move)) {
                            promotion = getPieceType((move.split("="))[1]![0]) ?? undefined;
                        }
                    } else {
                        move = move.replace("x", "");
                        const pieceType = getPieceType(move[0])!;
                        if (/^[NBRQK][a-h][1-8].*$/.test(move) && !(/^[NBRQK][a-h][1-8][a-h][1-8].*$/.test(move))) {
                            [toFile, toRank] = parseCoords(move.slice(1, 3))!;
                            movingPiece = board.pieces.find(piece =>
                                piece.type == pieceType
                                && !piece.isCaptured
                                && piece.color == board.toMove
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][a-h][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            const fromFile = parseFile(move[1])!;
                            movingPiece = board.pieces.find(piece =>
                                piece.type == pieceType
                                && !piece.isCaptured
                                && piece.color == board.toMove
                                && piece.square.file == fromFile
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][1-8][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(2, 4))!;
                            const fromRank = parseRank(move[1])!;
                            movingPiece = board.pieces.find(piece =>
                                piece.type == pieceType
                                && !piece.isCaptured
                                && piece.color == board.toMove
                                && piece.square.rank == fromRank
                                && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID
                            )!;
                        } else if (/^[NBRQK][a-h][1-8][a-h][1-8].*$/.test(move)) {
                            [toFile, toRank] = parseCoords(move.slice(3, 5))!;
                            const [fromFile, fromRank] = parseCoords(move.slice(1, 3))!;
                            movingPiece = board.square(fromRank, fromFile).piece!;
                        } else {
                            throw new Error("Unable to regex-parse piece move");
                        }
                    }
                }
                board.attemptMove(movingPiece!.square, board.square(toRank, toFile));
                if (promotion) {
                    board.amendPromotionMove(promotion);
                }
            } catch (e) {
                console.error(e);
            }
        });
    } catch (e) {
        console.error(e);
    }
    return board;
}

/**
 * Notates the last move in the given board; because the board doesn't take snapshots, only the most recent move can be properly notated with certainty.
 * @param board The board to notate
 * @returns The last move in standard chess notation.
 */
export const notateLastMove = (board: Board): string => {
    const move = board.moveHistory[board.moveHistory.length - 1];
    if (move.moveType == MoveType.CASTLE) {
        const kingSwap = move.swaps.find(swap => swap.piece?.type == PieceType.KING)!;
        return (kingSwap.to!.file > kingSwap.from!.file) ? "O-O" : "O-O-O";
    }
    const movingPiece: Piece = getMovingPiece(move);
    const capturedPiece: Piece | undefined = getCapturedPiece(move);
    const promotionPiece: Piece | undefined = getPromotingPiece(move);

    let notation = "";
    if (movingPiece.type == PieceType.PAWN) {
        if (capturedPiece) {
            board.historyCallback((board: Board) => {
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
        if (ambiguityCheck(board, movingPiece)) {
            board.historyCallback((board: Board) => {
                notation += notateCoords(movingPiece.square.rank, movingPiece.square.file);
            }, 1);
        }
        if (capturedPiece) {
            notation += "x";
        }
        notation += notateCoords(movingPiece.square.rank, movingPiece.square.file)
    }
    const gameCondition = evaluateGameCondition(board);
    if (gameCondition == GameCondition.CHECKMATE) {
        notation += "#";
    } else if (gameCondition == GameCondition.CHECK) {
        notation += "+";
    } else if (gameCondition == GameCondition.STALEMATE
        || gameCondition == GameCondition.REPETITION
        || gameCondition == GameCondition.INSUFFICIENT_MATERIAL
        || gameCondition == GameCondition.FIFTY_MOVES_RULE) {
        notation += "=";
    }
    if (move.moveType == MoveType.EN_PASSANT) {
        notation += " e.p.";
    }
    return notation
}
