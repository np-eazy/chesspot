import { Cell } from "./Cell"
import { Bishop, King, Knight, Pawn, Piece, PieceType, Queen, Rook } from "./Piece"

export enum Color {
    WHITE = 1,
    BLACK = -1,
}

export enum MicroState {
    IDLE = 0,
    MOVING = 1,
}

export class GameState {
    board: Cell[][]
    pieces: Piece[]
    turn: Color
    microState: MicroState
    selectedFrom: Cell | null
    selectedTo: Cell | null
    moveHistory: [Cell, Cell, Piece | null][]
    winner: Color | null

    constructor() {
        this.turn = Color.WHITE
        this.microState = MicroState.IDLE
        this.selectedFrom = null
        this.selectedTo = null
        this.moveHistory = []
        this.board = Array.from({ length: 8 }, (_, rank) => {
            return Array.from({ length: 8 }, (_, file) => {
                return new Cell({ rank: rank + 1, file: file + 1 })
            })
        })
        this.winner = null
        this.pieces = [
            new Rook({ initRank: 1, initFile: 1, color: Color.WHITE, cell: this.board[0][0] }),
            new Knight({ initRank: 1, initFile: 2, color: Color.WHITE, cell: this.board[0][1] }),
            new Bishop({ initRank: 1, initFile: 3, color: Color.WHITE, cell: this.board[0][2] }),
            new Queen({ initRank: 1, initFile: 4, color: Color.WHITE, cell: this.board[0][3] }),
            new King({ initRank: 1, initFile: 5, color: Color.WHITE, cell: this.board[0][4] }),
            new Bishop({ initRank: 1, initFile: 6, color: Color.WHITE, cell: this.board[0][5] }),
            new Knight({ initRank: 1, initFile: 7, color: Color.WHITE, cell: this.board[0][6] }),
            new Rook({ initRank: 1, initFile: 8, color: Color.WHITE, cell: this.board[0][7] }),
            new Pawn({ initRank: 2, initFile: 1, color: Color.WHITE, cell: this.board[1][0] }),
            new Pawn({ initRank: 2, initFile: 2, color: Color.WHITE, cell: this.board[1][1] }),
            new Pawn({ initRank: 2, initFile: 3, color: Color.WHITE, cell: this.board[1][2] }),
            new Pawn({ initRank: 2, initFile: 4, color: Color.WHITE, cell: this.board[1][3] }),
            new Pawn({ initRank: 2, initFile: 5, color: Color.WHITE, cell: this.board[1][4] }),
            new Pawn({ initRank: 2, initFile: 6, color: Color.WHITE, cell: this.board[1][5] }),
            new Pawn({ initRank: 2, initFile: 7, color: Color.WHITE, cell: this.board[1][6] }),
            new Pawn({ initRank: 2, initFile: 8, color: Color.WHITE, cell: this.board[1][7] }),
            new Pawn({ initRank: 7, initFile: 1, color: Color.BLACK, cell: this.board[6][0] }),
            new Pawn({ initRank: 7, initFile: 2, color: Color.BLACK, cell: this.board[6][1] }),
            new Pawn({ initRank: 7, initFile: 3, color: Color.BLACK, cell: this.board[6][2] }),
            new Pawn({ initRank: 7, initFile: 4, color: Color.BLACK, cell: this.board[6][3] }),
            new Pawn({ initRank: 7, initFile: 5, color: Color.BLACK, cell: this.board[6][4] }),
            new Pawn({ initRank: 7, initFile: 6, color: Color.BLACK, cell: this.board[6][5] }),
            new Pawn({ initRank: 7, initFile: 7, color: Color.BLACK, cell: this.board[6][6] }),
            new Pawn({ initRank: 7, initFile: 8, color: Color.BLACK, cell: this.board[6][7] }),
            new Rook({ initRank: 8, initFile: 1, color: Color.BLACK, cell: this.board[7][0] }),
            new Knight({ initRank: 8, initFile: 2, color: Color.BLACK, cell: this.board[7][1] }),
            new Bishop({ initRank: 8, initFile: 3, color: Color.BLACK, cell: this.board[7][2] }),
            new Queen({ initRank: 8, initFile: 4, color: Color.BLACK, cell: this.board[7][3] }),
            new King({ initRank: 8, initFile: 5, color: Color.BLACK, cell: this.board[7][4] }),
            new Bishop({ initRank: 8, initFile: 6, color: Color.BLACK, cell: this.board[7][5] }),
            new Knight({ initRank: 8, initFile: 7, color: Color.BLACK, cell: this.board[7][6] }),
            new Rook({ initRank: 8, initFile: 8, color: Color.BLACK, cell: this.board[7][7] }),
        ];
        this.pieces.forEach(piece => {
            piece.cell.place(piece)
        })
    }

    select(cell: Cell) {
        if (this.microState === MicroState.IDLE) {
            if (cell.piece && cell.piece.color === this.turn) {
                this.selectedFrom = cell
                cell.select()
                this.microState = MicroState.MOVING
            }
        } else if (this.microState === MicroState.MOVING) {
            if (cell === this.selectedFrom) { // Deselect the from cell
                this.clearSelection()
            } else if (!cell.piece || cell.piece.color !== this.turn) {
                this.selectedTo = cell
                cell.select()
                this.move(this.selectedFrom!, this.selectedTo)
                this.clearSelection()
            }
            this.microState = MicroState.IDLE
        }
    }

    clearSelection() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.deselect()
            })
        })
        this.selectedFrom = null
        this.selectedTo = null
    }

    globalValidation(from: Cell, to: Cell): boolean {
        // TODO: validate checks, pins, and promotions
        return true
    }

    computePressure() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.targetingPieces.set(Color.WHITE, [])
                cell.targetingPieces.set(Color.BLACK, [])
                this.pieces.filter(piece => !piece.isCaptured).forEach(piece => {
                    if (piece && piece.validateMove(this, piece.cell, cell, true)) {
                        cell.targetingPieces.get(piece.color)!.push(piece)
                    }
                })
            })
        })
        const king = this.pieces.find(piece => piece && (piece.type == PieceType.KING) && (piece.color != this.turn))
        if (king) {
            if (king.cell.targetingPieces.get(king.color == Color.WHITE ? Color.BLACK : Color.WHITE)!.length > 0) {
                this.undo();
            }
        }
    }

    move(from: Cell, to: Cell) {
        if (!from.piece) {
            throw new Error("No piece to move")
        }
        if (from.piece.color !== this.turn) {
            throw new Error("Not your turn")
        }
        if (!from.piece.validateMove(this, from, to, false)) {
            throw new Error("Invalid move: this piece cannot move like that")
        }
        if (!this.globalValidation(from, to)) {
            throw new Error("Invalid move")
        }

        this.moveHistory.push([from, to, to.piece])
        if (to.piece) {
            to.piece.isCaptured = true
            to.remove();
        }
        to.place(from.piece);
        from.remove();

        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        this.microState = MicroState.IDLE;
        this.computePressure();
    }

    undo() {
        if (this.moveHistory.length == 0) {
            throw new Error("No moves to undo")
        }
        const [from, to, piece] = this.moveHistory.pop()!
        from.place(to.piece!)
        to.remove()
        if (piece) {
            to.place(piece) // un-capture
            to.piece!.isCaptured = false
        }
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        this.microState = MicroState.IDLE;
        this.computePressure();
    }
}
