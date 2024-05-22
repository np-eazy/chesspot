import { Square } from "./Square"
import { Color, ValidatedGameState, MoveType } from "./GameState"
import { traverseSegment, validateDiagonal, validateStraight } from "./utils/segmentValidation"
import { colorDxn, fileDiff, fileDxn, isCapturingMove, rankDiff, rankSwapDiff, sameFileSwap,oppositeOf } from "./utils/moveUtils"

export type PieceProps = {
    color: Color,
    initRank: number,
    initFile: number,
    square: Square,
    gameState: ValidatedGameState,
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
    gameState: ValidatedGameState
    constructor(props: PieceProps) {
        this.materialValue = 0
        this.color = props.color
        this.symbol = ""
        this.square = props.square
        this.type = PieceType.NULL
        this.isCaptured = false
        this.firstMovedOn = -1
        this.gameState = props.gameState
    }
    static totalMaterial(pieces: Piece[]): number {
        return pieces.reduce((total, piece) => total + (piece.isCaptured ? 0 : piece.materialValue), 0)
    }
    // Rank methods should be in the Pawn class logically, but putting them here avoids annoying type casting
    startingRank(): number {
        return this.color == Color.WHITE ? 2 : 7
    }
    enPassantRank(): number {
        return this.color == Color.WHITE ? 6 : 3
    }
    promotionRank(): number {
        return this.color == Color.WHITE ? 8 : 1
    }
    validateAndGetMoveType(from: Square, to: Square, passive: boolean): MoveType {
        return MoveType.NORMAL;
    }
    sameColorAs(color: Color | Piece | undefined | null): boolean {
        if (color instanceof Piece) {
            return this.color == color.color
        }
        return color ? this.color == color : false
    }
    isType(type: PieceType): boolean {
        return this.type == type
    }
    hasNotMoved(): boolean {
        return this.firstMovedOn == -1
    }
    
}

export const providePiece = (props: PieceProps, type: PieceType): Piece => {
    switch (type) {
        case PieceType.PAWN:
            return new Pawn(props)
        case PieceType.KNIGHT:
            return new Knight(props)
        case PieceType.BISHOP:
            return new Bishop(props)
        case PieceType.ROOK:
            return new Rook(props)
        case PieceType.QUEEN:
            return new Queen(props)
        case PieceType.KING:
            return new King(props)
        default:
            throw new Error("Invalid piece type")
    }
}

export class Pawn extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 1;
        this.symbol = this.color == Color.BLACK ? "♙" : "♟";
        this.type = PieceType.PAWN
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        // Case 1: Pawn is moving forward
        if (!passive && fromSquare.isRank(this.startingRank())) {
            if (rankDiff(fromSquare, toSquare) == 2*colorDxn(this) && fromSquare.sameFileAs(toSquare)) {
                return this.gameState.square(fromSquare.rank + colorDxn(this), toSquare.file).isEmpty()
                    ? MoveType.NORMAL
                    : MoveType.INVALID
            }
        }
        // Case 2: Pawn is capturing a piece
        if (rankDiff(fromSquare, toSquare) == colorDxn(this) && Math.abs(fileDiff(fromSquare, toSquare)) == 1) {
            if (passive || (!toSquare.isEmpty() && !this.sameColorAs(toSquare.piece))) {
                return MoveType.NORMAL
            } else if (!passive && toSquare.isEmpty()) { // Check if pawn is doing en passant
                const opPawnSwap = this.gameState.lastTurn().swaps[0]
                return (!isCapturingMove(this.gameState.lastTurn()) // This guarantees that the last turn swaps only had one element
                    && opPawnSwap.piece!.isType(PieceType.PAWN)
                    && sameFileSwap(opPawnSwap)
                    && rankSwapDiff(opPawnSwap) == 2*colorDxn(opPawnSwap.piece!)
                    && toSquare.isRank(this.enPassantRank())) ? MoveType.EN_PASSANT : MoveType.INVALID
            }
        }
        // Case 3: Move 1 step forward
        return (!passive 
            && (rankDiff(fromSquare, toSquare) == colorDxn(this) 
            && fromSquare.sameFileAs(toSquare)
            && toSquare.isEmpty()))
            ? MoveType.NORMAL
            : MoveType.INVALID;
    }
}

