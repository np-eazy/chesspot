import { useState } from 'react';
import { PieceType } from '../game/Piece';
import { GameState } from '../game/GameState';

export default function PromotionPanel(props: { 
    gameState: GameState 
    callback: () => void
}) {
    const [selectedPiece, setSelectedPiece] = useState<PieceType>(PieceType.QUEEN);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPieceType = event.target.value as PieceType;
        props.gameState.amendPromotionMove(newPieceType);
        props.callback();
    };
    return (
        <div>
            <label htmlFor="pieceType">Choose a piece for promotion:</label>
            <select id="pieceType" value={selectedPiece} onChange={handleSelectChange}>
                {Object.values(PieceType).filter(type => type !== PieceType.PAWN && type !== PieceType.KING).map((type) => (
                    <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                ))}
            </select>
        </div>
    );
}
