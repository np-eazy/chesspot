import { Piece } from "../Piece";
import { Square } from "../Square";

export type PieceAnalytics = {
    piece: Piece,

    legalSquares: Square[],
    // A number from 0 to 1 that determines how many pieces it has access to in 1 move compared to on an empty board.
    firstOrderActivation: number,
    // A number from 0 to 1 that determines how many pieces it has access to in 2 moves compared to on an empty board.
    secondOrderActivation: number,
    // A number from 0 to 1 that determines how many of its legal squares it can move to that wouldn't render it prone to an attack.
    safety: number,
}
