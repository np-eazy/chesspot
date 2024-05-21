import { Square } from "./Square"
import { Color, ValidatedGameState, MoveType } from "./GameState"
import { outOfBounds, validateDiagonal, validateStraight } from "./utils/pathValidation"
import { oppositeOf } from "./utils/moveUtils"

export type PieceProps = {
    color: Color,
    initRank: number,
    initFile: number,
    square: Square
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
    square: Square
    type: PieceType
    isCaptured: boolean
    firstMovedOn: number
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.color = props.color
        this.symbol = ""
        this.square = props.square
        this.type = PieceType.NULL
        this.isCaptured = false
        this.firstMovedOn = -1
    }
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
        if (!from.piece) {
            return MoveType.INVALID
        }
        if (!passive && from.piece.color !== gameState.toMove) {
            return MoveType.INVALID
        }
        if (!passive) {
            return ((this.color != to.piece?.color) && from != to) ? MoveType.NORMAL : MoveType.INVALID;
        } else {
            return from != to ? MoveType.NORMAL : MoveType.INVALID;
        }
    }
    getName() {
        return `${this.type} ${String.fromCharCode(96 + this.square.file)}${this.square.rank}`
    }
    getLegalSquares(gameState: ValidatedGameState) {
        const squares: Square[] = []
        gameState.board.forEach(row => {
            row.forEach(square => {
                if (this.validateAndGetMoveType(gameState, this.square, square, false) != MoveType.INVALID) {
                    squares.push(square)
                }
            })
        })
        return squares
    }
}

export class Pawn extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 1;
        this.symbol = this.color == Color.WHITE ? "♙" : "♟";
        this.type = PieceType.PAWN
    }
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
        // Check if pawn is on starting rank and moving 2 steps forward
        if (!passive && from.rank == (this.color == Color.WHITE ? 2 : 7)) {
            if (to.rank - from.rank == 2 * this.color && from.file == to.file) {
                if (gameState.square(from.rank + this.color, to.file).piece) {
                    return MoveType.INVALID
                }
                return super.validateAndGetMoveType(gameState, from, to, passive);
            }
        }
        // Check if pawn is capturing a piece
        if (to.rank - from.rank == this.color && Math.abs(from.file - to.file) == 1) {
            if (passive || (to.piece && (to.piece.color != this.color))) {
                return super.validateAndGetMoveType(gameState, from, to, passive);
            } else if (!passive && !to.piece) { // Check if pawn is doing en passant
                const lastTurn = gameState.moveHistory[gameState.moveHistory.length - 1]
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
            && !to.piece
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
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
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
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
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
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
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
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
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
    validateAndGetMoveType(gameState: ValidatedGameState, from: Square, to: Square, passive: boolean): MoveType {
        if (Math.abs(from.rank - to.rank) <= 1 && Math.abs(from.file - to.file) <= 1 
            && super.validateAndGetMoveType(gameState, from, to, passive) != MoveType.INVALID) {
            return MoveType.NORMAL
        } else if (!passive && 
            Math.abs(from.rank - to.rank) == 0 && Math.abs(from.file - to.file) == 2 && // King wants to move 2 steps
            this.firstMovedOn == -1 && // King has not moved
            from.targetingPieces.get(this.color * -1)!.length == 0 && // King is not in check
            gameState.square(to.rank, to.file).targetingPieces.get(this.color * -1)!.length == 0 // King is not castling into check
        ) {
            const dxn = (to.file - from.file) / 2; // King is not walking through an attacked or obstructed square
            let file = from.file + dxn;  
            if (gameState.square(from.rank, file).targetingPieces.get(this.color * -1)!.length > 0) {
                return MoveType.INVALID
            }
            while (!outOfBounds(gameState, from.rank, file)) { // Nothing between king and rook
                const piece = gameState.square(from.rank, file).piece
                if (piece) {
                    if (piece?.type == PieceType.ROOK && piece.firstMovedOn == -1) { // Rook has not moved
                        return MoveType.CASTLE
                    } else {
                        return MoveType.INVALID
                    }
                }
                file += dxn;
            }
        }
        return MoveType.INVALID
    }
    findCastlingRook(gameState: ValidatedGameState, from: Square, to: Square): Rook {
        const dxn = (to.file - from.file) / 2;
        let file = this.square.file + dxn;
        while (!outOfBounds(gameState, this.square.rank, file) && gameState.square(this.square.rank, file).piece?.type != PieceType.ROOK) {
            file += dxn;
        }
        const rook: Piece = gameState.square(this.square.rank, file).piece!
        return rook
    }
}
