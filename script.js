function handleBoardClick(r, c) {
    if (gameState === GAME_STATES.pickWhite ||
        gameState === GAME_STATES.pickBlack) {
        let picked =
            gameState === GAME_STATES.pickBlack ?
            pickedBlack : pickedWhite;
        if (r === 0 && c === 0) {
            if (pickPage === 0)
                pickPage = numPages(choosablePieces, 18);
            pickPage--;
        } else if (r === 0 && c === 7) {
            pickPage++;
            if (pickPage >= numPages(choosablePieces, 18))
                pickPage = 0;
        } else if (r < 3 && c >= 1 && c <= 6) {
            let index = r * 6 + c - 1 + pickPage * 18;
            if (choosablePieces[index])
                pickSelected = choosablePieces[index];
        } else if (r >= 3 && r <= 4 && c >= 2 && c <= 5) {
            picked[r - 3][c - 2] = pickSelected;
            pickSelected = null;
        } else if (r === 3 && c === 0 &&
                   isValid(picked)) {
            pickSelected = null;
            pickPage = 0;
            if (gameState === GAME_STATES.pickWhite) {
                gameState = GAME_STATES.pickBlack;
            } else {
                let seedInput =
                    document.getElementById("seed");
                let seed = seedInput.value;
                if (seed === "")
                    seedInput.value = seed = Math.random()
                        .toString().slice(2);
                myRandom = new Math.seedrandom(seed);
                placePicks();
                placeHazards();
                gameState = GAME_STATES.play;
            }
        }
    } else if (gameState === GAME_STATES.play) {
        let piece = board[r][c];
        if (pieceToMove) {
            if (canMoveTo(pieceToMove, [r, c])) {
                movePiece(pieceToMove, [r, c]);
            }
            pieceToMove = null;
        } else {
            if (piece && piece.type &&
                piece.isBlack === isBlackTurn) {
                pieceToMove = [r, c];
            }
        }
    } else if (gameState === GAME_STATES.gameOver) {
        gameState = GAME_STATES.pickWhite;
        setupGame();
    }
}

function handleClick(x, y) {
    if (gameState === GAME_STATES.gameOver) {
        gameState = GAME_STATES.pickWhite;
        setupGame();
    }
}

function gameLoop() {
    if (gameState === GAME_STATES.pickWhite ||
        gameState === GAME_STATES.pickBlack) {
        let hovered = "Hover over something to see its description.";
        let [mouseR, mouseC] = xy2rc(...mousePos);
        let picked =
            gameState === GAME_STATES.pickBlack ?
            pickedBlack : pickedWhite;
        if (mouseR === 0 && mouseC === 0) {
            hovered = "Previous page";
        } else if (mouseR === 0 && mouseC === 7) {
            hovered = "Next page";
        } else if (mouseR < 3 &&
                   mouseC >= 1 && mouseC <= 6) {
            let index = pickPage * 18 +
                mouseR * 6 + mouseC - 1;
            let piece = choosablePieces[index];
            if (piece)
                hovered = getPieceDescription(piece);
        } else if (mouseR >= 3 && mouseR <= 4 &&
                   mouseC >= 2 && mouseC <= 5) {
            let piece = picked[mouseR - 3][mouseC - 2];
            if (piece)
                hovered = getPieceDescription(piece);
        } else if (mouseR === 3 && mouseC === 0 &&
                   isValid(picked)) {
            hovered = "Submit starting arrangement";
        }
        setDescription(hovered);
    } else if (gameState === GAME_STATES.play) {
        let hovered = "Hover over something to see its description.";
        let [mouseR, mouseC] = xy2rc(...mousePos);
        if (mouseR >= 0 && mouseR <= 7 &&
            mouseC >= 0 && mouseC <= 7) {
            let piece = board[mouseR][mouseC];
            if (piece && piece.tile) {
                hovered = tileDescriptions[piece.tile];
            } else if (piece) {
                hovered = getPieceDescription(piece.type);
            }
        }
        setDescription(hovered);
    } else if (gameState === GAME_STATES.gameOver) {
        setDescription("Game over! Click anywhere to play again.");
    }
    draw();
}

