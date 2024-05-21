import { Square } from "./Square"
import { Bishop, King, Knight, Piece, PieceType, Queen, Rook } from "./Piece"
import { standardPieces } from "./config/standardPieces"
import { evaluateGameCondition, inCheck } from "./utils/conditionEval"
import { notateLastMove } from "./notation/notation"
import { oppositeOf } from "./utils/moveUtils"

export enum Color {
    WHITE = 1,
    BLACK = -1,
}

export enum MoveStage {
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

export enum GameCondition {
    NORMAL = "",
    CHECK = "CHECK",
    CHECKMATE = "CHECKMATE",
    STALEMATE = "STALEMATE",
    REPETITION = "DRAW BY REPETITION",
    INSUFFICIENT_MATERIAL = "DRAW BY INSUFFICIENT MATERIAL",
    HUNDRED_MOVES_RULE = "DRAW BY HUNDRED MOVES RULE",
    PENDING_PROMOTION = "PENDING PROMOTION",
}

// Each move consists of one or more swaps, and at least one swap must have all three attributes.
export type Swap = {
    piece?: Piece, // If this is undefined, ignore.
    from?: Square, // If this is undefined, the piece was promoted.
    to?: Square, // If this is undefined, the piece was captured.
}

export type Move = {
    moveType: MoveType | null, // If this is null, the move is a normal move.
    notation?: string,
    swaps: Swap[], // Castling, En Passant, and Promotion involve multiple moves per move.
}

export class GameState {
    board: Square[][]
    pieces: Piece[]
    toMove: Color
    moveStage: MoveStage
    moveHistory: Move[]
    undoStack: Move[]
    selectedSquare: Square | null
    condition: GameCondition

    constructor() {
        this.board = Array.from({ length: 8 }, (_, rank) => {
            return Array.from({ length: 8 }, (_, file) => {
                return new Square({ rank: rank + 1, file: file + 1 })
            })
        })
        this.pieces = standardPieces(this.board);
        this.pieces.forEach(piece => {
            piece.square.place(piece)
        })

        this.toMove = Color.WHITE
        this.moveStage = MoveStage.IDLE
        this.moveHistory = []
        this.undoStack = []
        this.selectedSquare = null
        this.condition = GameCondition.NORMAL
    }

    handleError(e: Error) {
        this.clearSelection();
        console.error(e);
    }

    square(rank: number, file: number) {
        return this.board[rank - 1][file - 1]
    }

    selectAndAdvance(square: Square) {
        if (this.moveStage === MoveStage.IDLE) {
            if (square.piece && square.piece.color === this.toMove) {
                this.moveStage = MoveStage.MOVING
                this.selectedSquare = square
                square.select()
            }
        } else if (this.moveStage === MoveStage.MOVING) {
            this.moveStage = MoveStage.IDLE
            if (!square.piece || square.piece.color !== this.toMove) {
                this.manualMove(this.selectedSquare!, square)
            }
            this.clearSelection()
        } else if (this.moveStage === MoveStage.PROMOTING) {
            throw new Error("Select a promotion piece before proceeding.")
        }
    }

    clearSelection() {
        this.board.forEach(row => {
            row.forEach(square => {
                square.deselect()
            })
        })
        this.selectedSquare = null
    }

    // Compute which pieces are targeting which square.
    computeTargets() {
        this.board.forEach(row => {
            row.forEach(square => {
                square.targetingPieces.set(Color.WHITE, [])
                square.targetingPieces.set(Color.BLACK, [])
                this.pieces.filter(piece => !piece.isCaptured).forEach(piece => {
                    if (piece && piece.validateAndGetMoveType(this, piece.square, square, true) != MoveType.INVALID) {
                        square.targetingPieces.get(piece.color)!.push(piece)
                    }
                })
            })
        })
    }
    
