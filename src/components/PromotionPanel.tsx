import { useState } from 'react';
import { PieceType } from '../game/Piece';
import { Board } from '../game/Board';
import { ManualBoard } from '../game/ui/ManualBoard';

export default function PromotionPanel(props: { 
    board: ManualBoard 
    callback: () => void
}) {
    const [selectedPiece, setSelectedPiece] = useState<PieceType>(PieceType.NULL);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPieceType = event.target.value as PieceType;
        props.board.amendPromotionMove(newPieceType);
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
