import { Board } from "../Board";
import { initializeFEN } from "../notation/compileAndNotateFiles";
import { STANDARD_FEN } from "../notation/standardFEN";
import { ManualBoard } from "../ui/ManualBoard";
import { MANUAL_GAME_MOVES } from "./testGames";

export const negRegTest = (showDebug: boolean = true) => {
    showDebug && console.log("Performing negative regression tests on previous manual movements from game");
    const board = new ManualBoard(initializeFEN(new Board(), STANDARD_FEN));
    MANUAL_GAME_MOVES.forEach((move: any, i: number) => {
        const [from, to, moveType] = move;
        if (moveType == -2) { // Amended castle movement
            const prevLength = board.moveHistory.length;
            board.attemptMove(board.square(from[0], from[1]), board.square(to[0], to[1]), moveType);
            const newLength = board.moveHistory.length;
            if (prevLength > newLength) {
                showDebug && console.error("Failed to amend condition that would lead to an illegal check");
            }
        } else {
            board.attemptMove(board.square(from[0], from[1]), board.square(to[0], to[1]), moveType);
        }
    })
    const actualLegalMoves = MANUAL_GAME_MOVES.filter((move: any, i: number) => {
        const [from, to, moveType] = move;
        return moveType >= 0;
    })!.length;
    if (actualLegalMoves != board.moveHistory.length) {
        showDebug && console.error(`Mismatch between total legal moves in test case and board. 
            Expected: ${actualLegalMoves}, 
            Actual: ${board.moveHistory.length}`);
    }
    showDebug && console.log(`Negative regression test passed`);
}
