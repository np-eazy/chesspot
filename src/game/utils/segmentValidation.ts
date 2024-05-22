import { Square } from "../Square"
import { Board } from "../Board"
import { Piece, PieceType } from "../Piece"
import { outOfBounds, rankDxn, fileDxn, colorDxn, MoveType } from "./moveUtils"
/*
    A file holding functions that deal with traversing/searching horizontal/vertical lines and diagonals,
    for validating Rook/Bishop/Queen moves, to facilitate complex moves like castling, and to account for
    batteries when counting attackers.
*/
export type traverseSegmentArgs = {
    board: Board,
    start: Square,
    rankDxn?: number,
    fileDxn?: number,
    loopCondition: (square: Square) => void,
    loopCallback?: (square: Square) => void,
    exitCallback?: (square: Square) => void
}
// A wrapper to run callbacks across a segment of the board from a starting square.
export const traverseSegment = (args: traverseSegmentArgs) => {
    let [rank, file] = [args.start.rank + (args.rankDxn ?? 0), args.start.file + (args.fileDxn ?? 0)]
    while (!outOfBounds(args.board, rank, file) && args.loopCondition(args.board.square(rank, file))) {
        if (args.loopCallback) {
            args.loopCallback(args.board.square(rank, file))
        }
        rank += args.rankDxn ?? 0
        file += args.fileDxn ?? 0
    }
    if (args.exitCallback) {
        args.exitCallback(args.board.square(rank, file))
    }
}
// Return whether or not the mainPiece and batteryPiece form a battery.
export const isBattery = (mainPiece: Piece, batteryPiece: Piece, pieceType: PieceType) => {
    if (batteryPiece) {
        if (batteryPiece.sameColorAs(mainPiece)) {
            if (batteryPiece.type != PieceType.QUEEN && batteryPiece.type != pieceType) {
                return false
            }
        } else {
            return false
        }
    }
    return true
}
// Set passive to true so pieces can pass through each other if they share a battery; this helps to compute attacked squares.
export const validateDiagonal = (board: Board, from: Square, to: Square, passive: boolean): boolean => {
    let [rank, file] = [from.rank + rankDxn(from, to), from.file + fileDxn(from, to)]
    while (!outOfBounds(board, rank, file) && !to.isRank(rank) && !to.isFile(file)) {
        if (board.square(rank, file).piece) {
            if (passive) {
                const batteryPiece = board.square(rank, file).piece
                if (batteryPiece && batteryPiece.sameColorAs(from.piece)) {
                    if (batteryPiece.isType(PieceType.PAWN)) {
                        return rankDxn(from, to) == colorDxn(batteryPiece)
                            && batteryPiece.validateAndGetMoveType(batteryPiece.square, to, passive) != MoveType.INVALID
                    }
                    return isBattery(from.piece!, batteryPiece, PieceType.BISHOP)
                        && batteryPiece!.validateAndGetMoveType(batteryPiece!.square, to, passive) != MoveType.INVALID
                }
            }
            return false
        }
        [rank, file] = [rank + rankDxn(from, to), file + fileDxn(from, to)]
    }
    return true
}

export const validateStraight = (board: Board, from: Square, to: Square, passive: boolean): boolean => {
    if (from.sameRankAs(to)) {
        let file = from.file + fileDxn(from, to)
        while (!outOfBounds(board, from.rank, file) && !to.isFile(file)) {
            if (!board.square(from.rank, file).isEmpty()) {
                if (passive) {
                    const batteryPiece = board.square(from.rank, file).piece
                    return isBattery(from.piece!, batteryPiece!, PieceType.ROOK)
                        && batteryPiece!.validateAndGetMoveType(batteryPiece!.square, to, passive) != MoveType.INVALID
                }
                return false
            }
            file += fileDxn(from, to)
        }
        return true
    }
    if (from.sameFileAs(to)) {
        let rank = from.rank + rankDxn(from, to)
        while (!outOfBounds(board, rank, from.file) && !to.isRank(rank)) {
            if (board.square(rank, from.file).piece) {
                if (passive) {
                    const batteryPiece = board.square(rank, from.file).piece
                    return isBattery(from.piece!, batteryPiece!, PieceType.ROOK)
                        && batteryPiece!.validateAndGetMoveType(batteryPiece!.square, to, passive) != MoveType.INVALID
                }
                return false
            }
            rank += rankDxn(from, to)
        }
        return true
    }
    return false
}
