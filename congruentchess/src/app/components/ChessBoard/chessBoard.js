"use client";
import React, { useState, useEffect } from 'react';
import './chessBoard.css';
import { DEFAULT_BOARD_FEN, PIECE_FOR_LETTER, SERVER_URL } from './config';
import { getLegalMoves, decodeFenToBoard, getGameIDFromAnchor } from './utils';

const Piece = ({ pieceType, color }) => {
    return (
        <div className="piece">
            <img src={`/pieces/${color}/${pieceType}.png`} alt={`${color}`} />
        </div>
    );
};

const Square = ({ black, piece, isHighlighted, onClick, previouslySelected }) => {

    return (
        <div
            className={[
                black ? "black-square" : "white-square", 
                isHighlighted ? "highlighted-square" : "",
                previouslySelected && "previously-selected",
            ].join(" ")}
            onClick={onClick}
        >
            {piece}
        </div>
    );
};

function selectPiece(piece, color, position, gameState, setHighlightedSquares, setselectedFromPosition) {
    const legalMoves = getLegalMoves(piece, color, position, gameState);
    setHighlightedSquares(legalMoves);
    setselectedFromPosition(position)
}

export default function ChessBoard({ userID, isJoiningGame, setIsJoiningGame }) {

    const [gameState, setGameState] = useState(DEFAULT_BOARD_FEN);
    const [highlightedSquares, setHighlightedSquares] = useState([]);
    const [selectedFromPosition, setselectedFromPosition] = useState(null);
    const [selectedToPosition, setselectedToPosition] = useState(null);
    const [previousSelections, setPreviousSelections] = useState([]);
    const [previousToPosition, setPreviousToPosition] = useState(null);

    const [assignedColor, setAssignedColor] = useState(null);

    const [handlingClick, setHandlingClick] = useState(false);
    const board = decodeFenToBoard(gameState);
    const GAME_ID = getGameIDFromAnchor();

    // websockets stuffs
    const [messages, setMessages] = useState([]);
    const [ws, setWS] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const [gameOutcome, setGameOutcome] = useState(false);
    
    if (ws) {
        ws.onopen = (event) => {
            console.log("Opened connection");
        };
    
        ws.onmessage = function (event) {
            setMessages([...messages, event.data]);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected. Attempting to reconnect");
            setTimeout(() => {
                let newWs = new WebSocket(`ws://${SERVER_URL}:8000/ws/${GAME_ID}`);
                setWS(newWs);
            }, 2000);
        };
    }

    const sendMessage = (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    };

    if (initialized === false) { // waits 100ms to load ws so it doesn't break.
        setInitialized(true);
        setTimeout(() => {
            const ws = new WebSocket(`ws://${SERVER_URL}:8000/ws/${GAME_ID}`);
            setWS(ws);
        }, 100);
    }

    if (ws && isJoiningGame) {
        setTimeout(() => {
            sendMessage(JSON.stringify({
                user_id: userID,
                game_id: GAME_ID,
                request_type: "join"
            }));
            setIsJoiningGame(false);
        }, 100);
    }

    useEffect(() => {
        if (!initialized) {return}

        const latestMessage = messages[messages.length - 1];
        if (!latestMessage) {return}
        console.log(latestMessage);

        let game = JSON.parse(latestMessage);

        if (game.board_state) {
            console.log("Game: ", game)
            setGameState(game.board_state);
            setPreviousSelections(game.previous_selections);
            setHighlightedSquares([]);
            setselectedFromPosition(null);
            setselectedToPosition(null);

            if (game.game_state != "INCOMPLETE") {
                setGameOutcome(game.game_state);
            }

        } else if (game.assigned_colors) {
            setAssignedColor(game.assigned_colors[userID]);
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
                    pieceSelected={selectedFromPosition ? true : false}
                />
            );
        }

        const handleSquareClick = (piece) => {
            if (handlingClick || selectedToPosition || gameOutcome) {
                return;
            }

            setHandlingClick(true);

            if (piece && piece.props.color === assignedColor) {
                if (previousToPosition) {
                    if (previousToPosition[0] == x && previousToPosition[1] == y) {
                        if (pieceType.toLowerCase() != "p") {
                            setHandlingClick(false);
                            return
                        }
                    }
                }
                selectPiece(
                    piece.props.pieceType, 
                    piece.props.color, 
                    piece.props.position,
                    board,
                    setHighlightedSquares, 
                    setselectedFromPosition
                ) // could probably just pass in the piece object
            } else {
                attemptPieceMove();
            }

            setHandlingClick(false);
        }

        const attemptPieceMove = () => {
            
            if (!selectedFromPosition) {
                return;
            }

            if (!isHighlighted) {
                setHighlightedSquares([]);
                setselectedFromPosition(null);
                return;
            }

            if (selectedFromPosition && isHighlighted) {
                setselectedToPosition([x, y]);
                setHighlightedSquares([[x,y], selectedFromPosition]);
                setPreviousToPosition([x, y]);

                sendMessage(JSON.stringify({
                    from: selectedFromPosition,
                    to: [x, y],
                    user_id: userID,
                    game_id: GAME_ID,
                    request_type: "move",
                    color: assignedColor
                }));
            }
        }

        return (
            <Square
                black={isBlack}
                piece={piece}
                isHighlighted={isHighlighted}
                previouslySelected={previousSelections.some(([px, py]) => px === x && py === y)}
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
            {
                gameOutcome &&
                <h1>Game over: {gameOutcome}</h1>
            }
            {
                !gameOutcome && assignedColor && 
                <h1>You are playing as {assignedColor}</h1>
            }
        </div>
    );
}