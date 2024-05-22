import { Color, GameCondition, ValidatedGameState, Move, MoveType, Swap } from "../GameState";
import { Pawn, Piece, PieceType } from "../Piece";
import { getCapturedPiece, isCapturingMove, isEquivalentMove, oppositeOf } from "./moveUtils";

export const inCheck = (gameState: ValidatedGameState, color: Color): boolean => {
    const king = gameState.pieces.find(piece => piece && (piece.type == PieceType.KING) && (piece.color == color));
    return king!.square.isAttackedBy(oppositeOf(color));
}

export const evaluateGameCondition = (gameState: ValidatedGameState): GameCondition => {
    // Check for 50-move rule.
    if (gameState.moveHistory.length >= 100) {
        const lastMoves: Move[] = gameState.moveHistory.slice(gameState.moveHistory.length - 100, gameState.moveHistory.length)
        if (!lastMoves.find(move => getCapturedPiece(move) != undefined)) {
            return GameCondition.FIFTY_MOVES_RULE
        }
    }

    if (gameState.moveHistory.length >= 9) {
        const lastMoves: Move[] = gameState.moveHistory.slice(gameState.moveHistory.length - 9, gameState.moveHistory.length)
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
    // TODO: refactor piece selection using new getPieces() in gameState
    if (inCheck(gameState, gameState.toMove)) {
        return GameCondition.CHECK
    }
    // TODO: Fix checkmate and stalemate

    
    // Check for insufficient material
    const totalMaterial = Piece.totalMaterial(gameState.getPiecesFromColor(gameState.toMove))
    const totalOpMaterial = Piece.totalMaterial(gameState.getPiecesFromColor(oppositeOf(gameState.toMove)))
    if ((!gameState.findPieces(gameState.toMove, PieceType.PAWN) && totalMaterial < 5) 
        && (!gameState.findPieces(oppositeOf(gameState.toMove), PieceType.PAWN) && totalOpMaterial < 5)) {
        return GameCondition.INSUFFICIENT_MATERIAL
    }
    // Check for pending promotion
    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
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
