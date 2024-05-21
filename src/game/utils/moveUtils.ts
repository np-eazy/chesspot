import { ValidatedGameState, Move, MoveType, Swap } from "../GameState"
import { Piece, PieceType } from "../Piece"

export const oppositeOf = (color: number) => {
    return color * -1
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
            && piece.validateAndGetMoveType(gameState, piece.square, gameState.square(toRank, toFile), false) != MoveType.INVALID)
        if (ambiguousPieces.length > 0) {
            isAmbiguous = true;
        }
    }, 1)
    return isAmbiguous;
}