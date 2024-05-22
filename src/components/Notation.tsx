import { Board } from "../game/Board"

export const Notation = (props: {
    board: Board
}) => {
    const moveHistory = props.board.moveHistory;
    const pairedMoves: [string, string][] = [];
    for (let i = 0; i <= moveHistory.length / 2; i++) {
        pairedMoves.push([
            moveHistory[i * 2]?.notation ?? "",
            moveHistory[i * 2 + 1]?.notation ?? ""
        ]);
    }
    return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'left',
    width:200}}>
        <ul>{pairedMoves.map((move: [string, string], i) => {
        return <li key={i}>{`${i + 1}. ${move[0]} ${move[1]}\n`}</li>
    })}</ul>
    </div>  
    
    
}

