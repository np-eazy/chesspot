import { Color, Board } from "./Board";
import { Piece, PieceType } from "./Piece";
import { Move, MoveType, getCapturedPiece, isCapturingMove, isEquivalentMove, oppositeOf } from "./utils/moveUtils";

export enum GameCondition {
    NORMAL = "",
    CHECK = "CHECK",
    CHECKMATE = "CHECKMATE",
    STALEMATE = "STALEMATE",
    REPETITION = "DRAW BY REPETITION",
    INSUFFICIENT_MATERIAL = "DRAW BY INSUFFICIENT MATERIAL",
    FIFTY_MOVES_RULE = "DRAW BY HUNDRED MOVES RULE",
    PENDING_PROMOTION = "PENDING PROMOTION",
}

export const inCheck = (board: Board, color: Color): boolean => {
    const king = board.pieces.find(piece => piece && (piece.type == PieceType.KING) && (piece.color == color));
    return king!.square.isAttackedBy(oppositeOf(color));
}

export const evaluateGameCondition = (board: Board): GameCondition => {
    // Check for 50-move rule.
    if (board.moveHistory.length >= 100) {
        const lastMoves: Move[] = board.moveHistory.slice(board.moveHistory.length - 100, board.moveHistory.length)
        if (!lastMoves.find(move => getCapturedPiece(move) != undefined)) {
            return GameCondition.FIFTY_MOVES_RULE
        }
    }
    // Check for threefold repetition.
    if (board.moveHistory.length >= 9) {
        const lastMoves: Move[] = board.moveHistory.slice(board.moveHistory.length - 9, board.moveHistory.length)
        if (
            isEquivalentMove(lastMoves[0], lastMoves[4])
            && isEquivalentMove(lastMoves[1], lastMoves[5])
            && isEquivalentMove(lastMoves[2], lastMoves[6])
            && isEquivalentMove(lastMoves[3], lastMoves[7])
            && isEquivalentMove(lastMoves[4], lastMoves[8])
        ) {
            return GameCondition.REPETITION
        }
    }
    if (inCheck(board, board.toMove)) {
        return GameCondition.CHECK
    }
    // TODO: Fix checkmate and stalemate


    // Check for insufficient material
    const totalMaterial = Piece.totalMaterial(board.getPiecesFromColor(board.toMove))
    const totalOpMaterial = Piece.totalMaterial(board.getPiecesFromColor(oppositeOf(board.toMove)))
    if ((!board.findPieces(board.toMove, PieceType.PAWN) && totalMaterial < 5)
        && (!board.findPieces(oppositeOf(board.toMove), PieceType.PAWN) && totalOpMaterial < 5)) {
        return GameCondition.INSUFFICIENT_MATERIAL
    }
    // Check for pending promotion
    const lastMove = board.moveHistory[board.moveHistory.length - 1];
    const swap = lastMove.swaps.filter(swap => swap.piece && swap.from && swap.to)[0];
    if (swap
        && lastMove.moveType == MoveType.NORMAL
        && !isCapturingMove(lastMove)
        && swap.piece?.isType(PieceType.PAWN)
        && swap.to!.rank == swap.piece.promotionRank()) {
        return GameCondition.PENDING_PROMOTION
    }
    return GameCondition.NORMAL
}
