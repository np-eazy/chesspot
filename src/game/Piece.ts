import { Cell } from "./Cell"
import { Color, GameState, MoveType } from "./GameState"
import { outOfBounds, validateDiagonal, validateStraight } from "./pathValidation"

export type PieceProps = {
    color: Color,
    initRank: number,
    initFile: number,
    cell: Cell
}

export enum PieceType {
    NULL = "NULL",
    PAWN = "PAWN",
    KNIGHT = "KNIGHT",
    BISHOP = "BISHOP",
    ROOK = "ROOK",
    QUEEN = "QUEEN",
    KING = "KING"
}

export class Piece {
    color: Color
    materialValue: number
    symbol: string
    cell: Cell
    type: PieceType
    isCaptured: boolean
    firstMovedOnTurn: number
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.color = props.color
        this.symbol = ""
        this.cell = props.cell
        this.type = PieceType.NULL
        this.isCaptured = false
        this.firstMovedOnTurn = -1
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if (!from.piece) {
            throw new Error("No piece to move")
        }
        if (!passive && from.piece.color !== gameState.turn) {
            return MoveType.INVALID
        }
        if (!passive) {
            return ((this.color != to.piece?.color) && from != to) ? MoveType.NORMAL : MoveType.INVALID;
        } else {
            return from != to ? MoveType.NORMAL : MoveType.INVALID;
        }
    }
    getName() {
        return `${this.type} ${String.fromCharCode(96 + this.cell.file)}${this.cell.rank}`
    }
}

export class Pawn extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 1;
        this.symbol = this.color == Color.WHITE ? "♙" : "♟";
        this.type = PieceType.PAWN
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        // Check if pawn is on starting rank and moving 2 steps forward
        if (!passive && from.rank == (this.color == Color.WHITE ? 2 : 7)) {
            if (to.rank - from.rank == 2 * this.color && from.file == to.file) {
                return super.validateAndGetMoveType(gameState, from, to, passive);
            }
        }
        // Check if pawn is capturing a piece
        if (to.rank - from.rank == this.color && Math.abs(from.file - to.file) == 1) {
            if (passive || (to.piece && (to.piece.color != this.color))) {
                return super.validateAndGetMoveType(gameState, from, to, passive);
            } else if (!passive && !to.piece) { // Check if pawn is doing en passant
                const lastTurn = gameState.turnHistory[gameState.turnHistory.length - 1]
                const lastSwap = lastTurn.swaps[0]
                if (lastTurn.swaps.length != 1 
                    || !lastSwap.piece 
                    || lastSwap.piece.type !== PieceType.PAWN
                    || lastSwap.from!.file != lastSwap.to!.file
                    || lastSwap.to!.rank - lastSwap.from!.rank != 2 * lastSwap.piece!.color) {
                    return MoveType.INVALID
                }
                if (
                    to.rank == Color.WHITE ? 5 : 4 &&
                    lastSwap.to!.piece?.type == PieceType.PAWN &&
                    Math.abs(lastSwap.from!.rank - lastSwap.to!.rank) == 2 &&
                    lastSwap.from!.file == to.file
                ) {
                    return MoveType.EN_PASSANT
                } else {
                    return MoveType.INVALID
                }
            }
        }
        
        // Move 1 step forward
        if (passive ? false : (to.rank - from.rank == this.color && to.file == from.file 
            && super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID)) {
            return MoveType.NORMAL;
        }
        return MoveType.INVALID;
    }
}

export class Knight extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♘" : "♞";
        this.type = PieceType.KNIGHT
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if (Math.abs(from.rank - to.rank) == 2 && Math.abs(from.file - to.file) == 1) {
            return super.validateAndGetMoveType(gameState, from, to, passive);
        }
        if (Math.abs(from.rank - to.rank) == 1 && Math.abs(from.file - to.file) == 2) {
            return super.validateAndGetMoveType(gameState, from, to, passive);
        }
        return MoveType.INVALID
    }
}

export class Bishop extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♗" : "♝";
        this.type = PieceType.BISHOP
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if ((Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) 
            && super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID) {
            return validateDiagonal(gameState, from, to, passive) ? MoveType.NORMAL : MoveType.INVALID
        }
        return MoveType.INVALID
    }
}

export class Rook extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 5;
        this.symbol = this.color == Color.WHITE ? "♖" : "♜";
        this.type = PieceType.ROOK
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if ((from.rank == to.rank || from.file == to.file) 
            && super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID) {
            return validateStraight(gameState, from, to, passive) ? MoveType.NORMAL : MoveType.INVALID
        }
        return MoveType.INVALID
    }
}

export class Queen extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 9;
        this.symbol = this.color == Color.WHITE ? "♕" : "♛";
        this.type = PieceType.QUEEN
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if (super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID) {
            if (Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) {
                return validateDiagonal(gameState, from, to, passive) ? MoveType.NORMAL : MoveType.INVALID
            } else if (from.rank == to.rank || from.file == to.file) {
                return validateStraight(gameState, from, to, passive) ? MoveType.NORMAL : MoveType.INVALID
            }
        }
        return MoveType.INVALID
    }
}

export class King extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 0;
        this.symbol = this.color == Color.WHITE ? "♔" : "♚";
        this.type = PieceType.KING
    }
    validateAndGetMoveType(gameState: GameState, from: Cell, to: Cell, passive: boolean): MoveType {
        if (Math.abs(from.rank - to.rank) <= 1 && Math.abs(from.file - to.file) <= 1 
            && super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID) {
            return MoveType.NORMAL

        } else if (!passive && 
            Math.abs(from.rank - to.rank) == 0 && Math.abs(from.file - to.file) == 2 && // King wants to move 2 steps
            this.firstMovedOnTurn == -1 && // King has not moved
            from.targetingPieces.get(this.color * -1)!.length == 0 && // King is not in check
            gameState.getCell(to.rank, to.file).targetingPieces.get(this.color * -1)!.length == 0 // King is not castling into check
        ) {
            const dxn = (to.file - from.file) / 2;
            let file = from.file + dxn;  // King is not walking through an attacked square
            if (gameState.getCell(from.rank, file).targetingPieces.get(this.color * -1)!.length > 0) {
                return MoveType.INVALID
            }
            while (!outOfBounds(gameState, from.rank, file)) { // Nothing between king and rook
                const piece = gameState.getCell(from.rank, file).piece
                if (piece) {
                    if (piece?.type == PieceType.ROOK && piece.firstMovedOnTurn == -1) { // Rook has not moved
                        return MoveType.CASTLE
                    } else {
                        return MoveType.INVALID
                    }
                }
                file += dxn;
            }
            return MoveType.INVALID
        }
        return MoveType.INVALID
    }
    findCastlingRook(gameState: GameState, from: Cell, to: Cell): Rook {
        const dxn = (to.file - from.file) / 2;
        let file = this.cell.file + dxn;
        while (!outOfBounds(gameState, this.cell.rank, file) && gameState.getCell(this.cell.rank, file).piece?.type != PieceType.ROOK) {
            file += dxn;
        }
        try {
            const rook: Piece = gameState.getCell(this.cell.rank, file).piece!
            return rook
        } catch (e) {
            throw new Error("Castling rook not found. Make sure that the conditions to castle are correctly detected.")
        }
    }
}

