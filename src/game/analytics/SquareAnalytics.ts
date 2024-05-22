import { Board } from "../Board"
import { Piece } from "../Piece"
import { Square } from "../Square"

export type SquareAnalytics = {
    square: Square,

    // Basic information 
    attackingPieces: Piece[],
    defendingPieces: Piece[],
    totalAttackers: number,
    totalDefenders: number,
    totalAttackingMaterial: number,
    totalDefendingMaterial: number,
    isHanging?: boolean,

    // Order of attacking/defending piece captures to get the most material for either side
    whiteOptimalExchangeOrder?: Piece[],
    blackOptimalExchangeOrder?: Piece[],
    whiteMaterialAfterExchange?: number,
    blackMaterialAfterExchange?: number,

    // If this square has a piece, it is blocking the movement of the following pieces
    whiteBlockingPieces?: Piece[],
    blackBlockingPieces?: Piece[],

    // All batteries that pass through this Piece
    batteries: Piece[][],

    // Critical squares meet one of the following criteria:
    // 1. The optimal exchange that can occur results in a check.
    // 2. The optimal exchange that can occur results in a loss of material.
    // 3. The square sits between a king and an opposing piece that is either checking or pinning the king.
    // 4. The square sits between a passed pawn and its promotion square.
    isCriticalForWhite: boolean,
    isCriticalForBlack: boolean,
}

export const getSquareAnalytics = (board: Board, square: Square): SquareAnalytics | undefined => {
    // TODO:
    return
}
