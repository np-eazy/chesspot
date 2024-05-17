import { Cell } from "./Cell"
import { Color, GameState, SpecialInstruction } from "./GameState"
import { outOfBounds, validateDiagonal, validateStraight } from "./pathValidation"

export type PieceProps = {
    color: Color,
    initRank: number,
    initFile: number,
    cell: Cell
}

export enum PieceType {
    NULL,
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING
}

export class Piece {
    rank: number
    file: number
    color: Color
    materialValue: number
    symbol: string
    cell: Cell
    type: PieceType
    isCaptured: boolean
    firstMovedOnTurn: number
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.rank = props.initRank
        this.file = props.initFile
        this.color = props.color
        this.symbol = ""
        this.cell = props.cell
        this.type = PieceType.NULL
        this.isCaptured = false
        this.firstMovedOnTurn = -1
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if (!ignoreBattery) {
            return (this.color != to.piece?.color) && from != to;
        } else {
            return from != to
        }
    }
}

export class Pawn extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 1;
        this.symbol = this.color == Color.WHITE ? "♙" : "♟";
        this.type = PieceType.PAWN
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        // Check if pawn is on starting rank and moving 2 steps forward
        if (!ignoreBattery && from.rank == (this.color == Color.WHITE ? 2 : 7)) {
            if (to.rank - from.rank == 2 * this.color && from.file == to.file) {
                return super.validateMove(gameState, from, to, ignoreBattery);
            }
        }
        // Check if pawn is capturing a piece
        if (ignoreBattery || (to.piece && (to.piece.color != this.color))) {
            if (to.rank - from.rank == this.color && Math.abs(from.file - to.file) == 1) {
                if (ignoreBattery || (to.piece && (to.piece.color != this.color))) {
                    return super.validateMove(gameState, from, to, ignoreBattery);
                } else {
                    const [enPassantFrom, enPassantTo, enPassantPiece, instruction] = gameState.moveHistory[gameState.moveHistory.length - 1]
                    if (
                        to.rank == Color.WHITE ? 5 : 4 &&
                        enPassantTo.piece?.type == PieceType.PAWN &&
                        Math.abs(enPassantFrom.rank - enPassantTo.rank) == 2 &&
                        enPassantFrom.file == to.file
                    ) {
                        if (!ignoreBattery) {
                            gameState.specialInstructions.push(SpecialInstruction.EN_PASSANT)
                        }
                        return true
                    } else {
                        return false
                    }
                }
            }
        }
        // Move 1 step forward
        if (ignoreBattery ? false : (to.rank - from.rank == this.color && to.file == from.file && super.validateMove(gameState, from, to, ignoreBattery))) {
            if (!ignoreBattery && to.rank == (this.color == Color.WHITE ? 8 : 1)) {
                gameState.specialInstructions.push(SpecialInstruction.PROMOTE)
            }
            return true;
        }
        return false;
    }
}

export class Knight extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♘" : "♞";
        this.type = PieceType.KNIGHT
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if (Math.abs(from.rank - to.rank) == 2 && Math.abs(from.file - to.file) == 1) {
            return super.validateMove(gameState, from, to, ignoreBattery);
        }
        if (Math.abs(from.rank - to.rank) == 1 && Math.abs(from.file - to.file) == 2) {
            return super.validateMove(gameState, from, to, ignoreBattery);
        }
        return false
    }
}

export class Bishop extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♗" : "♝";
        this.type = PieceType.BISHOP
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if ((Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) && super.validateMove(gameState, from, to, ignoreBattery)) {
            return validateDiagonal(gameState, from, to, ignoreBattery)
        }
        return false
    }
}

export class Rook extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 5;
        this.symbol = this.color == Color.WHITE ? "♖" : "♜";
        this.type = PieceType.ROOK
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if ((from.rank == to.rank || from.file == to.file) && super.validateMove(gameState, from, to, ignoreBattery)) {
            return validateStraight(gameState, from, to, ignoreBattery)
        }
        return false
    }
}

export class Queen extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 9;
        this.symbol = this.color == Color.WHITE ? "♕" : "♛";
        this.type = PieceType.QUEEN
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if (super.validateMove(gameState, from, to, ignoreBattery)) {
            if (Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) {
                return validateDiagonal(gameState, from, to, ignoreBattery)
            } else if (from.rank == to.rank || from.file == to.file) {
                return validateStraight(gameState, from, to, ignoreBattery)
            }
        }
        return false
    }
}

export class King extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 0;
        this.symbol = this.color == Color.WHITE ? "♔" : "♚";
        this.type = PieceType.KING
    }
    validateMove(gameState: GameState, from: Cell, to: Cell, ignoreBattery: boolean): boolean {
        if (Math.abs(from.rank - to.rank) <= 1 && Math.abs(from.file - to.file) <= 1 
            && super.validateMove(gameState, from, to, ignoreBattery)) {
            return true
        } else if (!ignoreBattery && 
            // King wants to move 2 steps
            Math.abs(from.rank - to.rank) == 0 && Math.abs(from.file - to.file) == 2 && 
            // King is not in check
            from.targetingPieces.get(this.color == Color.WHITE ? Color.BLACK : Color.WHITE)?.length == 0 &&
            // King has not moved
            this.firstMovedOnTurn == -1 &&
            // King is not castling into check
            gameState.board[from.rank - 1][to.file - 1].targetingPieces.get(this.color == Color.WHITE ? Color.BLACK : Color.WHITE)!.length == 0
        ) {
            let file = from.file + (to.file - from.file) / 2
            // King is not walking through an attacked square
            if (gameState.board[from.rank - 1][file - 1].targetingPieces.get(this.color == Color.WHITE ? Color.BLACK : Color.WHITE)!.length > 0) {
                return false
            }
            // Nothing between king and rook
            while (!outOfBounds(gameState, from.rank, file)) {
                const piece = gameState.board[from.rank - 1][file - 1].piece
                // Rook has not moved
                if (piece) {
                    if (piece?.type == PieceType.ROOK && piece.firstMovedOnTurn == -1) {
                        gameState.specialInstructions.push(SpecialInstruction.CASTLE)
                        return true
                    } else {
                        return false
                    }
                }
                file += (to.file - from.file) / 2
            }
            return false
        }
        return false
    }
}