export class Knight extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.BLACK ? "♘" : "♞";
        this.type = PieceType.KNIGHT
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        return ((Math.abs(rankDiff(fromSquare, toSquare)) == 2 && Math.abs(fileDiff(fromSquare, toSquare)) == 1) 
            || (Math.abs(rankDiff(fromSquare, toSquare)) == 1 && Math.abs(fileDiff(fromSquare, toSquare)) == 2)) 
            ? MoveType.NORMAL
            : MoveType.INVALID
    }
}

export class Bishop extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 3;
        this.symbol = this.color == Color.BLACK ? "♗" : "♝";
        this.type = PieceType.BISHOP
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        return (Math.abs(rankDiff(fromSquare, toSquare)) == Math.abs(fileDiff(fromSquare, toSquare))) 
            && validateDiagonal(this.gameState, fromSquare, toSquare, passive)
            ? MoveType.NORMAL
            : MoveType.INVALID
    }
}

export class Rook extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 5;
        this.symbol = this.color == Color.BLACK ? "♖" : "♜";
        this.type = PieceType.ROOK
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        return ((fromSquare.sameRankAs(toSquare) || fromSquare.sameFileAs(toSquare)) 
            && validateStraight(this.gameState, fromSquare, toSquare, passive))
            ? MoveType.NORMAL
            : MoveType.INVALID
    }
}

export class Queen extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 9;
        this.symbol = this.color == Color.BLACK ? "♕" : "♛";
        this.type = PieceType.QUEEN
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        return (Math.abs(rankDiff(fromSquare, toSquare)) == Math.abs(fileDiff(fromSquare, toSquare))) ?
            (validateDiagonal(this.gameState, fromSquare, toSquare, passive) ? MoveType.NORMAL : MoveType.INVALID)
        : (fromSquare.sameRankAs(toSquare) || fromSquare.sameFileAs(toSquare)) ?
            (validateStraight(this.gameState, fromSquare, toSquare, passive) ? MoveType.NORMAL : MoveType.INVALID)
        : MoveType.INVALID
    }
}

export class King extends Piece {
    constructor(props: PieceProps) {
        super(props);
        this.materialValue = 0;
        this.symbol = this.color == Color.BLACK ? "♔" : "♚";
        this.type = PieceType.KING
    }
    validateAndGetMoveType(fromSquare: Square, toSquare: Square, passive: boolean): MoveType {
        if (Math.abs(rankDiff(fromSquare, toSquare)) <= 1 && Math.abs(fileDiff(fromSquare, toSquare)) <= 1) {
            return MoveType.NORMAL
        } else if (!passive && 
            fromSquare.sameRankAs(toSquare) && Math.abs(fileDiff(fromSquare, toSquare)) == 2 
            && this.hasNotMoved() // King has not moved
            && !fromSquare.isAttackedBy(oppositeOf(this.color)) // King is not in check
            && !this.gameState.square(fromSquare.rank, fromSquare.file + fileDxn(fromSquare, toSquare)).isAttackedBy(oppositeOf(this.color))
            && !toSquare.isAttackedBy(oppositeOf(this.color)) // King is not castling into check
        ) {
            let moveType: MoveType;
            traverseSegment({
                gameState: this.gameState,
                start: fromSquare,
                fileDxn: fileDxn(fromSquare, toSquare),
                loopCondition: (square: Square) => square.isEmpty(),
                exitCallback: (square: Square) => {
                    moveType = (square.piece!.isType(PieceType.ROOK) && square.piece!.hasNotMoved())  // Rook has not moved
                        ? MoveType.CASTLE
                        : MoveType.INVALID
                }
            })
            return moveType!
        }
        return MoveType.INVALID
    }
    // Validation should have already been done to make sure that the castling rook can be found.
    findCastlingRook(fromSquare: Square, toSquare: Square): Rook {
        let rook: Rook | undefined = undefined;
        traverseSegment({
            gameState: this.gameState,
            start: this.square,
            fileDxn: fileDxn(fromSquare, toSquare),
            loopCondition: (square: Square) => !square.piece?.isType(PieceType.ROOK),
            exitCallback: (square: Square) => {
                rook = square.piece!
            }
        })
        return rook! as Rook;
    }
}
