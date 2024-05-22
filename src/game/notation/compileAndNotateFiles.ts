import { Color, Board } from "../Board";
import { Piece, PieceType, providePiece } from "../Piece";
import { compileRawMoves } from "./compileAndNotateMoves";
import { extractRawMoves, getLowercasePieceType, getPieceType, parseCoords } from "./notationUtils";

export const compilePGN = (pgn: string): Board => {
    const splits = pgn.split("]");
    const rawMoves = splits[splits.length - 1];
    return compileRawMoves(extractRawMoves(rawMoves));
}

export const initializeFEN = (initState: Board, fen: string): Board => {
    const fields: string[] = fen.split(" ");
    if (fields.length != 6) {
        throw new Error("Invalid FEN format");
    }

    // Field 1: Piece placement
    const rows: string[] = fields[0].split('/');
    const pieces: Piece[] = []
    let rankIndex = 0
    for (const row of rows) {
        let fileIndex = 0;
        for (const segment of row) {
            if (segment >= '1' && segment <= '8') {
                fileIndex += segment.charCodeAt(0) - '1'.charCodeAt(0);
            } else {
                const pieceProps = {
                    initRank: rankIndex,
                    initFile: fileIndex,
                    square: initState.square(rankIndex + 1, fileIndex + 1),
                    board: initState
                }
                if (getPieceType(segment)) {
                    pieces.push(providePiece({ ...pieceProps, color: Color.BLACK }, getPieceType(segment)!))
                } else if (getLowercasePieceType(segment)) {
                    pieces.push(providePiece({ ...pieceProps, color: Color.WHITE }, getLowercasePieceType(segment)!))
                } else {
                    console.log(segment)
                    throw new Error("Invalid FEN format: invalid piece symbol");
                }
                fileIndex += 1
            }
            if (fileIndex > 8) {
                throw new Error("Invalid FEN format: row does not add up to 8 squares");
            } else if (fileIndex == 8) {
                break
            }
        }
        rankIndex += 1;
    }
    if (rankIndex != 8) {
        throw new Error("Invalid FEN format: must have 8 /-separated rows");
    }
    initState.placePieces(pieces);

    // Field 2: Active color
    if (fields[1] == "w") {
        initState.toMove = Color.WHITE;
    } else if (fields[1] == "b") {
        initState.toMove = Color.BLACK;
    } else {
        throw new Error("Invalid FEN format: invalid active color");
    }

    // Field 3: Castling Rights
    const whiteKing = pieces.find(piece => piece.isType(PieceType.KING) && piece.sameColorAs(Color.WHITE))
    const blackKing = pieces.find(piece => piece.isType(PieceType.KING) && piece.sameColorAs(Color.BLACK))
    if (!whiteKing || !blackKing) {
        throw new Error("Invalid FEN format: missing king");
    }
    if (!fields[2].includes("K")) {
        const piece = pieces.find(piece =>
            piece.isType(PieceType.ROOK)
            && piece.sameColorAs(Color.WHITE)
            && piece.square.file > whiteKing.square.file)
        if (piece) {
            piece.firstMovedOn = 0
        }
    }
    if (!fields[2].includes("Q")) {
        const piece = pieces.find(piece =>
            piece.isType(PieceType.ROOK)
            && piece.sameColorAs(Color.WHITE)
            && piece.square.file < whiteKing.square.file)
        if (piece) {
            piece.firstMovedOn = 0
        }
    }
    if (!fields[2].includes("k")) {
        const piece = pieces.find(piece =>
            piece.isType(PieceType.ROOK)
            && piece.sameColorAs(Color.BLACK)
            && piece.square.file > blackKing.square.file)
        if (piece) {
            piece.firstMovedOn = 0
        }
    }
    if (!fields[2].includes("q")) {
        const piece = pieces.find(piece =>
            piece.isType(PieceType.ROOK)
            && piece.sameColorAs(Color.BLACK)
            && piece.square.file < blackKing.square.file)
        if (piece) {
            piece.firstMovedOn = 0
        }
    }

    // TODO: Handle the last 3 fields 

    // Field 4: En Passant
    // Field 5 & 6: Halfmove Clock

    return initState;
}

export const notateGame = (board: Board): string => {
    const moveHistory = board.moveHistory;
    const pairedMoves: [string, string][] = [];
    for (let i = 0; i <= moveHistory.length / 2; i++) {
        pairedMoves.push([
            moveHistory[i * 2]?.notation ?? "",
            moveHistory[i * 2 + 1]?.notation ?? ""
        ]);
    }
    return pairedMoves.map((move, i) => {
        return `${i + 1}. ${move[0]} ${move[1]}`
    }).join(" ");
}
