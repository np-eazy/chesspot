import { Cell } from "./Cell"
import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from "./Piece"

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
    turn: Color
    microState: MicroState
    selectedFrom: Cell | null
    selectedTo: Cell | null

    constructor() {
        this.turn = Color.WHITE
        this.microState = MicroState.IDLE
        this.selectedFrom = null
        this.selectedTo = null
        this.board = Array.from({ length: 8 }, (_, rank) => {
            return Array.from({ length: 8 }, (_, file) => {
                return new Cell({ rank: rank + 1, file: file + 1 })
            })
        })
        this.initPieces()
    }

    initPieces() {
        this.board[0][0].place(new Rook({ initRank: 1, initFile: 1, color: Color.WHITE, cell: this.board[0][0] }))
        this.board[0][1].place(new Knight({ initRank: 1, initFile: 2, color: Color.WHITE, cell: this.board[0][1] }))
        this.board[0][2].place(new Bishop({ initRank: 1, initFile: 3, color: Color.WHITE, cell: this.board[0][2] }))
        this.board[0][3].place(new Queen({ initRank: 1, initFile: 4, color: Color.WHITE, cell: this.board[0][3] }))
        this.board[0][4].place(new King({ initRank: 1, initFile: 5, color: Color.WHITE, cell: this.board[0][4] }))
        this.board[0][5].place(new Bishop({ initRank: 1, initFile: 6, color: Color.WHITE, cell: this.board[0][5] }))
        this.board[0][6].place(new Knight({ initRank: 1, initFile: 7, color: Color.WHITE, cell: this.board[0][6] }))
        this.board[0][7].place(new Rook({ initRank: 1, initFile: 8, color: Color.WHITE, cell: this.board[0][7] }))
        this.board[1].forEach((cell: Cell, index: number) => {
            cell.place(new Pawn({ initRank: 2, initFile: index + 1, color: Color.WHITE, cell: cell }))
        })
        this.board[6].forEach((cell: Cell, index: number) => {
            cell.place(new Pawn({ initRank: 7, initFile: index + 1, color: Color.BLACK, cell: cell }))
        })
        this.board[7][0].place(new Rook({ initRank: 8, initFile: 1, color: Color.BLACK, cell: this.board[7][0] }))
        this.board[7][1].place(new Knight({ initRank: 8, initFile: 2, color: Color.BLACK, cell: this.board[7][1] }))
        this.board[7][2].place(new Bishop({ initRank: 8, initFile: 3, color: Color.BLACK, cell: this.board[7][2] }))
        this.board[7][3].place(new Queen({ initRank: 8, initFile: 4, color: Color.BLACK, cell: this.board[7][3] }))
        this.board[7][4].place(new King({ initRank: 8, initFile: 5, color: Color.BLACK, cell: this.board[7][4] }))
        this.board[7][5].place(new Bishop({ initRank: 8, initFile: 6, color: Color.BLACK, cell: this.board[7][5] }))
        this.board[7][6].place(new Knight({ initRank: 8, initFile: 7, color: Color.BLACK, cell: this.board[7][6] }))
        this.board[7][7].place(new Rook({ initRank: 8, initFile: 8, color: Color.BLACK, cell: this.board[7][7] }))
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

    move(from: Cell, to: Cell) {
        if (!from.piece) {
            throw new Error("No piece to move")
        }
        if (from.piece.color !== this.turn) {
            throw new Error("Not your turn")
        }
        if (!from.piece.validateMove(this, from, to)) {
            throw new Error("Invalid move: this piece cannot move like that")
        }
        if (!this.globalValidation(from, to)) {
            throw new Error("Invalid move")
        }

        if (to.piece) {
            // Capture
            to.remove();
        }
        to.place(from.piece);
        from.remove();
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        this.microState = MicroState.IDLE;
    }
}
