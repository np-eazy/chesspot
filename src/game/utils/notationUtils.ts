import { PieceType } from "../Piece";

export const parseCoords = (coord: string): [number, number] | null => {
    const regex = /^[a-h][1-8]$/;
    if (!regex.test(coord)) {
        return null;
    }
    return [coord.charCodeAt(0) - 'a'.charCodeAt(0) + 1, coord.charCodeAt(1)   - '1'.charCodeAt(0) + 1];
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
    return source.replace("\n"," ").replace("\\n"," ").replace(","," ").replace("\t"," ")
        .replace("!","").replace("?","")
        .split(" ")
        .filter(move => move != "")
        .filter(move => !/^\d+\.?/.test(move))
        .filter(move => move != "e.p.");
}