function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    if (gameState === GAME_STATES.pickWhite ||
        gameState === GAME_STATES.pickBlack) {
        let isBlack = gameState === GAME_STATES.pickBlack;
        let picked = isBlack ? pickedBlack : pickedWhite;
        drawPicked(picked, isBlack);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(...rc2xy(0.5,  0.25));
        ctx.lineTo(...rc2xy(0.25, 0.5));
        ctx.lineTo(...rc2xy(0.75, 0.5));
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(...rc2xy(0.5,  7.75));
        ctx.lineTo(...rc2xy(0.25, 7.5));
        ctx.lineTo(...rc2xy(0.75, 7.5));
        ctx.fill();
        let pageOfPieces =
            getPage(choosablePieces, pickPage, 18);
        ctx.fillStyle = PIECE_DISPLAY_COLOR;
        ctx.fillRect(...rc2xy(0, 1),
                     SQUARE_SIZE * 6, SQUARE_SIZE * 3);
        let color = isBlack ? "black" : "white";
        ctx.fillStyle = PIECE_DISPLAY_SELECT_COLOR;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
                let piece = pageOfPieces[r * 6 + c];
                if (piece === null) break;
                let [x, y] = rc2xy(r, c + 1);
                if (piece === pickSelected) {
                    ctx.fillRect(
                        x, y,
                        SQUARE_SIZE, SQUARE_SIZE
                    );
                }
                let img = images.pieces[color][piece];
                drawImage(img, x, y);
            }
        }
        if (isValid(picked)) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(...rc2xy(3+ 3/16,14/16));
            ctx.lineTo(...rc2xy(3+12/16, 5/16));
            ctx.lineTo(...rc2xy(3+ 9/16, 2/16));
            ctx.stroke();
            ctx.lineWidth = 0;
        }
    } else if (gameState === GAME_STATES.play) {
        if (pieceToMove === null) {
            highlighted = highlighted.map(
                row => row.map(i => false)
            )
        } else {
            highlighted = highlighted.map((row, r) =>
                row.map((val, c) =>
                    canMoveTo(pieceToMove, [r, c])
                )
            );
        }
        drawBoard();
    } else if (gameState === GAME_STATES.gameOver) {
        drawBoard();
    }
}

function setupGame() {
    initializeBoard();
    pickedWhite = pickedWhite.map(
        x => new Array(4).fill(null)
    );
    pickedBlack = pickedBlack.map(
        x => new Array(4).fill(null)
    );
    pickPage = 0;
    pickSelected = null;
}

function initializeBoard() {
    board = board.map(x => new Array(8).fill(null));
    highlighted = highlighted.map(x => new Array(8).fill(false));
    isBlackTurn = false;
    pieceToMove = null;
}

function placePicks() {
    let whiteLeft = randint(0, 4);
    let blackLeft = randint(0, 4);
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
            if (pickedWhite[r][c] !== null)
                board[r + 6][c + whiteLeft] = {
                    type: pickedWhite[r][c],
                    isBlack: false
                };
            if (pickedBlack[r][c] !== null)
                board[r][c + blackLeft] = {
                    type: pickedBlack[r][c],
                    isBlack: true
                };
        }
    }
}

function placeHazards() {
    if (myRandom() * 100 <= PORTAL_SPAWN_CHANCE) {
        let [portal1r, portal1c] = randUnoccupied();
        board[portal1r][portal1c] = {tile: "portal_gate"};
        let [portal2r, portal2c] = randUnoccupied();
        board[portal2r][portal2c] = {tile: "portal_gate"};
    }
    for (let i = 0; i < randint(0, MAX_ROCKS); i++) {
        let [row, col] = randUnoccupied();
        let isBomb = myRandom() * 100 <= BOMB_CHANCE;
        board[row][col] = {tile: isBomb ? "bomb" : "rock"};
    }
}

function isValid(picked) {
    let kingMap = picked.flatMap(x => x).map(x =>
        x === "king" ||
        x === "general" ||
        x === "mounted_king"
    );
    let hasAtMostOneKing =
        kingMap.indexOf(true) ===
        kingMap.lastIndexOf(true);
    let hasOneKing = hasAtMostOneKing &&
        kingMap.includes(true);
    return hasOneKing;
}

