"use client";
import React, { useState, useEffect } from 'react';
import './chessBoard.css';
import { DEFAULT_BOARD_FEN, PIECE_FOR_LETTER, SERVER_URL } from './config';
import { getLegalMoves, decodeFenToBoard, encodeBoardToFen } from './utils';
import useWebSocket from "../../hooks/useWebsocket";

const Piece = ({ pieceType, color, onSelect }) => {
    return (
        <div className="piece" draggable onClick={() => onSelect()} >
            <img src={`/pieces/${color}/${pieceType}.png`} alt={`${color}`} />
        </div>
    );
};

const Square = ({ black, piece, isHighlighted, onClick }) => {
    return (
        <div
            className={[
                black ? "black-square" : "white-square", 
                isHighlighted ? "highlighted-square" : ""
            ].join(" ")}
            onClick={onClick}
        >
            {piece}
        </div>
    );
};

function movePiece(board, from, to) {
    const newBoard = board.map((row) => [...row]);
    const [fromX, fromY] = from;
    const [toX, toY] = to;

    newBoard[toY][toX] = newBoard[fromY][fromX];
    newBoard[fromY][fromX] = null;

    return newBoard
}

function selectPiece(piece, color, position, setHighlightedSquares, setSelectedPosition) {
    const legalMoves = getLegalMoves(piece, color, position);
    setHighlightedSquares(legalMoves);
    setSelectedPosition(position)
}

const countChars = (str, char) => {

    if (str === undefined) {
        return 0;
    }

    return str.split(char).length - 1;
}

export default function ChessBoard() {

    const [gameState, setGameState] = useState(DEFAULT_BOARD_FEN);
    const [highlightedSquares, setHighlightedSquares] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [playerTurn, setPlayerTurn] = useState("white");

    const board = decodeFenToBoard(gameState);

    // -- WebSocket --

    const { messages, sendMessage } = useWebSocket(`ws://${SERVER_URL}:8000/ws`);

    useEffect(() => {
        const FEN = messages[messages.length - 1];
        console.log(`Received message: ${FEN}`);

        if (countChars(FEN, "/") !== 7) {
            return;
        }

        setGameState(FEN);
        setPlayerTurn(playerTurn === "white" ? "black" : "white");
        setHighlightedSquares([]);
        setSelectedPosition(null);
    },[messages])

    // -- Render --

    const renderSquare = (i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const isBlack = (x + y) % 2 === 1;

        let piece, pieceColor;
        let isHighlighted = false;

        const pieceType = board[y][x];
        if (highlightedSquares.some(([hx, hy]) => hx === x && hy === y)) {
            isHighlighted = true;
        }

        if (pieceType) {
            if (pieceType === pieceType.toUpperCase()) {
                pieceColor = "white";
            } else {
                pieceColor = "black";
            }

            let pieceRank = PIECE_FOR_LETTER[pieceType.toLowerCase()];
            let position = [x, y];

            piece = (
                <Piece
                    pieceType={pieceRank}
                    color={pieceColor}
                    position={position}
                    onSelect={() => {
                        if (pieceColor === playerTurn) {
                            selectPiece(pieceRank, pieceColor, position, setHighlightedSquares, setSelectedPosition)
                        }
                    }}
                />
            );
        }

        const attemptPieceMove = () => {

            if (!selectedPosition) {
                return;
            }

            if (!isHighlighted) {
                setHighlightedSquares([]);
                setSelectedPosition(null);
                return;
            }

            if (selectedPosition && isHighlighted) {
                sendMessage(`${gameState}|${selectedPosition}|${[x, y]}`);
            }
        }

        return (
            <Square
                black={isBlack}
                piece={piece}
                isHighlighted={isHighlighted}
                board={board}
                key={i}
                onClick={() => { attemptPieceMove() }}
            />
        );
    };

    return (
        <div>
            <div className="chessboard">
                {Array.from({ length: 64 }, (_, i) => renderSquare(i))}
            </div>
            <h1>{playerTurn}'s turn</h1>
        </div>
    );
}