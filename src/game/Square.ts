import { Color, ValidatedGameState, MoveType } from "./GameState"
import { Piece } from "./Piece"

export enum SquareColor {
    LIGHT = 0,
    DARK = 1,
}

export type SquareProps = {
    rank: number
    file: number
}

export class Square {
    color: SquareColor
    piece?: Piece
    rank: number
    file: number
    isSelected: boolean
    targetingPieces: Map<Color, Piece[]>
    constructor(props: SquareProps) {
        this.rank = props.rank
        this.file = props.file
        this.color = props.rank % 2 === props.file % 2 ? SquareColor.LIGHT : SquareColor.DARK
        this.isSelected = false
        this.targetingPieces = new Map<Color, Piece[]>()
        this.targetingPieces.set(Color.WHITE, [])
        this.targetingPieces.set(Color.BLACK, [])
    }

    place(piece: Piece) {
        this.piece = piece
        this.piece.square = this
    }

    remove() {
        this.piece = undefined
    }

    select() {
        this.isSelected = true
    }

    deselect() {
        this.isSelected = false
    }

    computeAttackers(gameState: ValidatedGameState) {
        this.targetingPieces.set(Color.WHITE, [])
        this.targetingPieces.set(Color.BLACK, [])
        gameState.pieces.filter((piece: Piece) => !piece.isCaptured).forEach((piece: Piece) => {
            if (piece && piece.validateAndGetMoveType(piece.square, this, true) != MoveType.INVALID) {
                this.targetingPieces.get(piece.color)!.push(piece)
            }
        })
    }

    isAttackedBy(color: Color): boolean {
        const targetingPieces = this.targetingPieces.get(color)
        return targetingPieces!.length > 0
    }

    isRank(rank: number) {
        return this.rank == rank
    }

    isFile(file: number) {
        return this.file == file
    }

    sameRankAs(square: Square) {
        return this.rank == square.rank
    }

    sameFileAs(square: Square) {
        return this.file == square.file
    }

    sameCoords(rank: number, file: number) {
        return this.rank == rank && this.file == file
    }

    isEmpty() {
        return !this.piece
    }
}
