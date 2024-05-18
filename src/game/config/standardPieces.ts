import { Square } from "../Square";
import { Color } from "../GameState";
import { Bishop, King, Knight, Pawn, Queen, Rook } from "../Piece";

export const standardPieces = (board: Square[][]) => {
    return  [
        new Rook({ initRank: 1, initFile: 1, color: Color.WHITE, square: board[0][0] }),
        new Knight({ initRank: 1, initFile: 2, color: Color.WHITE, square: board[0][1] }),
        new Bishop({ initRank: 1, initFile: 3, color: Color.WHITE, square: board[0][2] }),
        new Queen({ initRank: 1, initFile: 4, color: Color.WHITE, square: board[0][3] }),
        new King({ initRank: 1, initFile: 5, color: Color.WHITE, square: board[0][4] }),
        new Bishop({ initRank: 1, initFile: 6, color: Color.WHITE, square: board[0][5] }),
        new Knight({ initRank: 1, initFile: 7, color: Color.WHITE, square: board[0][6] }),
        new Rook({ initRank: 1, initFile: 8, color: Color.WHITE, square: board[0][7] }),
        // Copilot wrote this not me
        new Pawn({ initRank: 2, initFile: 1, color: Color.WHITE, square: board[1][0] }),
        new Pawn({ initRank: 2, initFile: 2, color: Color.WHITE, square: board[1][1] }),
        new Pawn({ initRank: 2, initFile: 3, color: Color.WHITE, square: board[1][2] }),
        new Pawn({ initRank: 2, initFile: 4, color: Color.WHITE, square: board[1][3] }),
        new Pawn({ initRank: 2, initFile: 5, color: Color.WHITE, square: board[1][4] }),
        new Pawn({ initRank: 2, initFile: 6, color: Color.WHITE, square: board[1][5] }),
        new Pawn({ initRank: 2, initFile: 7, color: Color.WHITE, square: board[1][6] }),
        new Pawn({ initRank: 2, initFile: 8, color: Color.WHITE, square: board[1][7] }),

        new Pawn({ initRank: 7, initFile: 1, color: Color.BLACK, square: board[6][0] }),
        new Pawn({ initRank: 7, initFile: 2, color: Color.BLACK, square: board[6][1] }),
        new Pawn({ initRank: 7, initFile: 3, color: Color.BLACK, square: board[6][2] }),
        new Pawn({ initRank: 7, initFile: 4, color: Color.BLACK, square: board[6][3] }),
        new Pawn({ initRank: 7, initFile: 5, color: Color.BLACK, square: board[6][4] }),
        new Pawn({ initRank: 7, initFile: 6, color: Color.BLACK, square: board[6][5] }),
        new Pawn({ initRank: 7, initFile: 7, color: Color.BLACK, square: board[6][6] }),
        new Pawn({ initRank: 7, initFile: 8, color: Color.BLACK, square: board[6][7] }),
        new Rook({ initRank: 8, initFile: 1, color: Color.BLACK, square: board[7][0] }),

        new Knight({ initRank: 8, initFile: 2, color: Color.BLACK, square: board[7][1] }),
        new Bishop({ initRank: 8, initFile: 3, color: Color.BLACK, square: board[7][2] }),
        new Queen({ initRank: 8, initFile: 4, color: Color.BLACK, square: board[7][3] }),
        new King({ initRank: 8, initFile: 5, color: Color.BLACK, square: board[7][4] }),
        new Bishop({ initRank: 8, initFile: 6, color: Color.BLACK, square: board[7][5] }),
        new Knight({ initRank: 8, initFile: 7, color: Color.BLACK, square: board[7][6] }),
        new Rook({ initRank: 8, initFile: 8, color: Color.BLACK, square: board[7][7] }),
    ];
}
