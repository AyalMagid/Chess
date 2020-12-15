'use strict'

// Pieces Types
const KING_WHITE = '♔';
const QUEEN_WHITE = '♕';
const ROOK_WHITE = '♖';
const BISHOP_WHITE = '♗';
const KNIGHT_WHITE = '♘';
const PAWN_WHITE = '♙';
const KING_BLACK = '♚';
const QUEEN_BLACK = '♛';
const ROOK_BLACK = '♜';
const BISHOP_BLACK = '♝';
const KNIGHT_BLACK = '♞';
const PAWN_BLACK = '♟';
const COLOR_BLACK = 'BLACK'
const COLOR_WHITE = 'WHITE'
const EMPTY = ''

// The Chess Board
var gBoard;
var gSelectedElCell = null;
var gKillSound = new Audio('killsound.mp3')
var gGameIsOn = true

function init() {
    gBoard = buildBoard();
    renderBoard(gBoard);

}

function buildBoard() {
    // build the board 8 * 8
    var board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            var piece = EMPTY
            if (i === 1) piece = PAWN_BLACK;
            if (i === 6) piece = PAWN_WHITE;
            board[i][j] = piece;
        }
    }

    board[0][0] = board[0][7] = ROOK_BLACK;
    board[0][1] = board[0][6] = KNIGHT_BLACK;
    board[0][2] = board[0][5] = BISHOP_BLACK;
    board[0][3] = QUEEN_BLACK;
    board[0][4] = KING_BLACK;

    board[7][0] = board[7][7] = ROOK_WHITE;
    board[7][1] = board[7][6] = KNIGHT_WHITE;
    board[7][2] = board[7][5] = BISHOP_WHITE;
    board[7][3] = QUEEN_WHITE;
    board[7][4] = KING_WHITE;

    // console.table(board);
    return board;

}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // figure class name
            var className = ((i + j) % 2 === 0) ? 'white' : 'black';
            var tdId = `cell-${i}-${j}`;

            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}


function cellClicked(elCell) {
    if (!gGameIsOn) return
    // if the target is marked - move the piece!
    if (elCell.classList.contains('mark')) {
        movePiece(gSelectedElCell, elCell);
        cleanBoard();
        return;
    }
    if (elCell.classList.contains('threatened')) {
        gKillSound.play()
        if (elCell.innerText == KING_BLACK || elCell.innerText == KING_WHITE) {
            gGameIsOn = false
            setTimeout(gameOver(elCell), 500);
        }
        movePiece(gSelectedElCell, elCell);
        cleanBoard();
        return
    }

    cleanBoard();

    elCell.classList.add('selected');
    gSelectedElCell = elCell;

    var cellCoord = getCellCoord(elCell.id);
    var piece = gBoard[cellCoord.i][cellCoord.j];

    var possibleCoords = [];
    var opponentColor = getPieceColor(cellCoord) === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE

    switch (piece) {
        case ROOK_BLACK:
        case ROOK_WHITE:
            possibleCoords = getAllPossibleCoordsRook(cellCoord, opponentColor);
            break;
        case BISHOP_BLACK:
        case BISHOP_WHITE:
            possibleCoords = getAllPossibleCoordsBishop(cellCoord, opponentColor);
            break;
        case KNIGHT_BLACK:
        case KNIGHT_WHITE:
            possibleCoords = getAllPossibleCoordsKnight(cellCoord, opponentColor);
            break;
        case PAWN_BLACK:
        case PAWN_WHITE:
            possibleCoords = getAllPossibleCoordsPawn(cellCoord, opponentColor);
            break;
        case QUEEN_BLACK:
        case QUEEN_WHITE:
            possibleCoords = getAllPossibleCoordsQueen(cellCoord, opponentColor);
            break;
        case KING_BLACK:
        case KING_WHITE:
            possibleCoords = getAllPossibleCoordsKing(cellCoord, opponentColor)
            break;
    }
    markCells(possibleCoords);
}

function movePiece(elFromCell, elToCell) {

    var fromCoord = getCellCoord(elFromCell.id);
    var toCoord = getCellCoord(elToCell.id);

    // update the MODEl
    var piece = gBoard[fromCoord.i][fromCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = '';
    gBoard[toCoord.i][toCoord.j] = piece;
    // update the DOM
    elFromCell.innerText = '';
    elToCell.innerText = piece;

}

function markCells(coords) {
    // debugger
    for (var i = 0; i < coords.length; i++) {
        for (var j = 0; j < coords[i].length; j++) {
            var classToAdd = i === 0 ? 'mark' : 'threatened'
            var selector = getSelector(coords[i][j])
            var elCell = document.querySelector(selector);
            elCell.classList.add(classToAdd)
        }
    }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .selected, .threatened');
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'selected', 'threatened');
    }
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}

function isEmptyCell(coord) {
    return gBoard[coord.i][coord.j] === EMPTY
}


