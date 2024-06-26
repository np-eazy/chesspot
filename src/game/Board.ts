import { Square } from "./Square"
import { Bishop, King, Knight, Piece, PieceType, Queen, Rook } from "./Piece"
import { GameCondition, evaluateGameCondition, inCheck } from "./GameCondition"
import { notateLastMove } from "./notation/compileAndNotateMoves"
import { Move, MoveType, Swap, oppositeOf } from "./utils/moveUtils"

export enum Color {
    WHITE = 1,
    BLACK = -1,
}

export class Board {
    squares: Square[][]
    pieces: Piece[]
    toMove: Color
    moveHistory: Move[]
    undoStack: Move[]
    msgLog: any[]
    condition: GameCondition

    constructor() {
        this.squares = Array.from({ length: 8 }, (_, rank) => {
            return Array.from({ length: 8 }, (_, file) => {
                return new Square({ rank: rank + 1, file: file + 1 })
            })
        })
        this.pieces = [];
        this.toMove = Color.WHITE
        this.moveHistory = []
        this.undoStack = []
        this.condition = GameCondition.NORMAL
        this.msgLog = [];
    }

    placePieces(pieces: Piece[]) {
        this.pieces = pieces;
        this.pieces.forEach(piece => {
            piece.square.place(piece)
        })
        return this;
    }

    findPieces(color: Color, pieceType: PieceType, multiple: boolean = false) {
        return multiple ?
            this.pieces.filter(piece => piece.color == color && piece.type == pieceType && !piece.isCaptured)
            : this.pieces.find(piece => piece.color == color && piece.type == pieceType && !piece.isCaptured)
    }

    getPiecesFromColor(color: Color) {
        return this.pieces.filter(piece => piece.color == color && !piece.isCaptured)
    }

    handleError(e: Error) {
        console.error(e);
    }

    square(rank: number, file: number) {
        return this.squares[rank - 1][file - 1]
    }

    lastTurn() {
        return this.moveHistory[this.moveHistory.length - 1]
    }

    attemptMove(from: Square, to: Square, processConditions: boolean = true) {
        const moveType = from.piece!.validateAndGetMoveType(from, to, false);
        this.msgLog.push([[from.rank, from.file,], [to.rank, to.file,], moveType])
        if (moveType == MoveType.INVALID) {
            // this.msgLog.push("Invalid move: " + from.toString() + " to " + to.toString())
            return
        } else if (moveType == MoveType.EN_PASSANT) {
            this.executeSwaps({
                moveType: moveType, // Capturing pawn
                swaps: [{ piece: from.piece!, from: from, to: to },
                {
                    piece: this.square(to.rank - this.toMove, to.file).piece!, // Captured pawn
                    from: this.square(to.rank - this.toMove, to.file),
                }],
            })
        } else if (moveType == MoveType.CASTLE) {
            const rook = (from.piece! as King).findCastlingRook(from, to)
            this.executeSwaps({
                moveType: moveType, // King
                swaps: [{ piece: from.piece!, from: from, to: to },
                {
                    piece: rook, // Rook
                    from: rook.square,
                    to: this.square(rook.square.rank, from.file + (rook.square.file > from.file ? 1 : -1)),
                }],
            })
        } else {
            const swaps: any[] = [{ piece: from.piece, from: from, to: to }]
            if (to.piece) { // Capture
                swaps.push({ piece: to.piece, from: to })
            }
            this.executeSwaps({ moveType: moveType, swaps: swaps })
        }
        if (processConditions) {
            this.processConditionsAfterMove();
        }
    }

    processConditionsAfterMove() {
        this.condition = evaluateGameCondition(this);
        if (inCheck(this, oppositeOf(this.toMove))) { // Undo if this move leaves the player in check. This is done after toMove is switched, hence the opposite.
            this.undo();
        }
        this.moveHistory[this.moveHistory.length - 1].notation = notateLastMove(this);
    }

