import { Cell } from "./Cell"
import { GameState } from "./GameState"
import { Piece, PieceType } from "./Piece"


export const outOfBounds = (gameState: GameState, rank: number, file: number): boolean => {
    return rank < 1 || rank > 8 || file < 1 || file > 8
}

export const batteryCheck = (mainPiece: Piece, batteryPiece: Piece, pieceType: PieceType) => {
    if (batteryPiece) {
        if (batteryPiece.color == mainPiece.color) {
            if (batteryPiece.type != PieceType.QUEEN && batteryPiece.type != pieceType) {
                return false
            }
        } else {
            return false
        }
    }
    return true
}
// IgnoreBattery is added to reuse the same code to count pressure on a square
export const validateDiagonal = (gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean => {
    let [rank, file] = [from.rank + (to.rank > from.rank ? 1 : -1), from.file + (to.file > from.file ? 1 : -1)]
    while (!outOfBounds(gameState, rank, file) && rank != to.rank && file != to.file) {
        if (gameState.board[rank - 1][file - 1].piece) {
            if (!ignoreBattery) {
                return false
            } else {
                const batteryPiece = gameState.board[rank - 1][file - 1].piece
                if (batteryPiece && batteryPiece.color == from.piece?.color) {
                    if (batteryPiece.type == PieceType.PAWN) {
                        if ((to.rank - from.rank) * batteryPiece.color > 0) {
                            return batteryPiece.validateMove(gameState, batteryPiece.cell, to, ignoreBattery)
                        } else {
                            return false
                        }
                    }
                    return batteryCheck(from.piece!, batteryPiece, PieceType.BISHOP)
                } else {
                    return false
                }
            }
        }
        [rank, file] = [rank + (to.rank > from.rank ? 1 : -1), file + (to.file > from.file ? 1 : -1)]
    }
    return true
}

export const validateStraight = (gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean => {
    if (from.rank == to.rank) {
        let file = from.file + (to.file > from.file ? 1 : -1)
        while (!outOfBounds(gameState, from.rank, file) && file != to.file) {
            if (gameState.board[from.rank - 1][file - 1].piece) {
                if (!ignoreBattery) {
                    return false
                } else {
                    const batteryPiece = gameState.board[from.rank - 1][file - 1].piece
                    return batteryCheck(from.piece!, batteryPiece!, PieceType.ROOK)
                }
            }
            file += to.file > from.file ? 1 : -1
        }
        return true
    }
    if (from.file == to.file) {
        let rank = from.rank + (to.rank > from.rank ? 1 : -1)
        while (!outOfBounds(gameState, rank, from.file) && rank != to.rank) {
            if (gameState.board[rank - 1][from.file - 1].piece) {
                if (!ignoreBattery) {
                    return false
                } else {
                    const batteryPiece = gameState.board[rank - 1][from.file - 1].piece
                    return batteryCheck(from.piece!, batteryPiece!, PieceType.ROOK)
                }
            }
            rank += to.rank > from.rank ? 1 : -1
        }
        return true
    }
    return false
}