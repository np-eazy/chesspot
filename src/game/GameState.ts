import { Cell } from "./Cell"
import { King, Piece, PieceType, Queen } from "./Piece"
import { standardPieces } from "./StandardPieces"

export enum Color {
    WHITE = 1,
    BLACK = -1,
}

export enum TurnProgress {
    IDLE = 0,
    MOVING = 1,
    PROMOTING = 2,
}

export enum MoveType {
    INVALID = -1,
    NORMAL = 0,
    EN_PASSANT = 1,
    CASTLE = 2,
    PROMOTION = 3,
 }

export type Swap = {
    piece?: Piece, // If this is undefined, ignore.
    from?: Cell, // If this is undefined, the piece was promoted.
    to?: Cell, // If this is undefined, the piece was captured.
}

export type Move = {
    swaps: Swap[], // Castling, En Passant, and Promotion involve multiple moves per turn.
    moveType: MoveType | null, // If this is null, the turn is a normal move.
}

export class GameState {
    board: Cell[][]
    pieces: Piece[]

    turn: Color
    turnProgress: TurnProgress
    turnHistory: Move[]

    selectedCell: Cell | null
    winner: Color | null

    constructor() {
        this.board = Array.from({ length: 8 }, (_, rank) => {
            return Array.from({ length: 8 }, (_, file) => {
                return new Cell({ rank: rank + 1, file: file + 1 })
            })
        })
        this.pieces = standardPieces(this.board);
        this.pieces.forEach(piece => {
            piece.cell.place(piece)
        })

        this.turn = Color.WHITE
        this.turnProgress = TurnProgress.IDLE
        this.turnHistory = []
        this.selectedCell = null

        this.winner = null
    }

    getCell(rank: number, file: number) {
        return this.board[rank - 1][file - 1]
    }

    select(cell: Cell) {
        if (this.turnProgress === TurnProgress.IDLE) {
            if (cell.piece && cell.piece.color === this.turn) {
                this.selectedCell = cell
                cell.select()
                this.turnProgress = TurnProgress.MOVING
            }
        } else if (this.turnProgress === TurnProgress.MOVING) {
            if (cell === this.selectedCell) { // Deselect the from cell
                this.clearSelection()
            } else if (!cell.piece || cell.piece.color !== this.turn) {
                this.move(this.selectedCell!, cell)
                this.clearSelection()
            }
            this.turnProgress = TurnProgress.IDLE
        }
    }