    validateAndGetMoveType(piece: Piece, from: Square, to: Square): MoveType {
        if (piece && from) {
            if (!from.piece 
                || (from.piece !== piece) 
                || (from.piece.color !== piece.color)) {
                this.handleError(new Error(`Piece ${piece.getName()} is not connected to square ${from.getName()}`))
            }
            if (piece.isCaptured) {
                this.handleError(new Error(`Piece ${piece.getName()} is already captured.`))
            }
        }
        return piece.validateAndGetMoveType(this, from, to, false);
    }

    // TODO: Split up into smaller, more manageable functions.
    manualMove(from: Square, to: Square, processConditions: boolean = true) {
        const moveType = this.validateAndGetMoveType(from.piece!, from, to);
        if (moveType == MoveType.INVALID) {
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
            const rook = (from.piece! as King).findCastlingRook(this, from, to)
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
            const swaps: any[] = [{ piece: from.piece,from: from,to: to }]
            if (to.piece) { // Capture
                swaps.push({ piece: to.piece, from: to })
            }
            this.executeSwaps({ moveType: moveType, swaps: swaps })
        }
        // Condition processing is done after moving
        // TODO: Absorb logic of processCheckCondition and processPromotionCondition into evalCondition
        if (processConditions) {
            this.processCheckCondition(); 
            this.processPromotionCondition();
            this.condition = evaluateGameCondition(this);
            this.moveHistory[this.moveHistory.length - 1].notation = notateLastMove(this);
        }
    }

    executeSwaps(move: Move, undo: boolean = false) {
        if (!undo) {
            this.moveHistory.push(move);
        }
        for (const swap of move.swaps // Order of operations: first captures, then everything else
            .sort((a, b) => [a, b]
                .map((m: Swap): number => m.to ? 0 : 1)
                .reduce((prev, curr, i) => prev + curr * (undo?-1:1) * (i%2?1:-1), 0) // a - b if not undo, b - a if undo
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
        this.computeTargets();
    }

    // Check if the current king is in check, or if it is on a square that is being attacked by the opposite color.
    processCheckCondition() {
        if (inCheck(this, oppositeOf(this.toMove))) {
            this.undo();
        }
    }

    // Check if the last move was a pawn moving onto the last rank; if so, set the move progress to PROMOTING
    // so that the UI can offer the user a list of pieces to promote to.
    processPromotionCondition() {
        const move = this.moveHistory[this.moveHistory.length - 1];
        const swap = move.swaps.filter(swap => swap.piece && swap.from && swap.to)[0];
        if (swap 
            && move.moveType == MoveType.NORMAL
            && swap.piece && swap.piece.type == PieceType.PAWN
            && swap.to && swap.to.rank == (swap.piece.color == Color.WHITE ? 8 : 1)) {
                this.moveStage = MoveStage.PROMOTING;
        }
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
                switch (pieceType) {
                    case PieceType.KNIGHT:
                        promotionPiece = new Knight({
                            color: this.toMove,
                            initRank: swap.to.rank,
                            initFile: swap.to.file,
                            square: swap.to,
                        });
                        break;
                    case PieceType.BISHOP:
                        promotionPiece = new Bishop({
                            color: this.toMove,
                            initRank: swap.to.rank,
                            initFile: swap.to.file,
                            square: swap.to,
                        });
                        break;
                    case PieceType.ROOK:
                        promotionPiece = new Rook({
                            color: this.toMove,
                            initRank: swap.to.rank,
                            initFile: swap.to.file,
                            square: swap.to,
                        });
                        break;
                    default:
                        promotionPiece = new Queen({
                            color: this.toMove,
                            initRank: swap.to.rank,
                            initFile: swap.to.file,
                            square: swap.to,
                        });
                        break;
                }
                this.pieces.push(promotionPiece!)
                newSwaps.push({ piece: swap.piece, from: swap.from })
                newSwaps.push({ piece: promotionPiece, to: swap.to })
                // TODO: Make sure that the pawn isn't treated the same as other captured pieces in later features
            }
        })
        this.executeSwaps({
            moveType: MoveType.PROMOTION,
            swaps: newSwaps,
        });
        this.moveHistory[this.moveHistory.length - 1].notation = notateLastMove(this);
        this.moveStage = MoveStage.IDLE
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
