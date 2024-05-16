import { Cell } from "./Cell"
import { Color, GameState } from "./GameState"
import { validateDiagonal, validateStraight } from "./pathValidation"

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
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.rank = props.initRank
        this.file = props.initFile
        this.color = props.color
        this.symbol = ""
        this.cell = props.cell
        this.type = PieceType.NULL
        this.isCaptured = false
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
        if ((to.piece && (to.piece.color != this.color)) || ignoreBattery) {
            if (to.rank - from.rank == this.color && Math.abs(from.file - to.file) == 1) {
                return super.validateMove(gameState, from, to, ignoreBattery);
            } else {
                return false
            }
        } 
        // Move 1 step forward
        return ignoreBattery ? false : (to.rank - from.rank == this.color && to.file == from.file && super.validateMove(gameState, from, to, ignoreBattery));
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
        return Math.abs(from.rank - to.rank) <= 1 && Math.abs(from.file - to.file) <= 1 && super.validateMove(gameState, from, to, ignoreBattery);
    }
}

