const descriptionElement = 
    document.getElementById("description");

function drawImage(img, x, y) {
    ctx.drawImage(img, x, y, SQUARE_SIZE, SQUARE_SIZE);
}

function drawBoard() {
    ctx.font = "20px Courier New";
    ctx.fillStyle = "#ffffff";
    let text = "Turn: " + (
        isBlackTurn ? "Black" : "White"
    );
    ctx.fillText(text, ...rc2xy(-0.5, 0));
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let isLightSquare = (r + c) % 2 === 0;
            let color = isLightSquare ?
                LIGHT_SQUARE_COLOR :
                DARK_SQUARE_COLOR;
            if (highlighted[r][c])
                color = isLightSquare ?
                    LIGHT_SQUARE_MOVE_COLOR :
                    DARK_SQUARE_MOVE_COLOR;
            let [x, y] = rc2xy(r, c);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            drawPiece(r, c);
        }
    }
}

function drawPicked(picked, isBlack) {
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
            let isLightSquare = (r + c) % 2 === 0;
            let color = isLightSquare ?
                LIGHT_SQUARE_COLOR :
                DARK_SQUARE_COLOR;
            let [x, y] = rc2xy(r + 3, c + 2);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            let piece = picked[r][c];
            if (piece !== null) {
                let color = isBlack ? "black" : "white";
                let img = images.pieces[color][piece];
                drawImage(img, x, y);
            }
        }
    }
}

function drawPiece(r, c) {
    let piece = board[r][c];
    if (piece === null) return;
    let img;
    if (piece.tile !== undefined) {
        img = images.tiles[piece.tile];
    } else {
        let color = piece.isBlack ? "black" : "white";
        img = images.pieces[color][piece.type];
    }
    let [x, y] = rc2xy(r, c);
    drawImage(img, x, y);
}

function setDescription(text) {
    descriptionElement.textContent = text;
}