import { Square } from "../Square"
import { ValidatedGameState, MoveType } from "../GameState"
import { Piece, PieceType } from "../Piece"
import { outOfBounds, rankDxn, fileDxn, colorDxn } from "./moveUtils"
/*
    A file holding functions that deal with traversing/searching horizontal/vertical lines and diagonals,
    for validating Rook/Bishop/Queen moves, to facilitate complex moves like castling, and to account for
    batteries when counting attackers.
*/
export type traverseSegmentArgs = {
    gameState: ValidatedGameState,
    start: Square,
    rankDxn?: number,
    fileDxn?: number,
    loopCondition: (square: Square) => void,
    loopCallback?: (square: Square) => void,
    exitCallback?: (square: Square) => void
}

export const traverseSegment = (args: traverseSegmentArgs) => {
    let [rank, file] = [args.start.rank + (args.rankDxn ?? 0), args.start.file + (args.fileDxn ?? 0)]
    while (!outOfBounds(args.gameState, rank, file) && args.loopCondition(args.gameState.square(rank, file))) {
        if (args.loopCallback) {
            args.loopCallback(args.gameState.square(rank, file))
        }
        rank += args.rankDxn ?? 0
        file += args.fileDxn ?? 0
    }
    if (args.exitCallback) {
        args.exitCallback(args.gameState.square(rank, file))
    }
}

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

export const validateDiagonal = (gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): boolean => {
    let [rank, file] = [from.rank + rankDxn(from, to), from.file + fileDxn(from, to)]
    while (!outOfBounds(gameState, rank, file) && !to.isRank(rank) && !to.isFile(file)) {
        if (gameState.square(rank, file).piece) {
            if (passive) {
                const batteryPiece = gameState.square(rank, file).piece
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

export const validateStraight = (gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): boolean => {
    if (from.sameRankAs(to)) {
        let file = from.file + fileDxn(from, to)
        while (!outOfBounds(gameState, from.rank, file) && !to.isFile(file)) {
            if (!gameState.square(from.rank, file).isEmpty()) {
                if (passive) {
                    const batteryPiece = gameState.square(from.rank, file).piece
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
        while (!outOfBounds(gameState, rank, from.file) && !to.isRank(rank)) {
            if (gameState.square(rank, from.file).piece) {
                if (passive) {
                    const batteryPiece = gameState.square(rank, from.file).piece
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
