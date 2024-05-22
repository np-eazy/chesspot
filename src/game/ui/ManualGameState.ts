import { GameCondition, ValidatedGameState, MoveStage } from "../GameState";
import { PieceType } from "../Piece";
import { Square } from "../Square";
import { notateLastMove } from "../notation/compileAndNotateMoves";
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

    debugDump(): string {
        return JSON.stringify({
            // selectedSquare: {
            //     file: this.selectedSquare?.file,
            //     rank: this.selectedSquare?.rank,
            //     piece: {
            //         type: this.selectedSquare?.piece?.type,
            //         color: this.selectedSquare?.piece?.color,
            //         isCaptured: this.selectedSquare?.piece?.isCaptured
            //     }
            // },
            // toMove: this.toMove,
            // moveStage: this.moveStage,
            // condition: this.condition ?? "NORMAL",
            messages: this.msgLog
        }, null, 4);
    }

    handleError(e: Error) {
        super.handleError(e);
        this.clearSelection();
    }

    selectAndAdvance(square: Square) {
        if (this.moveStage === MoveStage.IDLE) {
            if (square.piece && square.piece.color === this.toMove) {
                this.moveStage = MoveStage.MOVING
                // this.msgLog.push("Selected " + square.toString())
                this.selectedSquare = square
                square.select()
            }
        } else if (this.moveStage === MoveStage.MOVING) {
            this.moveStage = MoveStage.IDLE
            if (!square.piece || square.piece.color !== this.toMove) {
                // this.msgLog.push("Attempting to move " + square.toString())

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
