const playGrid = document.querySelector("#playgrid");
const info = document.querySelector("#info");
const btnReset = document.querySelector("#btnrest");
const difficulty = document.querySelector("#difficulty");

let player = "mark_x";
let who_win = "";
let draw = false;

info.innerHTML = "X Turn";

const patternWin = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function createBox() {
    for (let i = 0; i < 9; i++) {
        let div = document.createElement("div");
        div.classList.add("box");
        div.addEventListener("click", clickMark);
        playGrid.append(div);
    }
}

createBox();

function clickMark(e) {
    if (player === "mark_x") {
        e.target.classList.add(player);
        e.target.removeEventListener("click", clickMark);
        checkWin();
        if (who_win === "" && !draw) {
            changePlayer();
            setTimeout(aiPlay, 500);
        }
    }
}

function changePlayer() {
    if (player === "mark_x") {
        player = "mark_o";
        info.innerHTML = "O Turn";
    } else {
        player = "mark_x";
        info.innerHTML = "X Turn";
    }
}

function checkWin() {
    let allDiv = document.querySelectorAll(".box");
    patternWin.forEach(patt => {
        let [a, b, c] = patt;
        if (allDiv[a].classList.contains("mark_x") && allDiv[b].classList.contains("mark_x") && allDiv[c].classList.contains("mark_x")) {
            who_win = "mark_x";
        }
        if (allDiv[a].classList.contains("mark_o") && allDiv[b].classList.contains("mark_o") && allDiv[c].classList.contains("mark_o")) {
            who_win = "mark_o";
        }
    });

    if (who_win !== "") {
        if (who_win === "mark_x") {
            info.innerHTML = "X WIN";
        } else {
            info.innerHTML = "O WIN";
        }
        allDiv.forEach(d => {
            d.removeEventListener("click", clickMark);
        });
    } else {
        let allMark_O = document.querySelectorAll(".mark_o");
        let allMark_X = document.querySelectorAll(".mark_x");
        if (allMark_O.length + allMark_X.length === 9) {
            draw = true;
            info.innerHTML = "DRAW";
            allDiv.forEach(d => {
                d.removeEventListener("click", clickMark);
            });
        }
    }
}

function aiPlay() {
    let allDiv = document.querySelectorAll(".box");
    let available = [];
    allDiv.forEach((div, index) => {
        if (!div.classList.contains("mark_x") && !div.classList.contains("mark_o")) {
            available.push(index);
        }
    });

    let randomIndex;
    let diff = difficulty.value;

    if (diff === "easy") {
        randomIndex = available[Math.floor(Math.random() * available.length)];
    } else if (diff === "medium") {
        randomIndex = mediumAI(available, allDiv);
    } else {
        randomIndex = hardAI(available, allDiv);
    }

    if (available.length > 0) {
        allDiv[randomIndex].classList.add("mark_o");
        allDiv[randomIndex].removeEventListener("click", clickMark);
        checkWin();
        if (who_win === "" && !draw) {
            changePlayer();
        }
    }
}

function mediumAI(available, allDiv) {
    // Medium AI logic: Try to win or block the player
    for (let i = 0; i < available.length; i++) {
        let index = available[i];
        allDiv[index].classList.add("mark_o");
        if (checkTempWin(allDiv, "mark_o")) {
            allDiv[index].classList.remove("mark_o");
            return index;
        }
        allDiv[index].classList.remove("mark_o");
    }

    for (let i = 0; i < available.length; i++) {
        let index = available[i];
        allDiv[index].classList.add("mark_x");
        if (checkTempWin(allDiv, "mark_x")) {
            allDiv[index].classList.remove("mark_x");
            return index;
        }
        allDiv[index].classList.remove("mark_x");
    }

    return available[Math.floor(Math.random() * available.length)];
}

function hardAI(available, allDiv) {
    // Hard AI logic: Implement Minimax algorithm
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < available.length; i++) {
        let index = available[i];
        allDiv[index].classList.add("mark_o");
        let score = minimax(allDiv, 0, false);
        allDiv[index].classList.remove("mark_o");
        if (score > bestScore) {
            bestScore = score;
            move = index;
        }
    }
    return move;
}

function minimax(allDiv, depth, isMaximizing) {
    let scores = {
        "mark_o": 1,
        "mark_x": -1,
        "draw": 0
    };

    let result = getWinner(allDiv);
    if (result !== null) return scores[result];

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!allDiv[i].classList.contains("mark_x") && !allDiv[i].classList.contains("mark_o")) {
                allDiv[i].classList.add("mark_o");
                let score = minimax(allDiv, depth + 1, false);
                allDiv[i].classList.remove("mark_o");
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!allDiv[i].classList.contains("mark_x") && !allDiv[i].classList.contains("mark_o")) {
                allDiv[i].classList.add("mark_x");
                let score = minimax(allDiv, depth + 1, true);
                allDiv[i].classList.remove("mark_x");
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function getWinner(allDiv) {
    for (let [a, b, c] of patternWin) {
        if (allDiv[a].classList.contains("mark_x") && allDiv[b].classList.contains("mark_x") && allDiv[c].classList.contains("mark_x")) {
            return "mark_x";
        }
        if (allDiv[a].classList.contains("mark_o") && allDiv[b].classList.contains("mark_o") && allDiv[c].classList.contains("mark_o")) {
            return "mark_o";
        }
    }

    let allMark_O = document.querySelectorAll(".mark_o").length;
    let allMark_X = document.querySelectorAll(".mark_x").length;
    if (allMark_O + allMark_X === 9) {
        return "draw";
    }

    return null;
}

function checkTempWin(allDiv, mark) {
    return patternWin.some(patt => patt.every(index => allDiv[index].classList.contains(mark)));
}

btnReset.addEventListener("click", resetGame);

function resetGame() {
    let allDiv = document.querySelectorAll(".box");
    allDiv.forEach(d => {
        d.classList.remove("mark_x");
        d.classList.remove("mark_o");
        d.addEventListener("click", clickMark);
    });
    player = "mark_x";
    who_win = "";
    draw = false;
    info.innerHTML = "X Turn";
}