    clearSelection() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.deselect()
            })
        })
        this.selectedCell = null
    }

    // Compute which pieces are targeting which cells.
    computeTargets() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.targetingPieces.set(Color.WHITE, [])
                cell.targetingPieces.set(Color.BLACK, [])
                this.pieces.filter(piece => !piece.isCaptured).forEach(piece => {
                    if (piece && piece.validateAndGetMoveType(this, piece.cell, cell, true) != MoveType.INVALID) {
                        cell.targetingPieces.get(piece.color)!.push(piece)
                    }
                })
            })
        })
    }

    // Check if the current king is in check, or if it is on a square that is being attacked by the opposite color.
    processCheckCondition() {
        const king = this.pieces.find(piece => piece && (piece.type == PieceType.KING) && (piece.color != this.turn))
        if (king) {
            if (king.cell.targetingPieces.get(king.color * -1)!.length > 0) {
                this.undo();
            }
        }
    }

    // Check if the last move was a pawn moving onto the last rank; if so, set the turn progress to PROMOTING
    // so that the UI can offer the user a list of pieces to promote to.
    processPromotionCondition() {
        const turn = this.turnHistory[this.turnHistory.length - 1];
        const movement = turn.swaps.filter(swap => swap.piece && swap.from && swap.to)[0];
        if (movement 
            && turn.moveType == MoveType.NORMAL
            && movement.piece && movement.piece.type == PieceType.PAWN
            && movement.to && movement.to.rank == (movement.piece.color == Color.WHITE ? 8 : 1)) {
                this.turnProgress = TurnProgress.PROMOTING;
                // TODO: No auto-queen, make a feature that allows the user to select a piece to promote to.
                this.executePromotion(PieceType.QUEEN);
        }
    }

    // Replace the existing move with a promotion; this is the only type of move with up to 3 swaps, in the case
    // that a pawn captures on promotion. 
    executePromotion(pieceType: PieceType) {
        const swaps = this.turnHistory[this.turnHistory.length - 1].swaps;
        this.undo();
        const newSwaps: Swap[] = []
        swaps.forEach(swap => {
            if (swap.piece && swap.from && !swap.to) { // A capture swap is of the opposite color and doesn't need to be refactored
                newSwaps.push(swap)
            } else if (swap.piece && swap.from && swap.to) { 
                console.log("HEY MORTY I TURNED MYSELF INTO A FUCKING QUEEN MORTY")
                const promotionPiece = new Queen({
                    color: this.turn,
                    initRank: swap.to.rank,
                    initFile: swap.to.file,
                    cell: swap.to,
                })
                this.pieces.push(promotionPiece)
                newSwaps.push({ // The other swap is the pawn itself, and we "capture" it and add in a new piece.
                    piece: swap.piece,
                    from: swap.from,
                })
                newSwaps.push({
                    piece: promotionPiece,
                    to: swap.to,
                })
                // TODO: Make sure that the pawn isn't treated the same as other captured pieces, even though it uses the same flag.
            }
        })
        this.turnHistory.push({
            moveType: MoveType.PROMOTION,
            swaps: newSwaps,
        })
        this.executeTurn(this.turnHistory[this.turnHistory.length - 1]);
    }

    validateSwap(swap: Swap) { // Extra checks just to make sure the move is valid.
        if (swap.piece && swap.from) {
            if (!swap.from.piece 
                || (swap.from.piece !== swap.piece) 
                || (swap.from.piece.color !== swap.piece.color)) {
                throw new Error(`Piece ${swap.piece!.getName()} is not connected to square/cell ${swap.from.getName()}`)
            }
            if (swap.piece.isCaptured) {
                throw new Error(`Piece ${swap.piece!.getName()} is already captured.`)
            }
        }
    }
    
    validateAndGetMoveType(piece: Piece, from: Cell, to: Cell): MoveType {
        if (!piece) {
            throw new Error("No piece to move")
        }
        this.validateSwap({piece: piece, from: from, to: to});
        return piece.validateAndGetMoveType(this, from, to, false);
    }

    move(from: Cell, to: Cell) {
        const moveType = this.validateAndGetMoveType(from.piece!, from, to);
        if (moveType == MoveType.INVALID) {
            return
        }
        if (moveType == MoveType.EN_PASSANT) {
            const turn = {
                moveType: moveType,
                swaps: [{
                    piece: from.piece!, // Capturing pawn
                    from: from,
                    to: to,
                }, {
                    piece: this.getCell(to.rank - this.turn, to.file).piece!, // Captured pawn
                    from: this.getCell(to.rank - this.turn, to.file),
                }],
            }
            this.turnHistory.push(turn)
        } else if (moveType == MoveType.CASTLE) {
            const rook = (from.piece! as King).findCastlingRook(this, from, to)
            const turn = {
                moveType: moveType,
                swaps: [{
                    piece: from.piece!, // King
                    from: from,
                    to: to,
                }, {
                    piece: rook, // Rook
                    from: rook.cell,
                    to: this.getCell(rook.cell.rank, from.file + (rook.cell.file > from.file ? 1 : -1)),
                }], 
            }
            this.turnHistory.push(turn)
        } else {
            const swaps: any[] = [{
                piece: from.piece,
                from: from,
                to: to,
            }]
            if (to.piece) {
                swaps.push({
                    piece: to.piece,
                    from: to,
                })
            }
            this.turnHistory.push({
                moveType: moveType,
                swaps: swaps,
            })
        }
        this.executeTurn(this.turnHistory[this.turnHistory.length - 1])
        this.processCheckCondition();
        this.processPromotionCondition();
    }

    executeTurn(turn: Move, undo: boolean = false) {
        for (const move of turn.swaps // Order of operations: first promotions & captures, then normal moves.
            .sort((a, b) => [a, b]
                .map((m: Swap): number => m.to ? 0 : m.from ? 1 : 2)
                .reduce((prev, curr, i) => prev + curr * (undo?-1:1) * (i%2?1:-1), 0) // a - b if not undo, b - a if undo
        )) {
            if (move.piece) {
                if (!undo) {
                    if (move.from && !move.to) { // Capture
                        move.piece.isCaptured = true
                        move.from.remove()
                    } else if (move.from && move.to) { // Normal Move
                        move.to.place(move.piece)
                        move.from.remove()
                    } else if (!move.from && move.to) { // Promotion
                        move.to.place(move.piece)
                    }
                    if (move.piece.firstMovedOnTurn == -1) {
                        move.piece.firstMovedOnTurn = this.turnHistory.length;
                    }
                } else {
                    if (move.from && !move.to) { // Un-capture
                        move.piece.isCaptured = false
                        move.from.place(move.piece)
                    } else if (move.from && move.to) { // Un-normal Move
                        move.from.place(move.piece)
                        move.to.remove()
                    } else if (!move.from && move.to) { // Promotion
                        move.to.remove()
                    }
                    if (move.piece.firstMovedOnTurn <= this.turnHistory.length + 1) {
                        move.piece.firstMovedOnTurn = -1;
                    }
                }
            }
        }
        this.turn *= -1;
        this.turnProgress = TurnProgress.IDLE;
        this.computeTargets();
    }

    undo() {
        if (this.turnHistory.length == 0) {
            throw new Error("No moves to undo")
        }
        const turn = this.turnHistory.pop()
        this.executeTurn(turn!, true)
    }

    initPromotion() {
        this.turnProgress = TurnProgress.PROMOTING;
    }
}
