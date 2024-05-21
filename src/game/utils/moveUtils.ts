import { GameState, Move, MoveType, Swap } from "../GameState"
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

export const getAllLegalMoves = (gameState: GameState) => {
    const piecesToMove = gameState.pieces.filter(piece => piece && piece.color == gameState.toMove && !piece.isCaptured)
    const legalMoves: Move[] = []
    piecesToMove.forEach(piece => {
        piece.getLegalSquares(gameState).forEach(legalSquare => {
            legalMoves.push({
                moveType: piece.validateAndGetMoveType(gameState, piece.square, legalSquare, false),
                swaps: [{
                    piece: piece,
                    from: piece.square,
                    to: legalSquare
                }]
            })
        })
    })
    return legalMoves
}

