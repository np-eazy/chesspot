import { compileRawMoves } from "../notation/compileAndNotateMoves"
import { EN_PASSANT_TEST, ITALIAN_OPENING, KASPAROV_V_ANAND, KASPAROV_V_TOPALOV, MORPHY_V_KARL, PROMOTION_TEST } from "./testGames"
import { extractRawMoves } from "../notation/notationUtils";
import { notateGame } from "../notation/compileAndNotateFiles";

export const posRegTest = (showDebug: boolean = true) => {
    const positiveAutoTestSet = [
        ITALIAN_OPENING,
        EN_PASSANT_TEST,
        PROMOTION_TEST,
        KASPAROV_V_TOPALOV,
        MORPHY_V_KARL,
        KASPAROV_V_ANAND,
    ]

    console.log("Performingå positive regression tests on previous game notations");
    positiveAutoTestSet.forEach((game, index) => {
        const rawMoves = extractRawMoves(game);
        const board = compileRawMoves(rawMoves);
        if (board.moveHistory.length != rawMoves.length) {
            showDebug && console.error(`Game ${index + 1} in the regTest function has ${rawMoves.length / 2} moves in raw format, but ${board.moveHistory.length / 2} moves in the game state format`);
            showDebug && console.error(`Notation: ${notateGame(board)}`);
            showDebug && console.error(`Regression test ${index + 1} failed`);
            return;
        }
        const notatedGame: string[] = extractRawMoves(notateGame(board)); // Doesn't necessarily have to look like the original game
        const recoveredBoard = compileRawMoves(notatedGame);
        const moves = board.moveHistory.length;
        if (recoveredBoard.moveHistory.length != rawMoves.length) {
            console.log(recoveredBoard.moveHistory.length, rawMoves.length);
            showDebug && console.error(`Game ${index + 1} notation doesn't recover the original game: `);
            showDebug && console.error(`Original Game: ${game}`);
            showDebug && console.error(`Notation Generated: ${notateGame(board)}`);
            showDebug && console.error(`Notation-Recovered Game: ${notateGame(recoveredBoard)}`);
            showDebug && console.error(`Regression test ${index + 1} failed`);
            return;
        }

        for (let i = 0; i < moves; i++) {
            board.undo();
        }
        if (board.moveHistory.length != 0) {
            showDebug && console.error(`Game ${index + 1} in the regTest function failed to fully undo at: `);
            showDebug && console.error(`Notation: ${notateGame(board)}`);
            showDebug && console.error(`Regression test ${index + 1} failed`);
            return;
        }
        showDebug && console.log(`Positive regression test ${index + 1} passed`);
    })
}