    executeSwaps(move: Move, undo: boolean = false) {
        if (!undo) {
            this.moveHistory.push(move);
        }
        for (const swap of move.swaps // Order of operations: first captures, then everything else
            .sort((a, b) => [a, b]
                .map((m: Swap): number => m.to ? 0 : 1)
                .reduce((prev, curr, i) => prev + curr * (undo ? -1 : 1) * (i % 2 ? 1 : -1), 0) // a - b if not undo, b - a if undo
            )) {
            if (swap.piece) {
                if (!undo) {
                    if (swap.from && !swap.to) { // Capture
                        swap.piece.isCaptured = true
                        swap.from.remove()
                    } else if (swap.from && swap.to) { // Normal Move
                        swap.to.place(swap.piece)
                        swap.from.remove()
                    } else if (!swap.from && swap.to) { // Promotion
                        swap.piece.isCaptured = false
                        swap.to.place(swap.piece)
                    }
                    if (swap.piece.firstMovedOn == -1) {
                        swap.piece.firstMovedOn = this.moveHistory.length;
                    }
                } else {
                    if (swap.from && !swap.to) { // Un-capture
                        swap.piece.isCaptured = false
                        swap.from.place(swap.piece)
                    } else if (swap.from && swap.to) { // Un-normal Move
                        swap.from.place(swap.piece)
                        swap.to.remove()
                    } else if (!swap.from && swap.to) { // Un-Promotion
                        swap.piece.isCaptured = true
                        swap.to.remove()
                    }
                    if (swap.piece.firstMovedOn <= this.moveHistory.length + 1) {
                        swap.piece.firstMovedOn = -1;
                    }
                }
            }
        }
        this.toMove = oppositeOf(this.toMove);
        this.updateTargets();
    }

    // Compute which pieces are targeting which square.
    updateTargets() {
        this.squares.forEach(row => {
            row.forEach(square => {
                square.computeAttackers(this);
            })
        })
    }

    // Replace the existing move with a promotion; this is the only type of move with up to 3 swaps, in the case
    // that a pawn captures on promotion. 
    amendPromotionMove(pieceType: PieceType) {
        const swaps = this.moveHistory[this.moveHistory.length - 1].swaps;
        this.undo();
        const newSwaps: Swap[] = []
        swaps.forEach(swap => {
            if (swap.piece && swap.from && !swap.to) { // A capture swap is of the opposite color and doesn't need to be refactored
                newSwaps.push(swap)
            } else if (swap.piece && swap.from && swap.to) { // The other swap is the pawn itself, and we "capture" it and add in a new piece.
                let promotionPiece;
                const pieceProps = {
                    color: this.toMove,
                    board: this,
                    initRank: swap.to.rank,
                    initFile: swap.to.file,
                    square: swap.to,
                }
                switch (pieceType) {
                    case PieceType.KNIGHT:
                        promotionPiece = new Knight(pieceProps);
                        break;
                    case PieceType.BISHOP:
                        promotionPiece = new Bishop(pieceProps);
                        break;
                    case PieceType.ROOK:
                        promotionPiece = new Rook(pieceProps);
                        break;
                    default:
                        promotionPiece = new Queen(pieceProps);
                        break;
                }
                this.pieces.push(promotionPiece!)
                newSwaps.push({ piece: swap.piece, from: swap.from })
                newSwaps.push({ piece: promotionPiece, to: swap.to })
            }
        })
        this.executeSwaps({
            moveType: MoveType.PROMOTION,
            swaps: newSwaps,
        });
        this.moveHistory[this.moveHistory.length - 1].notation = notateLastMove(this);
    }

    undo() {
        if (this.moveHistory.length == 0) {
            this.handleError(new Error("No moves to undo"))
        }
        const move = this.moveHistory.pop()
        this.executeSwaps(move!, true)
        return move
    }

    historyCallback(callback: Function, movesAgo: number = 1) {
        const undoneMoves = [];
        for (let _ = 0; _ < movesAgo; _++) {
            undoneMoves.push(this.undo())
        }
        callback(this);
        undoneMoves.reverse().forEach(move => {
            this.executeSwaps(move!, false)
        })
    }
}
