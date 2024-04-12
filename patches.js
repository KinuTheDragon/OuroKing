// JS is stupid sometimes so I made this file

Array.prototype.equals = function (other) {
    return this.every((x, i) => other[i] === x);
}