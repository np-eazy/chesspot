import { Cell } from "./Cell"
import { Bishop, King, Knight, Pawn, Piece, PieceType, Queen, Rook } from "./Piece"
import { standardPieces } from "./StandardPieces"

export enum Color {
    WHITE = 1,
    BLACK = -1,
}

export enum MicroState {
    IDLE = 0,
    MOVING = 1,
    PROMOTING = 2,
}

export enum SpecialInstruction {
    EN_PASSANT,
    CASTLE,
    PROMOTE,
}

export class GameState {
    board: Cell[][]
    pieces: Piece[]
    turn: Color
    microState: MicroState
    selectedFrom: Cell | null
    selectedTo: Cell | null
    moveHistory: [Cell, Cell, Piece | null, SpecialInstruction | null][]
    winner: Color | null
    specialInstructions: any[]

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
        this.specialInstructions = []
        this.winner = null
        this.pieces = standardPieces(this.board);
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
    
    validate(from: Cell, to: Cell) {
        if (!from.piece) {
            throw new Error("No piece to move")
        }
        if (from.piece.color !== this.turn) {
            throw new Error("Not your turn")
        }
        if (!from.piece.validateMove(this, from, to, false)) {
            throw new Error("Invalid move: this piece cannot move like that")
        }
    }

    move(from: Cell, to: Cell) {
        this.validate(from, to);
        // const instruction = this.specialInstructions.pop() ?? null
        const instruction = null
        if (instruction == SpecialInstruction.EN_PASSANT) {
            this.moveHistory.push([from, to, null, instruction])
            this.castle(from, to, false)
        } else if (instruction == SpecialInstruction.CASTLE) {
            this.moveHistory.push([from, to, null, instruction])
            this.enPassantCapture(from, to, false)
        } else if (instruction == SpecialInstruction.PROMOTE) {
            this.moveHistory.push([from, to, null, instruction])
            this.initPromotion()
        } else {
            this.moveHistory.push([from, to, to.piece, null])
            if (from.piece!.firstMovedOnTurn == -1) {
                from.piece!.firstMovedOnTurn = this.moveHistory.length;
            }
            this.attemptCapture(from, to, to.piece, false)
            to.place(from.piece!);
            from.remove();
        }
        
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        this.microState = MicroState.IDLE;
        this.computePressure();
    }

    undo() {
        if (this.moveHistory.length == 0) {
            throw new Error("No moves to undo")
        }
        const [from, to, piece, instruction] = this.moveHistory.pop()!
        if (instruction == SpecialInstruction.EN_PASSANT) {
            this.castle(from, to, true)
        } else if (instruction == SpecialInstruction.CASTLE) {
            this.enPassantCapture(from, to, true)
        } else if (instruction == SpecialInstruction.PROMOTE) {
            this.promote(from, to, piece!, true)
        } else {   
            from.place(to.piece!)
            to.remove()
            this.attemptCapture(from, to, piece, true)
            if (from.piece!.firstMovedOnTurn <= this.moveHistory.length) {
                from.piece!.firstMovedOnTurn = -1
            }
        }
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        this.microState = MicroState.IDLE;
        this.computePressure();
    }

    attemptCapture(from: Cell, to: Cell, piece: Piece | null, isUndo: boolean) {
        if (isUndo && piece) {
            piece.isCaptured = false
            to.place(piece);
        } else if (to.piece) {
            to.piece.isCaptured = true
            to.remove();
        }
    }

    enPassantCapture(from: Cell, to: Cell, isUndo: boolean) {
        console.log("successful en passant move detected")
        // TODO: Use the move history to find the correct pawn to capture; it will be on the to-file and from-rank of the capturer. 
        // To undo an En Passant, the captured piece is un-captured the to-file and from-rank of the capturer.
    }

    castle(kingFrom: Cell, kingTo: Cell, isUndo: boolean) {
        console.log("successful castle move detected")
        // TODO: Find & move the correct rook, then move the king
        // To undo a castle, the rook is moved to the square it started the game on
    }

    promote(from: Cell, to: Cell, promotionPiece: Piece, isUndo: boolean) {
        console.log("successful promotion move detected")
        // TODO: "capture" the pawn and place the new piece on the to cell
        // The instruction is already pushed to the move history, so we overwrite it with the piece the user wants to promote.
        // To undo a promotion, the new piece returns to a "captured" state and the pawn is un-captured. 
    }

    initPromotion() {
        console.log("successful promotion move detected")
        this.microState = MicroState.PROMOTING;
    }
}
