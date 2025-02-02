"use client";
import React, { useState } from 'react';
import './chessBoard.css';
import { DEFAULT_BOARD, PIECE_FOR_LETTER } from './config';

const Piece = ({ pieceType, color, position, onDragStart }) => {
    return (
        <div className="piece" draggable onDragStart={(e) => onDragStart(e, position)}>
            <img src={`/pieces/${color}/${pieceType}.png`} alt={`${color}`} />
        </div>
    );
};

const Square = ({ black, piece, position, onDrop, onDragOver }) => {
    return (
        <div
            className={black ? "black-square" : "white-square"}
            onDrop={(e) => onDrop(e, position)}
            onDragOver={onDragOver}
        >
            {piece}
        </div>
    );
};

export default function ChessBoard() {
    const [board, setBoard] = useState(DEFAULT_BOARD);

    const handleDragStart = (e, position) => {
        e.dataTransfer.setData('position', JSON.stringify(position));
    };

    const handleDrop = (e, targetPosition) => {
        const sourcePosition = JSON.parse(e.dataTransfer.getData('position'));
        const newBoard = [...board];
        newBoard[targetPosition.y][targetPosition.x] = newBoard[sourcePosition.y][sourcePosition.x];
        newBoard[sourcePosition.y][sourcePosition.x] = null;
        setBoard(newBoard);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const renderSquare = (i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const isBlack = (x + y) % 2 === 1;

        let piece, pieceColor;

        const pieceType = board[y][x];
        if (pieceType) {
            if (pieceType[0] === "w") {
                pieceColor = "white";
            }
            if (pieceType[0] === "b") {
                pieceColor = "black";
            }

            let pieceRank = PIECE_FOR_LETTER[pieceType[1]];

            piece = (
                <Piece
                    key={i}
                    pieceType={pieceRank}
                    color={pieceColor}
                    position={{ x, y }}
                    onDragStart={handleDragStart}
                />
            );
        }

        return (
            <Square
                key={i}
                black={isBlack}
                piece={piece}
                position={{ x, y }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            />
        );
    };

    return (
        <div className="chessboard">
            {Array.from({ length: 64 }, (_, i) => renderSquare(i))}
        </div>
    );
}