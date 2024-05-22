import { PieceType } from "../Piece";

// IMPORTANT: By convention, the typical "file" and "rank" order in coordinates is swapped during code;
// This is to make more explicit the row-column structure of the 2d arrays. Make sure to check examples and references
// to know if you are putting the rank and file in the right order.
export const parseCoords = (coord: string): [number, number] | null => {
    const regex = /^[a-h][1-8]$/;
    if (!regex.test(coord)) {
        return null;
    }
    return [coord.charCodeAt(0) - 'a'.charCodeAt(0) + 1, coord.charCodeAt(1) - '1'.charCodeAt(0) + 1];
}
export const notateCoords = (rank: number, file: number): string => {
    return `${String.fromCharCode(file + 'a'.charCodeAt(0) - 1)}${rank}`
}
export const parseRank = (rank: string) => {
    const regex = /^[1-8]$/;
    if (!regex.test(rank)) {
        return null;
    }
    return rank.charCodeAt(0) - '1'.charCodeAt(0) + 1;
}
export const parseFile = (file: string) => {
    const regex = /^[a-h]$/;
    if (!regex.test(file)) {
        return null;
    }
    return file.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}
export const notateFile = (file: number): string => {
    return String.fromCharCode(file + 'a'.charCodeAt(0) - 1);
}
export const notateRank = (rank: number): string => {
    return String.fromCharCode(rank + '1'.charCodeAt(0) - 1);
}
export const getPieceType = (letter: string): PieceType | null => {
    switch (letter) {
        case "K":
            return PieceType.KING;
        case "Q":
            return PieceType.QUEEN;
        case "R":
            return PieceType.ROOK;
        case "B":
            return PieceType.BISHOP;
        case "N":
            return PieceType.KNIGHT;
        case "P":
            return PieceType.PAWN;
        default:
            return null;
    }
}
export const getLowercasePieceType = (letter: string): PieceType | null => {
    switch (letter) {
        case "k":
            return PieceType.KING;
        case "q":
            return PieceType.QUEEN;
        case "r":
            return PieceType.ROOK;
        case "b":
            return PieceType.BISHOP;
        case "n":
            return PieceType.KNIGHT;
        case "p":
            return PieceType.PAWN;
        default:
            return null;
    }
}
export const notatePieceType = (pieceType: PieceType): string => {
    switch (pieceType) {
        case PieceType.KING:
            return "K";
        case PieceType.QUEEN:
            return "Q";
        case PieceType.ROOK:
            return "R";
        case PieceType.BISHOP:
            return "B";
        case PieceType.KNIGHT:
            return "N";
        default:
            return "";
    }
}
export const extractRawMoves = (source: string): string[] => {
    const moves = source.replace(/\n/g, " ").replace(/\\n/g, " ").replace(/,/g, " ").replace(/\t/g, " ")
        .replace(/!/g, "").replace(/\?/g, "")
        .split(" ")
        .filter(move => move !== "")
        .filter(move => !/^\d+\.?/.test(move))
        .filter(move => move !== "e.p." && move !== "(e.p.)");
    const resultPattern = /\s+(\d+|\d+\/\d+)-(\d+|\d+\/\d+)$/;
    if (resultPattern.test(moves[moves.length - 1])) {
        moves.pop();
    }
    return moves;
}