function getAllPossibleCoordsPawn(pieceCoord, opponentColor) {
    var res = [[], []];
    var diff = opponentColor == COLOR_WHITE ? 1 : -1;
    var canEatCoord = { i: pieceCoord.i + diff, j: pieceCoord.j + diff } //1 diagonal
    if (canEatCoord.i < 8 && canEatCoord.i >= 0 && canEatCoord.j < 8 && canEatCoord.j >= 0) { // 
        if (!isEmptyCell(canEatCoord)) res[1].push(canEatCoord);
    }
    canEatCoord = { i: pieceCoord.i + diff, j: pieceCoord.j - diff } //another  diagonal
    if (canEatCoord.i < 8 && canEatCoord.i >= 0 && canEatCoord.j < 8 && canEatCoord.j >= 0) {
        if (!isEmptyCell(canEatCoord)) res[1].push(canEatCoord);
    }
    var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    if (isEmptyCell(nextCoord)) res[0].push(nextCoord);
    if ((pieceCoord.i === 1 && opponentColor == COLOR_WHITE) || (pieceCoord.i === 6 && opponentColor == COLOR_BLACK)) {
        diff *= 2;
        nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
        if (isEmptyCell(nextCoord)) res[0].push(nextCoord);
    }
    return res;
}

function getAllPossibleCoordsRook(pieceCoord, opponentColor) {
    var res = [[], []];
    var nextCoord = { i: pieceCoord.i, j: pieceCoord.j }
    for (var j = pieceCoord.j - 1; j >= 0; j--) {
        nextCoord = { i: pieceCoord.i, j: j }
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord)
    }
    for (j = pieceCoord.j + 1; j < 8; j++) {
        nextCoord = { i: pieceCoord.i, j: j }
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord)
    }
    for (var i = pieceCoord.i + 1; i < 8; i++) {
        nextCoord = { i: i, j: pieceCoord.j }
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord)
    }
    for (var i = pieceCoord.i - 1; i >= 0; i--) {
        nextCoord = { i: i, j: pieceCoord.j }
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord)
    }
    return res;
}

function getAllPossibleCoordsBishop(pieceCoord, opponentColor) {
    var res = [[], []];
    var i = pieceCoord.i - 1;
    // debugger
    for (var idx = pieceCoord.j + 1; i >= 0 && idx < 8; idx++, i--) {
        var nextCoord = { i: i, j: idx };
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord);
    }
    i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j - 1; i >= 0 && idx >= 0; idx--, i--) {
        var nextCoord = { i: i, j: idx };
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord);
    }
    i = pieceCoord.i + 1
    for (var idx = pieceCoord.j + 1; i < 8 && idx < 8; idx++, i++) {
        var nextCoord = { i: i, j: idx };
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord);
    }
    i = pieceCoord.i + 1
    for (var idx = pieceCoord.j - 1; i < 8 && idx >= 0; idx--, i++) {
        var nextCoord = { i: i, j: idx };
        if (!isEmptyCell(nextCoord)) {
            if (getPieceColor(nextCoord) === opponentColor) {
                res[1].push(nextCoord);
            } break;
        }
        res[0].push(nextCoord);
    }
    return res;
}

function getAllPossibleCoordsKnight(pieceCoord, opponentColor) {
    var res = [[], []];
    var rowIdx = pieceCoord.i
    var colIdx = pieceCoord.j
    for (var i = rowIdx - 2; i <= rowIdx + 2; i++) {
        if (i < 0 || i > 7) continue;
        for (var j = colIdx - 2; j <= colIdx + 2; j++) {
            if (j < 0 || j > 7) continue;
            if (i == rowIdx && j == colIdx) continue;
            // debugger
            if (Math.abs(rowIdx - i) == 2 && Math.abs(colIdx - j) == 1 ||
                Math.abs(rowIdx - i) == 1 && Math.abs(colIdx - j) == 2) {
                var nextCoord = { i: i, j: j }
            } else continue;
            if (!isEmptyCell(nextCoord)) {
                if (getPieceColor(nextCoord) === opponentColor) {
                    res[1].push(nextCoord);
                }
            } else res[0].push(nextCoord);
        }
    }
    return res;
}

function getAllPossibleCoordsQueen(pieceCoord, opponentColor) {
    var queenMoves = [[], []]
    var rookMoves = getAllPossibleCoordsRook(pieceCoord, opponentColor)
    var bishopMoves = getAllPossibleCoordsBishop(pieceCoord, opponentColor)
    queenMoves[0].push(...rookMoves[0])
    queenMoves[0].push(...bishopMoves[0])
    queenMoves[1].push(...rookMoves[1])
    queenMoves[1].push(...bishopMoves[1])
    return queenMoves;
}

function getAllPossibleCoordsKing(pieceCoord, opponentColor) {
    var res = [[], []];
    var rowIdx = pieceCoord.i
    var colIdx = pieceCoord.j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > 7) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > 7) continue;
            if (i == rowIdx && j == colIdx) continue;
            var nextCoord = { i: i, j: j }
            if (!isEmptyCell(nextCoord)) {
                if (getPieceColor(nextCoord) === opponentColor) {
                    res[1].push(nextCoord);
                }
            } else res[0].push(nextCoord);
        }
    }

    return res;

}

function getPieceColor(coord) {
    var piece = gBoard[coord.i][coord.j]
    if (piece === EMPTY) return EMPTY
    var whitePieces = [KING_WHITE, QUEEN_WHITE, ROOK_WHITE, BISHOP_WHITE, KNIGHT_WHITE, PAWN_WHITE]
    if (whitePieces.indexOf(piece) === -1) return COLOR_BLACK
    return COLOR_WHITE

}

function gameOver(elKing) {
    var elGameOverH2 = document.querySelector('h1')
    elKing.style.backgroundColor='yellow'
    elGameOverH2.style.display = 'block'
}