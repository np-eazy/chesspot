import { Color } from "./GameState"
import { Piece } from "./Piece"

export enum CellColor {
    LIGHT = 0,
    DARK = 1,
}

export type CellProps = {
    rank: number
    file: number
}

export class Cell {
    color: CellColor
    piece?: Piece
    rank: number
    file: number
    isSelected: boolean
    targetingPieces: Map<Color, Piece[]>
    constructor(props: CellProps) {
        this.rank = props.rank
        this.file = props.file
        this.color = props.rank % 2 === props.file % 2 ? CellColor.LIGHT : CellColor.DARK
        this.isSelected = false
        this.targetingPieces = new Map<Color, Piece[]>()
        this.targetingPieces.set(Color.WHITE, [])
        this.targetingPieces.set(Color.BLACK, [])
    }

    place(piece: Piece) {
        this.piece = piece
        this.piece.cell = this
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
}