function weakMoveCheck(piece, endPiece) {
    if (Array.isArray(endPiece)) {
        endPiece = board[endPiece[0]][endPiece[1]];
    }
    if (endPiece !== null &&
        endPiece.type &&
        endPiece.isBlack === piece.isBlack) {
        // No capturing your own pieces!
        return false;
    }
    if (endPiece !== null &&
        endPiece.tile === "rock") {
        // No capturing rocks!
        return false;
    }
    if (endPiece !== null &&
        endPiece.tile === "portal_gate") {
        // No capturing portal gates!
        return false;
    }
    if (endPiece !== null &&
        endPiece.type &&
        endPiece.type === "immortal" &&
        !(piece.type === "king" ||
          piece.type === "general" ||
          piece.type === "mounted_king")) {
        // Immortal go brrr
        return false;
    }
    return true;
}

function checkSlidingMoves(piece, start, end, dir) {
    if (!start) return false;
    let current = start;
    for (let i = 0; i < 16; i++) {
        current = nextPosIn(current, dir);
        if (!weakMoveCheck(piece, current))
            return false;
        if (!current)
            return false;
        if (current.equals(end))
            return true;
        if (board[current[0]][current[1]])
            return false;
    }
    return false;
}

const ADJACENTS = [[-1,0],[1,0],[0,-1],[0,1]];
const DIAGONALS = [[-1,-1],[1,1],[-1,1],[1,-1]];
const NEIGHBORS = ADJACENTS.concat(DIAGONALS);
const KNIGHT_MOVES = [
    [1,2],[-1,2],[1,-2],[-1,-2],
    [2,1],[-2,1],[2,-1],[-2,-1]
];

const slidingMoves = {
    agent_rook: ADJACENTS,
    rook: ADJACENTS,
    agent_bishop: DIAGONALS,
    bishop: DIAGONALS,
    queen: NEIGHBORS,
    glass_queen: NEIGHBORS,
    crusader: [[-1,1],[-1,-1],[1,0]],
    knight_templar: DIAGONALS.concat([[-1,0],[1,0]]),
    cardinal: DIAGONALS,
    edea: NEIGHBORS,
    unicorn: ADJACENTS,
};

