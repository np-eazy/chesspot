import { GameCondition, ValidatedGameState, MoveStage } from "../GameState";
import { PieceType } from "../Piece";
import { Square } from "../Square";
import { notateLastMove } from "../notation/notation";
import { evaluateGameCondition, inCheck } from "../utils/conditionEval";
import { oppositeOf } from "../utils/moveUtils";

export class ManualGameState extends ValidatedGameState {
    moveStage: MoveStage
    selectedSquare: Square | null

    constructor(gameState: ValidatedGameState) {
        super();
        this.board = gameState.board;
        this.pieces = gameState.pieces;
        this.toMove = gameState.toMove;
        this.moveHistory = gameState.moveHistory;
        this.undoStack = gameState.undoStack;
        this.condition = gameState.condition;

        this.moveStage = MoveStage.IDLE
        this.selectedSquare = null

    }

    handleError(e: Error) {
        super.handleError(e);
        this.clearSelection();
    }

    selectAndAdvance(square: Square) {
        if (this.moveStage === MoveStage.IDLE) {
            if (square.piece && square.piece.color === this.toMove) {
                this.moveStage = MoveStage.MOVING
                this.selectedSquare = square
                square.select()
            }
        } else if (this.moveStage === MoveStage.MOVING) {
            this.moveStage = MoveStage.IDLE
            if (!square.piece || square.piece.color !== this.toMove) {
                this.attemptMove(this.selectedSquare!, square)
            }
            this.clearSelection()
        } else if (this.moveStage === MoveStage.PROMOTING) {
            throw new Error("Select a promotion piece before proceeding.")
        }
    }

    processConditionsAfterMove() {
        this.condition = evaluateGameCondition(this);
        if (inCheck(this, oppositeOf(this.toMove))) { // Undo if this move leaves the player in check. This is done after toMove is switched, hence the opposite.
            this.undo();
        } else {
            if (this.condition == GameCondition.PENDING_PROMOTION) {
                this.moveStage = MoveStage.PROMOTING;
            }
        }
        this.moveHistory[this.moveHistory.length - 1].notation = notateLastMove(this);
    }

    amendPromotionMove(pieceType: PieceType) {
        super.amendPromotionMove(pieceType);
        this.moveStage = MoveStage.IDLE
    }

    clearSelection() {
        this.board.forEach(row => {
            row.forEach(square => {
                square.deselect()
            })
        })
        this.selectedSquare = null
    }
}
