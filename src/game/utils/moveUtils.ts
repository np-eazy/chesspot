import { ValidatedGameState, Move, MoveType, Swap, Color } from "../GameState"
import { Piece, PieceType } from "../Piece"
import { Square } from "../Square"

export const oppositeOf = (color: number) => {
    return color * -1
}

export const outOfBounds = (gameState: ValidatedGameState, rank: number, file: number): boolean => {
    return rank < 1 || rank > 8 || file < 1 || file > 8
}

export const rankDiff = (from: Square, to: Square): number => {
    return to.rank - from.rank
}

export const fileDiff = (from: Square, to: Square): number => {
    return to.file - from.file
}

export const rankDxn = (from: Square, to: Square): number => {
    return to.rank > from.rank ? 1 : -1
}

export const fileDxn = (from: Square, to: Square): number => {
    return to.file > from.file ? 1 : -1
}

export const colorDxn = (color: Color | Piece) => {
    if (color instanceof Piece) {
        return color.color == Color.WHITE ? 1 : -1
    }
    return color == Color.WHITE ? 1 : -1
}

export const sameFileSwap = (swap: Swap) => {
    if (!swap.from || !swap.to) {
        return false
    }
    return swap.from.sameFileAs(swap.to)
}

export const sameRankSwap = (swap: Swap) => {
    if (!swap.from || !swap.to) {
        return false
    }
    return swap.from.sameRankAs(swap.to)
}

export const fileSwapDiff = (swap: Swap) => {
    return swap.to!.file - swap.from!.file
}

export const rankSwapDiff = (swap: Swap) => {
    return swap.to!.rank - swap.from!.rank
}

export const isCapturingMove = (move: Move) => {
    return move.swaps.length > 1
}

export const isCapturingSwap = (swap: Swap) => {
    return !swap.to
}

export const isPromotingSwap = (swap: Swap) => {
    return !swap.to
}

export const getCapturedPiece = (move: Move): Piece | undefined => {
    if (move.moveType == MoveType.PROMOTION) {
        return move.swaps.find(swap => !swap.to && swap.piece!.type == PieceType.PAWN)?.piece
    } else {
        return move.swaps.find(swap => !swap.to)?.piece
    }
}

export const isEquivalentMove = (moveA: Move, moveB: Move): boolean => {
    return moveA.moveType == moveB.moveType 
        && moveA.swaps.length == moveB.swaps.length
        && moveA.swaps.map((swap: Swap): boolean => {
            return moveB.swaps.find((swapB: Swap) => {
                return (swapB.piece === swap.piece)
                    && (swapB.from === swap.from)
                    && (swapB.to === swap.to)
            }) != undefined
        }).reduce((acc, curr) => acc && curr, true)
}

export const ambiguityCheck = (gameState: ValidatedGameState, movingPiece: Piece) => {
    const toRank = movingPiece.square.rank;
    const toFile = movingPiece.square.file;
    let isAmbiguous = false;
    gameState.historyCallback((gameState: ValidatedGameState) => {
        const ambiguousPieces = gameState.pieces.filter(piece => 
            piece.type == movingPiece.type 
            && piece != movingPiece
            && !piece.isCaptured
            && piece.color == movingPiece.color 
            && piece.validateAndGetMoveType(piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID)
        if (ambiguousPieces.length > 0) {
            isAmbiguous = true;
        }
    }, 1)
    return isAmbiguous;
}
