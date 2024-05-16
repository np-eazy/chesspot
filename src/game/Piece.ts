import { Cell } from "./Cell"
import { Color, GameState } from "./GameState"

export type PieceProps = {
    color: Color,
    initRank: number,
    initFile: number,
    cell: Cell
}

export class Piece {
    rank: number
    file: number
    color: Color
    materialValue: number
    symbol: string
    cell: Cell
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.rank = props.initRank
        this.file = props.initFile
        this.color = props.color
        this.symbol = ""
        this.cell = props.cell
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        return (this.color != to.piece?.color);
    }
}

export class Pawn extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 1;
        this.symbol = this.color == Color.WHITE ? "♙" : "♟";
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        // Check if pawn is on starting rank and moving 2 steps forward
        if (from.rank == (this.color == Color.WHITE ? 2 : 7)) {
            if (to.rank - from.rank == 2 * this.color && from.file == to.file) {
                return super.validateMove(gameState, from, to);
            }
        }
        // Check if pawn is capturing a piece
        if (to.piece) {
            if (to.piece.color != this.color) {
                if (to.rank - from.rank == this.color && Math.abs(from.file - to.file) == 1) {
                    return super.validateMove(gameState, from, to);
                } else {
                    return false
                }
            } else {
                return false
            }
        }
        // Move 1 step forward
        return to.rank - from.rank == this.color && to.file == from.file && super.validateMove(gameState, from, to);
    }
}

export class Knight extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♘" : "♞";
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        if (Math.abs(from.rank - to.rank) == 2 && Math.abs(from.file - to.file) == 1) {
            return super.validateMove(gameState, from, to);
        }
        if (Math.abs(from.rank - to.rank) == 1 && Math.abs(from.file - to.file) == 2) {
            return super.validateMove(gameState, from, to);
        }
        return false
    }
}

export const validateDiagonal = (gameState: GameState, from: Cell, to: Cell): boolean => {
    let [rank, file] = [from.rank + (to.rank > from.rank ? 1 : -1), from.file + (to.file > from.file ? 1 : -1)]
    while (rank != to.rank && file != to.file) {
        if (gameState.board[rank - 1][file - 1].piece) {
            return false
        }
        [rank, file] = [rank + (to.rank > from.rank ? 1 : -1), file + (to.file > from.file ? 1 : -1)]
    }
    return true
}

export const validateStraight = (gameState: GameState, from: Cell, to: Cell): boolean => {
    if (from.rank == to.rank) {
        let file = from.file + (to.file > from.file ? 1 : -1)
        while (file != to.file) {
            console.log(from.rank, file)
            if (gameState.board[from.rank - 1][file - 1].piece) {
                console.log(from.rank, file)
                console.log(gameState.board[from.rank - 1][file - 1].piece)
                return false
            }
            file += to.file > from.file ? 1 : -1
        }
        return true
    }
    if (from.file == to.file) {
        let rank = from.rank + (to.rank > from.rank ? 1 : -1)
        while (rank != to.rank) {
            console.log(rank, from.file)
            if (gameState.board[rank - 1][from.file - 1].piece) {
                console.log(rank, from.file)
                console.log(gameState.board[rank - 1][from.file - 1].piece)
                return false
            }
            rank += to.rank > from.rank ? 1 : -1
        }
        return true
    }
    return false
}

export class Bishop extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.WHITE ? "♗" : "♝";
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        if ((Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) && super.validateMove(gameState, from, to)) {
            return validateDiagonal(gameState, from, to)
        }
        return false
    }
}


export class Rook extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 5;
        this.symbol = this.color == Color.WHITE ? "♖" : "♜";
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        if ((from.rank == to.rank || from.file == to.file) && super.validateMove(gameState, from, to)) {
            return validateStraight(gameState, from, to)
        }
        return false
    }
}

export class Queen extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 9;
        this.symbol = this.color == Color.WHITE ? "♕" : "♛";
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        if (super.validateMove(gameState, from, to)) {
            if (Math.abs(from.rank - to.rank) == Math.abs(from.file - to.file)) {
                return validateDiagonal(gameState, from, to)
            } else if (from.rank == to.rank || from.file == to.file) {
                return validateStraight(gameState, from, to)
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
    }
    validateMove(gameState: GameState, from: Cell, to: Cell): boolean {
        return Math.abs(from.rank - to.rank) <= 1 && Math.abs(from.file - to.file) <= 1 && super.validateMove(gameState, from, to);
    }
}

