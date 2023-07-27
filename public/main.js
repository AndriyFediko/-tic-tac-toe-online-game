$(".startScreen").show(0);
$(".enterYourNameScreen").hide(0);
$(".loardingScreen").hide(0);
$(".gameScreen").hide(0);
$(".gameOverScreen").hide(0);
$(".settingsScreen").hide(0);
$(".confirmVolumeSettinsAlert").hide(0);
$(".leaderBoardScreen").hide(0);
// $(".settingsScreen").show(0);
let gameVolume = 0.5;
let musicVolume = 0;
let moveSound = new Audio("./audio/moveSound.mp3");
let music = new Audio("./audio/music.mp3");
music.volume = musicVolume;
moveSound.volume = gameVolume;
let socket = io();
let name;
let oppName;
let value = "";
let oppVal = "";
let turn = "./img/cross.png";

if (localStorage.musicVolume || localStorage.gameVolume) {
    $(".confirmVolumeSettinsAlert").show(0);
    $(".btnYes").click(() => {
        if (localStorage.musicVolume && localStorage.gameVolume) {
            musicVolume = localStorage.musicVolume;
            music.volume = musicVolume;
            music.play();
            gameVolume = localStorage.gameVolume;
            moveSound.volume = gameVolume;
        } else if (localStorage.musicVolume) {
            musicVolume = localStorage.musicVolume;
            music.volume = musicVolume;
            music.play();
        } else if (localStorage.gameVolume) {
            gameVolume = localStorage.gameVolume;
            moveSound.volume = gameVolume;
        }
        $(".confirmVolumeSettinsAlert").hide(0);
    });
    $(".btnNo").click(() => {
        $(".confirmVolumeSettinsAlert").hide(0);
    });
}

if (localStorage.bgImage) {
    $(".bgImage").css("background-image", `url("${localStorage.bgImage}")`);
    $(".page").css("background-color", "rgba(0, 0, 0, .8)");
}

$("#resetToDafaultBtn").click(() => {
    musicVolume = 0;
    music.volume = musicVolume;
    music.play();
    gameVolume = 0.5;
    moveSound.volume = gameVolume;
    $("#musicVolume").val(musicVolume);
    $("#masterVolume").val(gameVolume);
    $(".page").css("background-color", "#333");
    if (localStorage.musicVolume) localStorage.removeItem("musicVolume");
    if (localStorage.bgImage) localStorage.removeItem("bgImage");
    if (localStorage.gameVolume) localStorage.removeItem("gameVolume");
});

$(".LeaderBoardBtn").click(() => {
    socket.emit("leaderBoard");
    $(".leaderBoardScreen").show(0);
    $(".startScreen").hide(0);
});

$(".closeLeaderBoardBtn").click(() => {
    $(".leaderBoardScreen").hide(0);
    $(".startScreen").show(0);
});

$("#startGame").click(() => {
    if ($("#name").val() != "") {
        name = $("#name").val();
        $(".loardingScreen").show(0);
        $(".enterYourNameScreen").hide(0);
        socket.emit("player ready", {
            name: name
        });
    }
});

$(".giveUpBtn").click(() => {
    socket.emit("gameOverSurrended", {
        oppName: oppName
    });
});

$("#playAgainBtn").click(() => {
    $(".gameScreen").hide(0);
    $(".gameOverScreen").hide(0);
    $(".loardingScreen").show(0);
    socket.emit("player ready", {
        name: name
    });
});

$("#menuBtn").click(() => {
    $(".gameScreen").hide(0);
    $(".gameOverScreen").hide(0);
    $(".startScreen").show(0);
})

$("#musicVolume").on("input", () => {
    musicVolume = $("#musicVolume").val()
    music.volume = musicVolume;
    music.play();
    localStorage.musicVolume = musicVolume;
});

$("#wallpaperImageInput").on("change", () => {
    console.log($("#wallpaperImageInput").val());
    let file = document.getElementById("wallpaperImageInput").files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result)
        $(".bgImage").css("background-image", `url("${reader.result}")`);
        $(".page").css("background-color", "rgba(0, 0, 0, .8)");
        localStorage.bgImage = reader.result;
    };
});

$("#closeSettings").click(() => {
    $(".settingsScreen").hide(0);
    $(".startScreen").show(0);
});

$(".settingsBtn").click(() => {
    $(".startScreen").hide(0);
    $(".settingsScreen").show(0);
});

$(".playBtn").click(() => {
    $(".startScreen").hide(0);
    $(".enterYourNameScreen").show(0);
});

$("#masterVolume").on("change", () => {
    gameVolume = $("#masterVolume").val()
    moveSound.volume = gameVolume;
    moveSound.play();
    localStorage.gameVolume = gameVolume;
    console.log(gameVolume);
});

