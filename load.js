const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

if (window.innerHeight < 510 || window.innerWidth < 510) {
    let size = Math.min(window.innerWidth,
                        window.innerHeight) - 10;
    canvas.width = size;
    canvas.height = size;
    document.querySelector(".play-rest")
        .style.right = `${size+10}px`;
    if (window.innerHeight > window.innerWidth) {
        document.querySelector(".canvas-container")
            .style.top = `${window.innerHeight - size}px`;
        // todo: figure out how to make it work
        // in portrait mode on mobile devices
        // (maybe put the play-rest above the canvas?)
    }
}

const width = canvas.width;
const height = canvas.height;

const images = {
    items: {},
    pieces: {
        black: {},
        white: {}
    },
    relics: {},
    tiles: {}
};

const itemNames = [
    "bishop_bottle",
    "boomerang",
    "boulder",
    "downgrade",
    "exploding_rock",
    "hammer",
    "hang_glider",
    "knight_bottle",
    "power_up",
    "rewind",
    "rocking_chair",
    "rook_bottle",
    "shackles",
    "snow_bottle",
    "sphere_protection",
    "teleporter"
];

const pieceNames = [
    "agent_rook",
    "agent_bishop",
    "andromeda",
    "assassin",
    "berserker",
    "bishop",
    "blade_dancer",
    "bowman",
    "cardinal",
    "catapult",
    "crusader",
    "edea",
    "fool",
    "general",
    "glass_queen",
    "golem",
    "gryphon",
    "immortal",
    "king",
    "knight",
    "knight_templar",
    "leper",
    "manticore",
    "pawn",
    "mounted_king",
    "pegasus",
    "portal_mage",
    "princess",
    "queen",
    "rook",
    "tabitha",
    "unicorn",
    "viking"
];

const relicNames = [
    "alarm_bell",
    "backpack",
    "backstabbing_knife",
    "bodyguard_horn",
    "bottomless_bag",
    "bounty_card",
    "compass",
    "cursed_staff",
    "death_medal",
    "discount_card",
    "dwarven_helmet",
    "feather_necklace",
    "gold_bar",
    "guardian_angel",
    "holy_grail",
    "immaterial_vestments",
    "marching_boots",
    "ouroboros_clock",
    "ouroboros_sigil",
    "pegasus_wing",
    "shovel",
    "spiked_shield",
    "tempered_glass",
    "finisher",
    "treasure_chest",
    "wrecking_ball",
];

const tileNames = [
    "bomb",
    "portal_gate",
    "rock"
];

for (let [key, names] of [
    ["items", itemNames],
    ["relics", relicNames],
    ["tiles", tileNames]
]) {
    for (let name of names) {
        let img = document.createElement("img");
        img.src = `https://kinuthedragon.github.io/OuroKing/images/${key}/${name}.png`;
        images[key][name] = img;
    }
}

for (let pieceName of pieceNames) {
    for (let color of ["black", "white"]) {
        let img = document.createElement("img");
        img.src = `https://kinuthedragon.github.io/OuroKing/images/pieces/${color}/${pieceName}.png`;
        images.pieces[color][pieceName] = img;
    }
}

const upgrades = {
    assassin: "blade_dancer",
    bishop: "cardinal",
    crusader: "knight_templar",
    king: "mounted_king",
    knight: "pegasus_rider",
    viking: "berserker"
};

const choosablePieces = pieceNames.filter(
    x => x !== "general" && // bc general boring
         x !== "glass_queen" // bc it's just a queen
);

const specialPieceNames = {
    agent_rook: "Agent +",
    agent_bishop: "Agent X",
    andromeda: "Andromeda of the Stars",
    edea: "Edea, the Witch Queen",
    pawn: "Marching Pawn",
    pegasus: "Pegasus Rider",
    tabitha: "Tabitha the Deceptive",
    unicorn: "Unicorn Cavalry"
};

function getPieceName(piece) {
    return specialPieceNames[piece] ??
        piece.replaceAll("_", " ")
             .replaceAll(/\b([a-z])/g,
                         x => x.toUpperCase());
}

