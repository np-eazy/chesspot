import { Color } from "./GameState"
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

    getName() {
        return `${String.fromCharCode(96 + this.file)}${this.rank}`
    }

    isAttackedBy(color: Color): boolean {
        const targetingPieces = this.targetingPieces.get(color)
        return targetingPieces!.length > 0
    }
}
