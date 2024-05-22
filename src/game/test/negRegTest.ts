import { ValidatedGameState } from "../GameState";
import { initializeFEN } from "../notation/compileAndNotateFiles";
import { STANDARD_FEN } from "../notation/standardFEN";
import { ManualGameState } from "../ui/ManualGameState";
import { MANUAL_GAME_MOVES } from "./testGames";

const showDebug = true;
export const negRegTest = () => {
    showDebug && console.log("Performing negative regression tests on previous manual movements from game");
    const manualGameState = new ManualGameState(initializeFEN(new ValidatedGameState(), STANDARD_FEN));
    MANUAL_GAME_MOVES.forEach((move: any, i: number) => {
        // console.log(`Move ${i + 1}: ${move[0]} ${move[1]} ${move[2]}`);
        const [from, to, moveType] = move;
        if (moveType == -2) { // Amended castle movement
            const prevLength = manualGameState.moveHistory.length;
            manualGameState.attemptMove(manualGameState.square(from[0], from[1]), manualGameState.square(to[0], to[1]), moveType);
            const newLength = manualGameState.moveHistory.length;
            if (prevLength > newLength) {
                showDebug && console.error("Failed to amend condition that would lead to an illegal check");
            }
        } else {
            manualGameState.attemptMove(manualGameState.square(from[0], from[1]), manualGameState.square(to[0], to[1]), moveType);
        }
    })
    const actualLegalMoves = MANUAL_GAME_MOVES.filter((move: any, i: number) => {
        const [from, to, moveType] = move;
        return moveType >= 0;
    })!.length;
    if (actualLegalMoves != manualGameState.moveHistory.length) {
        showDebug && console.error(`Mismatch between total legal moves in test case and gameState. 
            Expected: ${actualLegalMoves}, 
            Actual: ${manualGameState.moveHistory.length}`);
    }
    showDebug && console.log(`Negative regression test passed`);
}