const pieceDescriptions = {
    agent_rook: "Moves like a rook. After moving, it transforms into Agent X, which moves like a bishop.",
    agent_bishop: "Moves like a bishop. After moving, it transforms into Agent +, which moves like a rook.",
    andromeda: "Moves 1 square cardinally, then any number of squares diagonally, or 1 square diagonally, then any number of squares cardinally.",
    assassin: "Moves like a King. After killing a unit, moves again.",
    berserker: "Moves up to 3 times horizontally or vertically. Not all moves have to be in the same direction.",
    bishop: "Moves any number of squares diagonally.",
    blade_dancer: "Jumps up to 2 squares horizontally and up to 2 vertically or vice versa. After killing a unit, moves again.",
    bowman: "Moves 2 or more squares cardinally or diagonally.",
    cardinal: "Moves like a Bishop or a King.",
    catapult: "Moves any number of squares vertically jumping over other units, or up to two squares horizontally.",
    crusader: "Moves any number of squares diagonally forward or vertically backward.",
    edea: "Moves like a Rook, Bishop, or Knight.",
    fool: "Moves with the same pattern as the last enemy to move.",
    general: "Moves one square in any direction. If he gets killed, his army demoralizes and surrenders.",
    glass_queen: "Moves like a Bishop or a Rook. If she dies, she won't come back in the future combats. Rewinds only bring her back for this combat.",
    golem: "Can only move by killing a unit, using Rook, King, or Knight moves.",
    gryphon: "Moves 1 square diagonally, then any number of squares cardinally.",
    immortal: "Moves like a King. Can only be killed by a King or General.",
    king: "Moves 1 square in any direction. If he gets killed, his army demoralizes and surrenders.",
    knight: "Jumps 1 square horizontally and 2 vertically or 2 horizontally and 1 vertically.",
    knight_templar: "Moves any number of squares diagonally or vertically, without jumping over other units.",
    leper: "Moves like a King. When killed, transforms its killer into a Leper for the rest of the combat unless it was killed by a King.",
    manticore: "Moves 1 square cardinally, then any number of squares diagonally.",
    pawn: "Moves up to 2 squares forward or 1 square diagonally forward. Can only kill diagonally. If it gets to the last row, it transforms into a Queen for the rest of the combat.",
    mounted_king: "Moves like a King or Knight. If he gets killed, his army demoralizes and surrenders.",
    pegasus: "Jumps 1 square horizontally and 2 vertically or vice versa, up to twice in the same direction.",
    portal_mage: "Moves to any unoccupied square. Can only kill on adjacent squares.",
    princess: "Moves 1 square cardinally, or up to 2 diagonally. After killing a unit, it transforms into a Queen for the rest of the combat unless it killed a Leper.",
    queen: "Moves like a Bishop or a Rook.",
    rook: "Moves any number of squares vertically or horizontally, without jumping over units.",
    tabitha: "Moves like any of the enemy units except a Portal Mage.",
    unicorn: "Moves like a Rook or a Knight.",
    viking: "Moves up to 2 times horizontally or vertically. Not all moves have to be in the same direction."
};

const tileDescriptions = {
    bomb: "Bomb\nIf destroyed, it explodes, killing all units in adjacent squares.",
    portal_gate: "Portal Gate\nUnits entering the portal gate exit through the other gate in the same direction they were moving.",
    rock: "Rock\nBlocks the movement of units through this square."
};

function getPieceDescription(piece) {
    return getPieceName(piece) + "\n" +
        pieceDescriptions[piece] +
        (upgrades[piece] ?
            "\nUpgrades to " +
            getPieceName(upgrades[piece]) + "." :
            ""
        );
}

function imagesLoaded() {
    for (let key of ["items", "relics", "tiles"]) {
        let imgs = Object.values(images[key]);
        if (!imgs.every(x => x.complete))
            return false;
    }
    for (let color of ["black", "white"]) {
        let imgs = Object.values(images.pieces[color]);
        if (!imgs.every(x => x.complete))
            return false;
    }
    return true;
}

let board = new Array(8).fill(null);
let highlighted = new Array(8).fill(null);

let isBlackTurn = false;
let pieceToMove;

let pickedWhite = [null, null];
let pickedBlack = [null, null];
let pickPage, pickSelected;

function col2x(c) {
    return width / 2 + (c - 4) * SQUARE_SIZE;
}

function row2y(r) {
    return height / 2 + (r - 4) * SQUARE_SIZE;
}

function rc2xy(r, c) {
    return [col2x(c), row2y(r)];
}

function x2col(x) {
    return Math.floor((x - width / 2) / SQUARE_SIZE + 4);
}

function y2row(y) {
    return Math.floor((y - height / 2) / SQUARE_SIZE + 4);
}

function xy2rc(x, y) {
    return [y2row(y), x2col(x)];
}

let myRandom;

function randint(x, y) {
    return Math.floor(myRandom() * (y - x + 1)) + x;
}

function randUnoccupied() {
    while (true) {
        let r = randint(0, 7);
        let c = randint(0, 7);
        if (board[r][c] === null)
            return [r, c];
    }
}

function getPage(data, pageNum, pageSize) {
    if (pageNum < 0) return [];
    let out = data.slice(pageNum * pageSize,
                         (pageNum + 1) * pageSize);
    if (out.length === 0) return [];
    while (out.length < pageSize)
        out.push(null);
    return out;
}

function numPages(data, pageSize) {
    return Math.ceil(data.length / pageSize);
}

const LIGHT_SQUARE_COLOR = "#eedd99";
const DARK_SQUARE_COLOR = "#998855";
const LIGHT_SQUARE_MOVE_COLOR = "#33bb33";
const DARK_SQUARE_MOVE_COLOR = "#448844";
const PIECE_DISPLAY_COLOR = "#444444";
const PIECE_DISPLAY_SELECT_COLOR = "#888888";

const SQUARE_SIZE = width / 10;

const PORTAL_SPAWN_CHANCE = 20;
const BOMB_CHANCE = 20;
const MAX_ROCKS = 7;

const GAME_STATES = {
    pickWhite: "pickWhite",
    pickBlack: "pickBlack",
    play: "play",
    gameOver: "gameOver"
};

let mousePos = [-1, -1];

let gameState = GAME_STATES.pickWhite;