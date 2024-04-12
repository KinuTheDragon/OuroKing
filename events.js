canvas.addEventListener("click", function(event) {
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let [r, c] = xy2rc(x, y);
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        handleBoardClick(r, c);
    } else {
        handleClick(x, y);
    }
});

canvas.addEventListener("mousemove", function(event) {
    let rect = event.target.getBoundingClientRect();
    mousePos = [event.clientX - rect.left,
                event.clientY - rect.top];
});