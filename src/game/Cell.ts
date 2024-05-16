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
    piece: Piece | null
    rank: number
    file: number
    isSelected: boolean
    targetingPieces: Map<Color, Piece[]>
    constructor(props: CellProps) {
        this.rank = props.rank
        this.file = props.file
        this.color = props.rank % 2 === props.file % 2 ? CellColor.LIGHT : CellColor.DARK
        this.piece = null
        this.isSelected = false
        this.targetingPieces = new Map<Color, Piece[]>()
        this.targetingPieces.set(Color.WHITE, [])
        this.targetingPieces.set(Color.BLACK, [])
    }

    place(piece: Piece) {
        this.piece = piece
        this.piece.rank = this.rank
        this.piece.file = this.file
        this.piece.cell = this
    }

    remove() {
        this.piece = null
    }

    select() {
        this.isSelected = true
    }

    deselect() {
        this.isSelected = false
    }
}
