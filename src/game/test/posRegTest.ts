import { compileRawMoves } from "../notation/compileAndNotateMoves"
import { EN_PASSANT_TEST, ITALIAN_OPENING, KASPAROV_V_ANAND, KASPAROV_V_TOPALOV, MORPHY_V_KARL, PROMOTION_TEST } from "./testGames"
import { extractRawMoves } from "../notation/notationUtils";
import { notateGame } from "../notation/compileAndNotateFiles";

const showDebug = true;

export const posRegTest = () => {
    const positiveAutoTestSet = [
        ITALIAN_OPENING,
        EN_PASSANT_TEST,
        PROMOTION_TEST,
        KASPAROV_V_TOPALOV,
        MORPHY_V_KARL,
        KASPAROV_V_ANAND,
    ]

    console.log("Performing positive regression tests on previous game notations");
    positiveAutoTestSet.forEach((game, index) => {
        const rawMoves = extractRawMoves(game);
        try {
            const gameState = compileRawMoves(rawMoves);
        } catch (error) {
            showDebug && console.error(`Game ${index+1} in the regTest function failed to compile: ${error}`);
        }
        const gameState = compileRawMoves(rawMoves);
        if (gameState.moveHistory.length != rawMoves.length) {
            showDebug && console.error(`Game ${index+1} in the regTest function has ${rawMoves.length / 2} moves in raw format, but ${gameState.moveHistory.length / 2} moves in the game state format`);
            showDebug && console.error(`Notation: ${notateGame(gameState)}`);
            showDebug && console.error(`Regression test ${index+1} failed`);
            return;
        }
        const notatedGame: string[] = extractRawMoves(notateGame(gameState)); // Doesn't necessarily have to look like the original game
        const recoveredGameState = compileRawMoves(notatedGame);
        const moves = gameState.moveHistory.length;
        if (recoveredGameState.moveHistory.length != rawMoves.length) {
            console.log(recoveredGameState.moveHistory.length, rawMoves.length);
            showDebug && console.error(`Game ${index+1} notation doesn't recover the original game: `);
            // showDebug && debugDiffs(game, notateGame(gameState));
            showDebug && console.error(`Original Game: ${game}`);
            showDebug && console.error(`Notation Generated: ${notateGame(gameState)}`);
            showDebug && console.error(`Notation-Recovered Game: ${notateGame(recoveredGameState)}`);
            showDebug && console.error(`Regression test ${index+1} failed`);
            return;
        }

        for (let i = 0; i < moves; i++) {
            gameState.undo();
        }
        if (gameState.moveHistory.length != 0) {
            showDebug && console.error(`Game ${index+1} in the regTest function failed to fully undo at: `);
            showDebug && console.error(`Notation: ${notateGame(gameState)}`);
            showDebug && console.error(`Regression test ${index+1} failed`);
            return;
        }
        showDebug && console.log(`Positive regression test ${index+1} passed`);
    })
}
