import { GameState } from "../game/GameState"

export const Notation = (props: {
    gameState: GameState
}) => {
    const moveHistory = props.gameState.moveHistory;
    const pairedMoves: [string, string][] = [];
    for (let i = 0; i <= moveHistory.length / 2; i++) {
        pairedMoves.push([
            moveHistory[i * 2]?.notation ?? "",
            moveHistory[i * 2 + 1]?.notation ?? ""
        ]);
    }
    return <ul>{pairedMoves.map((move: [string, string], i) => {
        return <li key={i}>{`${i + 1}. ${move[0]} ${move[1]}\n`}</li>
    })}</ul>
}

