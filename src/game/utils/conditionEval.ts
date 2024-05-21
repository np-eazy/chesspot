import { Color, GameCondition, GameState, Move, MoveType, Swap } from "../GameState";
import { Piece, PieceType } from "../Piece";
import { getAllLegalMoves, getCapturedPiece, isEquivalentMove, oppositeOf } from "./moveUtils";

export const inCheck = (gameState: GameState, color: Color): boolean => {
    const king = gameState.pieces.find(piece => piece && (piece.type == PieceType.KING) && (piece.color == color));
    return king!.square.isAttackedBy(oppositeOf(color)) ?? false;
}

export const evaluateGameCondition = (gameState: GameState): GameCondition => {
    // Check for 100-move rule.
    if (gameState.moveHistory.length >= 199) {
        const lastMoves: Move[] = gameState.moveHistory.slice(gameState.moveHistory.length - 199, gameState.moveHistory.length)
        if (!lastMoves.find(move => getCapturedPiece(move) != undefined)) {
            return GameCondition.HUNDRED_MOVES_RULE
        }
    }
    // Check for three-fold repetition.
    if (gameState.moveHistory.length >= 9) {
        const lastMoves: Move[] = gameState.moveHistory.slice(gameState.moveHistory.length - 9, gameState.moveHistory.length)
        if (
            isEquivalentMove(lastMoves[0], lastMoves[4]) && isEquivalentMove(lastMoves[4], lastMoves[8])
            && isEquivalentMove(lastMoves[1], lastMoves[5])
            && isEquivalentMove(lastMoves[2], lastMoves[6])
            && isEquivalentMove(lastMoves[3], lastMoves[7])
        ) {
            return GameCondition.REPETITION
        }
    }
    // Check for check and checkmate.
    const legalMoves = getAllLegalMoves(gameState)
    const currColor = gameState.toMove
    const preventCheck: Move[] = []
    if (inCheck(gameState, currColor)) {
        legalMoves.forEach(move => {
            gameState.executeSwaps(move, false) // Promotions don't need to be amended in these checks; if the pawn blocks/captures a check, so will its promotion.
            if (!inCheck(gameState, currColor)) {
                preventCheck.push(move)
            }
            gameState.undo()
        })
        if (preventCheck.length == 0) {
            return GameCondition.CHECKMATE
        } else {
            return GameCondition.CHECK   
        }
    }
    // Check for stalemate.
    const piecesToMove = gameState.pieces.filter(piece => piece && piece.color == gameState.toMove)
    let hasLegalMoves = false
    piecesToMove.forEach(piece => {
        if (piece.getLegalSquares(gameState).length > 0) {
            hasLegalMoves = true
        }
    })
    if (!hasLegalMoves) {
        return GameCondition.STALEMATE
    }
    // Check for insufficient material
    const totalMaterial = piecesToMove.filter(piece => piece.color == gameState.toMove).map(piece => piece.materialValue).reduce((acc, curr) => acc + curr, 0)
    const totalOpMaterial = piecesToMove.filter(piece => piece.color == oppositeOf(gameState.toMove)).map(piece => piece.materialValue).reduce((acc, curr) => acc + curr, 0)
    if (!((piecesToMove.filter(piece => piece.type == PieceType.PAWN).length == 0 || totalMaterial >= 5) 
        || (piecesToMove.filter(piece => piece.type == PieceType.PAWN).length == 0 || totalOpMaterial >= 5))) {
        return GameCondition.INSUFFICIENT_MATERIAL
    }
    // Check for pending promotion
    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    const swap = lastMove.swaps.filter(swap => swap.piece && swap.from && swap.to)[0];
    if (swap 
        && lastMove.moveType == MoveType.NORMAL
        && swap.piece && swap.piece.type == PieceType.PAWN
        && swap.to && swap.to.rank == (swap.piece.color == Color.WHITE ? 8 : 1)) {
            return GameCondition.PENDING_PROMOTION
    }
    return GameCondition.NORMAL
}