function canMoveTo(start, end) {
    let [startR, startC] = start;
    let [endR, endC] = end;
    let piece = board[startR][startC];
    if (piece === null || !piece.type)
        return false;
    if (!piece.mustMove && board.some(
        row => row.some(
            x => x && x.mustMove
        )
    )) {
        return false;
    }
    let endPiece = board[endR][endC];
    if (!weakMoveCheck(piece, endPiece))
        return false;
    let pieceType = piece.type;
    let isCapture = endPiece !== null;
    let enemyPieces = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let possPiece = board[r][c];
            if (possPiece && possPiece.type &&
                possPiece.isBlack !== piece.isBlack)
                enemyPieces.push(possPiece);
        }
    }
    let tabithaTypes = enemyPieces.map(
        x => x.type === "fool" ?
            x.effectiveType :
            x.type
    );
    const ht = x =>
        pieceType === x ||
        (pieceType === "tabitha" &&
         tabithaTypes.includes(x));
    if (pieceType === "fool") {
        pieceType = piece.effectiveType;
        if (!pieceType) return false;
    }
    if (["king", "general", "leper", "immortal",
         "cardinal", "mounted_king", "portal_mage",
         "princess", "assassin"].some(ht)) {
        for (let dir of NEIGHBORS) {
            let pos = nextPosIn(start, dir);
            if (pos && pos.equals(end)) {
                return true;
            }
        }
    }
    if (ht("golem") && isCapture) {
        for (let dir of NEIGHBORS) {
            let pos = nextPosIn(start, dir);
            if (pos && pos.equals(end)) {
                return true;
            }
        }
        for (let dir of KNIGHT_MOVES) {
            let pos = nextPosIn(start, dir);
            if (pos && pos.equals(end))
                return true;
        }
        for (let dir of ADJACENTS) {
            if (checkSlidingMoves(
                piece, start, end, dir)
            )
                return true;
        }
    }
    if (ht("blade_dancer")) {
        for (let i = -2; i <= 2; i++) {
            for (let j of [-2, 2]) {
                for (let dir of [[i, j], [j, i]]) {
                    let pos = nextPosIn(start, dir);
                    if (pos && pos.equals(end)) {
                        return true;
                    }
                }
            }
        }
    }
    if (ht("viking") || ht("berserker")) {
        let depth = ht("berserker") ? 3 : 2;
        let depths = {};
        depths[start.toString()] = depth;
        let queue = [start];
        while (queue.length &&
               depths[end.toString()] === undefined) {
            let current = queue.shift();
            let curdepth = depths[current.toString()];
            if (current.equals(end)) {
                return true;
            }
            let curpiece = board[current[0]][current[1]];
            if (curpiece &&
                current.toString() !== start.toString()) {
                continue;
            }
            if (curdepth === 0) {
                continue;
            }
            for (let dir of ADJACENTS) {
                let newPos = nextPosIn(current, dir);
                if (!newPos) continue;
                if (!weakMoveCheck(piece, newPos))
                    continue;
                if (depths[newPos.toString()] !==
                    undefined)
                    continue;
                depths[newPos.toString()] = curdepth - 1;
                queue.push(newPos);
            }
        }
        if (depths[end.toString()] !== undefined)
            return true;
    }
    if (ht("pawn")) {
        let roff = piece.isBlack ? 1 : -1;
        for (let coff of [-1, 1]) {
            let diag = nextPosIn(start, [roff, coff]);
            if (diag && diag.equals(end))
                return true;
        }
        let front = nextPosIn(start, [roff, 0]);
        if (front && !isCapture) {
            if (front.equals(end))
                return true;
            if (board[front[0]][front[1]])
                return false;
            let front2 = nextPosIn(front, [roff, 0]);
            if (front2 && !isCapture &&
                front2.equals(end))
                return true;
        }
    }
    if (ht("princess")) {
        for (let dir of DIAGONALS) {
            let pos1 = nextPosIn(start, dir);
            if (!pos1 || !weakMoveCheck(piece, pos1))
                continue;
            if (board[pos1[0]][pos1[1]])
                continue;
            let pos2 = nextPosIn(pos1, dir);
            if (pos2 && pos2.equals(end))
                return true;
        }
    }
    if (slidingMoves[pieceType]) {
        for (let dir of slidingMoves[pieceType]) {
            let rmul = piece.isBlack ? -1 : 1;
            let realDir = [dir[0] * rmul, dir[1]];
            if (checkSlidingMoves(piece,
                                  start, end, realDir))
                return true;
        }
    }
    if (pieceType === "tabitha") {
        for (let t of tabithaTypes) {
            if (!slidingMoves[t]) continue;
            for (let dir of slidingMoves[t]) {
                let rmul = piece.isBlack ? -1 : 1;
                let realDir = [dir[0] * rmul, dir[1]];
                if (checkSlidingMoves(
                    piece, start, end, realDir
                ))
                    return true;
            }
        }
    }
    if (["knight", "mounted_king",
         "edea", "pegasus", "unicorn"].some(ht)) {
        for (let dir of KNIGHT_MOVES) {
            let pos = nextPosIn(start, dir);
            if (pos && pos.equals(end))
                return true;
        }
    }
    if (ht("pegasus")) {
        for (let dir of KNIGHT_MOVES) {
            let pos1 = nextPosIn(start, dir);
            if (pos1) {
                let pos2 = nextPosIn(pos1, dir);
                if (pos2 && pos2.equals(end))
                    return true;
            }
        }
    }
    if (ht("bowman")) {
        for (let dir of ADJACENTS) {
            let newStart = nextPosIn(start, dir);
            if (!newStart) continue;
            if (board[newStart[0]][newStart[1]])
                continue;
            if (checkSlidingMoves(
                piece, newStart, end, dir
            ))
                return true;
        }
    }
    if (ht("manticore") ||
        ht("andromeda")) {
        for (let dir1 of ADJACENTS) {
            let realStart = nextPosIn(start, dir1);
            if (!realStart) continue;
            if (realStart.equals(end)) return true;
            if (board[realStart[0]][realStart[1]])
                continue;
            let dir2s;
            if (dir1[0])
                dir2s = [[dir1[0], 1],
                         [dir1[0], -1]];
            else
                dir2s = [[1, dir1[1]],
                         [-1, dir1[1]]];
            for (let dir2 of dir2s) {
                if (checkSlidingMoves(
                    piece, realStart, end, dir2
                ))
                    return true;
            }
        }
    }
    if (ht("gryphon") ||
        ht("andromeda")) {
        for (let dir1 of DIAGONALS) {
            let realStart = nextPosIn(start, dir1);
            if (!realStart) continue;
            if (realStart.equals(end)) return true;
            if (board[realStart[0]][realStart[1]])
                continue;
            for (let dir2 of [[dir1[0], 0],
                              [0, dir1[1]]]) {
                if (checkSlidingMoves(
                    piece, realStart, end, dir2
                ))
                    return true;
            }
        }
    }
    if (ht("catapult")) {
        // check horizontal
        for (let coff of [-1, 1]) {
            let horiz1 = nextPosIn(start, [0, coff]);
            if (horiz1) {
                if (horiz1.equals(end))
                    return true;
                if (board[horiz1[0]][horiz1[1]])
                    continue;
                if (weakMoveCheck(piece, horiz1)) {
                    let horiz2 = nextPosIn(horiz1,
                                           [0, coff]);
                    if (horiz2 && horiz2.equals(end))
                        return true;
                }
            }
        }
        // check vertical
        for (let roff of [-1, 1]) {
            let current = start;
            for (let i = 0; i < 16; i++) {
                current = nextPosIn(current, [roff, 0]);
                if (!current) break;
                if (current.equals(end))
                    return true;
            }
        }
        if (start[1] === end[1])
            return true;
    }
    if (pieceType === "portal_mage") {
        return !isCapture;
    }
    return false;
}

