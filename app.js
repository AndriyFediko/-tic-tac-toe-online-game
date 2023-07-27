const express = require("express");
const { test } = require("node:test");
const app = express();
const path = require("path");
const { disconnect, emit } = require("process");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3000;
let playersReady = [];
let usersPlaying = [];
let allUsers = [];
let board = [];
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    return res.sendFile("index.html");
});

io.on("connection", (socket) =>{
    socket.on("player ready", (data) =>  {
        let checkNameRes = false;
        for(let i = 0; i<allUsers.length; i++){
            if(allUsers[i].name === data.name){
                checkNameRes = true;
            }
        }
        if(!checkNameRes === true){
            allUsers.push({name: data.name, winsScore: 0});
            console.log(allUsers);
        }
        playersReady.push(data.name);
        if(playersReady.length >= 2){
            let player1Obj = {
                player1Name: playersReady[0],
                player1Value: "./img/cross.png",
                player1Move: "", 
            }
            let player2Obj = {
                player2Name: playersReady[1],
                player2Value: "./img/circle.png",
                player2Move: "", 
            }
            let playersObj = {
                player1: player1Obj,
                player2: player2Obj,
            }
            usersPlaying.push(playersObj);
            playersReady.splice(0,2);
            io.emit("player ready", {allPlayers: usersPlaying, allUsers: allUsers});
            board = [
                null, null, null,
                null, null, null,
                null, null, null
            ];
        }
    });
    movesCount = 0;
    socket.on("move", (data)=>{
        if(data.obj.turn === "./img/cross.png"){
            io.emit("move", obj = {info:data, nextMove: "./img/circle.png"});
            board[(data.obj.cellId).slice(4)-1] = "x";
        } else{
            io.emit("move", obj = {info:data, nextMove: "./img/cross.png"});
            board[(data.obj.cellId).slice(4)-1] = "o";
        }
        movesCount++;
        console.log(board)
        if(movesCount >= 9){
            console.log("draw");
            io.emit("gameOver", "Draw");
        }
        if(board[0] === "x" && board[1] === "x" && board[2] === "x" || board[3] === "x" && board[4] === "x" && board[5] === "x" || board[6] === "x" && board[7] === "x" && board[8] === "x" || board[0] === "x" && board[3] === "x" && board[6] === "x" || board[1] === "x" && board[4] === "x" && board[7] === "x" || board[2] === "x" && board[5] === "x" && board[8] === "x" || board[0] === "x" && board[4] === "x" && board[8] === "x" || board[2] === "x" && board[4] === "x" && board[6] === "x"){
            console.log("X win");
            io.emit("gameOver", {value: data.obj.value, name: data.obj.name});
        }
        if(board[0] === "o" && board[1] === "o" && board[2] === "o" || board[3] === "o" && board[4] === "o" && board[5] === "o" || board[6] === "o" && board[7] === "o" && board[8] === "o" || board[0] === "o" && board[3] === "o" && board[6] === "o" || board[1] === "o" && board[4] === "o" && board[7] === "o" || board[2] === "o" && board[5] === "o" && board[8] === "o" || board[0] === "o" && board[4] === "o" && board[8] === "o" || board[2] === "o" && board[4] === "o" && board[6] === "o"){
            console.log("O win");
            io.emit("gameOver", {value: data.obj.value, name: data.obj.name});
        }
    });
    socket.on("gameOverSurrended", (data) =>{
        io.emit("gameOver", data);
    })
    socket.on("gameOver", (data)=>{
        movesCount = 0;
        usersPlaying.splice(0,2);
        for(let i = 0; i<allUsers.length; i++){
            if(allUsers[i].name === data.name){
                allUsers[i].winsScore += 0.5;
                console.log(allUsers[i]);
                console.log(allUsers);
            }
        }
    });
    socket.on("leaderBoard", () => {
        io.emit("leaderBoard", allUsers);
    });
});

http.listen(PORT, ()=>{
    console.log(`Server work on port: ${PORT}`)
});