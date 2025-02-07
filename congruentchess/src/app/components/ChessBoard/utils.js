export function decodeFenToBoard(fen) {
    let board = [];
    let rows = fen.split("/");
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < rows[i].length; j++) {
            let char = rows[i][j];
            if (isNaN(char)) {
                row.push(char);
            } else {
                for (let k = 0; k < parseInt(char); k++) {
                    row.push(null);
                }
            }
        }
        board.push(row);
    }
    return board;
}

export function encodeBoardToFen(board) {
    let fen = "";
    for (let i = 0; i < board.length; i++) {
        let row = board[i];
        let empty = 0;
        for (let j = 0; j < row.length; j++) {
            if (row[j] === null) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += row[j];
            }
        }
        if (empty > 0) {
            fen += empty;
        }
        if (i < board.length - 1) {
            fen += "/";
        }
    }
    return fen;
}

// stop player from crossing over their own pieces, these should be disallowed
// since the user would never want to do this

export function getLegalMoves(pieceType, color, position) {
    console.log(pieceType, color, position);
    switch (pieceType) {
        case "pawn":
            return getLegalPawnMoves(color, position);
        case "rook":
            return getLegalRookMoves(position);
        case "knight":
            return getLegalKnightMoves(position);
        case "bishop":
            return getLegalBishopMoves(position);
        case "queen":
            return getLegalQueenMoves(position);
        case "king":
            return getLegalKingMoves(position);
        default:
            throw new Error("Invalid piece type");
    }
}

function getLegalPawnMoves(color, position) {
    const [x, y] = position;
    const direction = color === "white" ? -1 : 1;

    let legalMoves = [];

    legalMoves.push([x, y + direction]);

    if (y === 1 && color === "black" || y === 6 && color === "white") {
        legalMoves.push([x, y + 2 * direction]);
    }

    // usually we would check if the square is occupied by an enemy piece, 
    // but we don't care about that here
    // We want to check however if the square is acutally on the board.

    if (x > 0) {
        legalMoves.push([x - 1, y + direction]);
    }
    if (x < 7) {
        legalMoves.push([x + 1, y + direction]);
    }

    return legalMoves;
}

function getLegalRookMoves(position) {
    const [x, y] = position;
    let legalMoves = [];

    for (let i = 0; i < 8; i++) {
        if (i !== x) {
            legalMoves.push([i, y]);
        }
        if (i !== y) {
            legalMoves.push([x, i]);
        }
    }

    return legalMoves;
}

function getLegalKnightMoves(position) {
    const [x, y] = position;
    let legalMoves = [];

    const possibleMoves = [
        [x + 1, y + 2],
        [x + 2, y + 1],
        [x + 2, y - 1],
        [x + 1, y - 2],
        [x - 1, y - 2],
        [x - 2, y - 1],
        [x - 2, y + 1],
        [x - 1, y + 2],
    ];

    for (let i = 0; i < possibleMoves.length; i++) {
        const [x, y] = possibleMoves[i];
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            legalMoves.push([x, y]);
        }
    }

    return legalMoves;
}

function getLegalBishopMoves(position) {
    const [x, y] = position;
    let legalMoves = [];

    for (let i = 1; i < 8; i++) {
        if (x + i < 8 && y + i < 8) {
            legalMoves.push([x + i, y + i]);
        }
        if (x + i < 8 && y - i >= 0) {
            legalMoves.push([x + i, y - i]);
        }
        if (x - i >= 0 && y + i < 8) {
            legalMoves.push([x - i, y + i]);
        }
        if (x - i >= 0 && y - i >= 0) {
            legalMoves.push([x - i, y - i]);
        }
    }

    return legalMoves;
}

function getLegalQueenMoves(position) {
    return [
        ...getLegalRookMoves(position),
        ...getLegalBishopMoves(position),
    ];
}

function getLegalKingMoves(position) {
    const [x, y] = position;
    let legalMoves = [];

    const possibleMoves = [
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
        [x - 1, y + 1],
        [x - 1, y],
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
    ];

    for (let i = 0; i < possibleMoves.length; i++) {
        const [x, y] = possibleMoves[i];
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            legalMoves.push([x, y]);
        }
    }

    return legalMoves;
}