socket.on("player ready", (data) => {
    let allPlayersArr = data.allPlayers;
    console.log(allPlayersArr);
    let opponentName = "";
    $(".loardingScreen").hide(0);
    $(".gameScreen").show(0);
    let foundObj = allPlayersArr.find(playersObj => playersObj.player1.player1Name == name || playersObj.player2.player2Name == name);
    foundObj.player1.player1Name == name ? opponentName = foundObj.player2.player2Name : opponentName = foundObj.player1.player1Name;
    foundObj.player1.player1Name == name ? value = foundObj.player1.player1Value : value = foundObj.player2.player2Value;
    if (name == foundObj.player1.player1Name) {
        oppName = foundObj.player2.player2Name;
    } else {
        oppName = foundObj.player1.player1Name;
    }
    if (value == foundObj.player1.player1Value) {
        oppVal = foundObj.player2.player2Value;
    } else {
        oppVal = foundObj.player1.player1Value;
    }
    for (let el of data.allUsers) {
        if (el.name == name) {
            $("#p1Score").text(el.winsScore);
        } else if (el.name == oppName) {
            $("#p2Score").text(el.winsScore);
        }
    }
    $(".player1").text(name + ": ");
    $(".player2").text(oppName + ": ");
    if (turn === value) {
        $("#turnStaus").text(name + "'s turn");
    } else {
        $("#turnStaus").text(oppName + "'s turn");
    }
});

$(".cell").click((e) => {
    if (!$(e.target).hasClass("full") && turn === value) {
        moveSound.play();
        socket.emit("move", {
            obj: {
                cellId: e.target.id,
                name: name,
                value: value,
                turn: turn
            }
        });
    }
});

function leaderBoardSortArr(obj) {
    let sortedArr = [];
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].winsScore != 0) {
            sortedArr.push(obj[i].winsScore)
        }
    }
    return sortedArr.sort((a, b) => b - a);
}

function leaderPushSortObj(arr, obj) {
    let sortedObj = [];
    for (let i = 0; i < arr.length; i++) {
        for (let n = 0; n < obj.length; n++) {
            if (arr[i] == obj[n].winsScore) {
                sortedObj.push(obj[n]);
            }
        }
    }
    return sortedObj;
}

function leaderBoardSortObj(sortedObj, length) {
    let res = [];
    let prevName = "";
    for (let i = 0; i < length; i++) {
        if (prevName != sortedObj[i].name) {
            res.push(sortedObj[i]);
        }
        prevName = sortedObj[i].name;
    }
    return res;
}

socket.on("leaderBoard", (data) => {
    let topPos = 1;
    let sortedArr = leaderBoardSortArr(data);
    let obj = leaderPushSortObj(sortedArr, data);
    let sortedObj = leaderBoardSortObj(obj, sortedArr.length);

    console.log(sortedObj);
    $(".liderBoardIteamsContainer").empty();
    if (data.length > 0) {
        for (let el of sortedObj) {
            $(".liderBoardIteamsContainer").append(` <div class="liderBoardIteam">
            <div class="liderBoardIteamLeft">
                <span class="liderBoardPos">${topPos}.</span>
                <span class="liderBoardName">${el.name}</span>
            </div>
            <span class="liderBoardWinScore">${el.winsScore}</span>
        </div>`);
            topPos++;
        }
    } else {
        $(".liderBoardIteamsContainer").append(`<div class="emptyAlert">Leader board is empty</div>`)
    }
});

socket.on("move", (data) => {
    $("#" + data.info.obj.cellId).append(`<div class="moveSign" style="background-image: url(${data.info.obj.value});")></div>`);
    $("#" + data.info.obj.cellId).addClass("full");
    turn = data.nextMove;
    if (turn == value) {
        $("#turnStaus").text(name + "'s turn");
    } else {
        $("#turnStaus").text(oppName + "'s turn");
    }
})


socket.on("gameOver", (data) => {
    if (data.oppName) {
        socket.emit("gameOver", {
            name: data.oppName,
        });
        if(name === data.oppName){
            $("#gameOverResult").text("You win!");
        } else{
            $("#gameOverResult").text("You lose(");
        }
    } else {
        if (data.value === "Draw") {
            $("#gameOverResult").text("Draw");
        } else if (data.value === value) {
            $("#gameOverResult").text("You win!");
        } else {
            $("#gameOverResult").text("You lose(");
        }
        socket.emit("gameOver", {
            name: data.name
        });
        $(".cell").removeClass("full");
        $(".cell").text("");
    }
    $(".gameOverScreen").show(0);
});