function movePiece(start, end) {
    let startPiece = board[start[0]][start[1]];
    startPiece.mustMove = undefined;
    let endPiece = board[end[0]][end[1]];
    let foolType = startPiece.type;
    if (foolType === "fool")
        foolType = startPiece.effectiveType;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] &&
                board[r][c].type === "fool" &&
                board[r][c].isBlack !== 
                    startPiece.isBlack) {
                board[r][c].effectiveType = 
                    foolType;
            }
        }
    }
    if (startPiece.type === "agent_rook") {
        startPiece.type = "agent_bishop";
    } else if (startPiece.type === "agent_bishop") {
        startPiece.type = "agent_rook";
    }
    if (startPiece.type === "pawn" &&
        end[0] === (startPiece.isBlack ? 7 : 0)) {
        startPiece.type = "queen";
    }
    if (startPiece.type === "princess" && endPiece) {
        startPiece.type = "queen";
    }
    if (endPiece && endPiece.type === "leper" &&
        startPiece.type !== "king" &&
        startPiece.type !== "general" &&
        startPiece.type !== "mounted_king") {
        startPiece.type = "leper";
    }
    if (endPiece &&
        (startPiece.type === "assassin" ||
         startPiece.type === "blade_dancer")) {
        startPiece.mustMove = true;
        isBlackTurn = !isBlackTurn; // to cancel out the other one
    }
    if (endPiece && endPiece.tile === "bomb") {
        // >:) destruction!!
        for (let roff = -1; roff <= 1; roff++) {
            for (let coff = -1; coff <= 1; coff++) {
                let r = end[0] + roff;
                let c = end[1] + coff;
                let piece = (board[r] ?? [])[c];
                if (piece && piece.type)
                    board[r][c] = null;
            }
        }
        startPiece = null;
    }
    board[end[0]][end[1]] = startPiece;
    board[start[0]][start[1]] = null;
    let hasWhiteKing = false;
    let hasBlackKing = false;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let piece = board[r][c];
            if (piece &&
                (piece.type === "king" ||
                 piece.type === "general" ||
                 piece.type === "mounted_king")
            ) {
                if (piece.isBlack)
                    hasBlackKing = true;
                else
                    hasWhiteKing = true;
            }
        }
    }
    if (!hasWhiteKing || !hasBlackKing)
        gameState = GAME_STATES.gameOver;
    isBlackTurn = !isBlackTurn;
}

function nextPosIn(pos, dir) {
    let [sr, sc] = pos;
    let [dr, dc] = dir;
    let er = sr + dr;
    let ec = sc + dc;
    if (er < 0 || er > 7 || ec < 0 || ec > 7)
        return null;
    let piece = board[er][ec];
    if (piece && piece.tile === "portal_gate") {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let thisPiece = board[r][c];
                if (thisPiece &&
                    thisPiece.tile === "portal_gate" &&
                    (r !== er || c !== ec)) {
                    return nextPosIn([r, c], dir);
                }
            }
        }
    }
    return [er, ec];
}

function run() {
    setupGame();
    setInterval(gameLoop, 1);
}

let runChecker = setInterval(() => {
    if (!imagesLoaded()) return;
    run();
    clearInterval(runChecker);
}, 100);