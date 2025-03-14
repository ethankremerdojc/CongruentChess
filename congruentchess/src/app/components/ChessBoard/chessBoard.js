"use client";
import React, { useState, useEffect } from 'react';
import './chessBoard.css';
import { DEFAULT_BOARD_FEN, PIECE_FOR_LETTER, SERVER_URL } from './config';
import { getLegalMoves, decodeFenToBoard, getGameIDFromAnchor, encodeBoardToFen } from './utils';

const Piece = ({ pieceType, color }) => {
    return (
        <div className="piece">
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

function selectPiece(piece, color, position, setHighlightedSquares, setSelectedPosition) {
    const legalMoves = getLegalMoves(piece, color, position);
    setHighlightedSquares(legalMoves);
    setSelectedPosition(position)
}

export default function ChessBoard({ userID }) {

    const [gameState, setGameState] = useState(DEFAULT_BOARD_FEN);
    const [highlightedSquares, setHighlightedSquares] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [playerTurn, setPlayerTurn] = useState("white");
    const [handlingClick, setHandlingClick] = useState(false);
    const board = decodeFenToBoard(gameState);
    const GAME_ID = getGameIDFromAnchor();

    // websockets stuffs
    const [messages, setMessages] = useState([]);
    const [ws, setWS] = useState(null);
    const [initialized, setInitialized] = useState(false);
    
    if (ws) {
        ws.onopen = (event) => {
            console.log("Opened connection");
        };
    
        ws.onmessage = function (event) {
            setMessages([...messages, event.data]);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected...");
            // setTimeout(() => ws = new WebSocket(`ws://${SERVER_URL}/ws/${GAME_ID}`), 2000);
        };
    }

    const sendMessage = (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    };

    if (initialized === false) {
        setInitialized(true);
        setTimeout(() => {
            const ws = new WebSocket(`ws://${SERVER_URL}:8000/ws/${GAME_ID}`);
            setWS(ws);
        }, 100);
    }

    useEffect(() => {

        if (!initialized) {return}

        const latestMessage = messages[messages.length - 1];
        if (!latestMessage) {return}
        console.log(latestMessage);

        let game = JSON.parse(latestMessage);

        if (game.board_state) {
            setGameState(game.board_state);
            setPlayerTurn(game.turn);
            setHighlightedSquares([]);
            setSelectedPosition(null);
        }
    },[messages])

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
                    pieceSelected={selectedPosition ? true : false}
                />
            );
        }

        const handleSquareClick = (piece) => {
            if (handlingClick) {
                return;
            }

            setHandlingClick(true);

            if (piece && piece.props.color === playerTurn) {
                selectPiece(
                    piece.props.pieceType, 
                    piece.props.color, 
                    piece.props.position, 
                    setHighlightedSquares, 
                    setSelectedPosition
                ) // could probably just pass in the piece object
            } else {
                attemptPieceMove();
            }

            setHandlingClick(false);
        }

        const attemptPieceMove = () => {
            
            if (!selectedPosition) {
                return;
            }

            console.log(selectedPosition, isHighlighted);

            if (!isHighlighted) {
                setHighlightedSquares([]);
                setSelectedPosition(null);
                return;
            }

            if (selectedPosition && isHighlighted) {
                console.log("Sending move")
                sendMessage(JSON.stringify({
                    from: selectedPosition,
                    to: [x, y],
                    user_id: userID,
                    game_id: GAME_ID,
                    request_type: "move"
                }));
            }
        }

        return (
            <Square
                black={isBlack}
                piece={piece}
                isHighlighted={isHighlighted}
                board={board}
                key={i}
                onClick={() => { handleSquareClick(piece) }}
                onTouchEnd={() => { handleSquareClick(piece) }}
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