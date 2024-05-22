import { Board, Color } from "../Board"
import { Piece, PieceType } from "../Piece"
import { Square } from "../Square"

// Each move consists of one or more swaps, and at least one swap must have all three attributes.
export type Swap = {
    piece?: Piece, // If this is undefined, ignore.
    from?: Square, // If this is undefined, the piece was promoted.
    to?: Square, // If this is undefined, the piece was captured.
}

export type Move = {
    moveType: MoveType | null, // If this is null, the move is a normal move.
    notation?: string,
    swaps: Swap[], // Castling, En Passant, and Promotion involve multiple moves per move.
}

export enum MoveType {
    INVALID = -1,
    NORMAL = 0,
    EN_PASSANT = 1,
    CASTLE = 2,
    PROMOTION = 3,
}

export const oppositeOf = (color: number) => {
    return color * -1
}

export const outOfBounds = (board: Board, rank: number, file: number): boolean => {
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
    return !swap.from
}
// Castles are the only case where this is ambiguous
export const getMovingPiece = (move: Move): Piece => {
    if (move.moveType == MoveType.CASTLE) {
        return move.swaps.find(swap => swap.piece!.type == PieceType.KING)?.piece!
    } else if (move.moveType == MoveType.PROMOTION) {
        return move.swaps.find(swap => swap.piece?.type == PieceType.PAWN)!.piece!
    } else {
        return move.swaps.find(swap => swap.from! && swap.to!)?.piece!
    }
}

export const getCapturedPiece = (move: Move): Piece | undefined => {
    if (move.moveType == MoveType.PROMOTION) {
        return move.swaps.find(swap => !swap.to && swap.piece!.type != PieceType.PAWN)?.piece
    } else {
        return move.swaps.find(swap => !swap.to)?.piece
    }
}

export const getPromotingPiece = (move: Move): Piece | undefined => {
    if (move.moveType == MoveType.PROMOTION) {
        const movingPiece = getMovingPiece(move);
        return move.swaps.find(swap => isPromotingSwap(swap) && movingPiece.sameColorAs(swap.piece!))!.piece!;
    }
    return undefined
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

export const ambiguityCheck = (board: Board, movingPiece: Piece) => {
    const toRank = movingPiece.square.rank;
    const toFile = movingPiece.square.file;
    let isAmbiguous = false;
    board.historyCallback((board: Board) => {
        const ambiguousPieces = board.pieces.filter(piece =>
            piece.type == movingPiece.type
            && piece != movingPiece
            && !piece.isCaptured
            && piece.color == movingPiece.color
            && piece.validateAndGetMoveType(piece.square, board.square(toRank, toFile), false) != MoveType.INVALID)
        if (ambiguousPieces.length > 0) {
            isAmbiguous = true;
        }
    }, 1)
    return isAmbiguous;
}
