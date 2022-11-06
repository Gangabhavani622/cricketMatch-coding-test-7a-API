const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET ALL API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const playersDetailsResponse = await db.all(getPlayersQuery);
  let convertResponse = playersDetailsResponse.map((x) => ({
    playerId: x.player_id,
    playerName: x.player_name,
  }));
  console.log(convertResponse);
  response.send(convertResponse);
});

//GET API based on ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const playerDetailsResponse = await db.get(getPlayerQuery);
  let convertResponse = {
    playerId: playerDetailsResponse.player_id,
    playerName: playerDetailsResponse.player_name,
  };
  console.log(convertResponse);
  response.send(convertResponse);
});

//UPDATE API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE
    player_details
      SET
         player_id=${playerId},
         player_name=${playerName}
   WHERE 
       player_id=${playerId};`;
  const updateResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//GET match details API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const matchDetailsResponse = await db.get(getMatchQuery);
  let convertResponse = {
    match: matchDetailsResponse.match,
    year: matchDetailsResponse.year,
  };
  console.log(convertResponse);
  response.send(convertResponse);
});

// GET ALL match API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `SELECT * FROM match_details;`;
  const matchDetailsResponse = await db.all(getMatchesQuery);
  let convertResponse = matchDetailsResponse.map((x) => ({
    matchId: x.match_id,
    match: x.match,
    year: x.year,
  }));
  console.log(convertResponse);
  response.send(convertResponse);
});

//GET players API
app.get("/matches/:matchId/players", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details ;`;
  const playersDetailsResponse = await db.all(getPlayersQuery);
  let convertResponse = playersDetailsResponse.map((x) => ({
    playerId: x.player_id,
    playerName: x.player_name,
  }));
  console.log(convertResponse);
  response.send(convertResponse);
});

//GET scores API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT
   player_details.player_name,
   player_details.player_id,
  SUM(player_match_score.score),
  SUM(player_match_score.fours),
  SUM(player_match_score.sixes)
  FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id WHERE player_details.player_id=${playerId} GROUP BY player_details.player_id;`;
  const playersDetailsResponse = await db.all(getPlayersQuery);
  console.log(playersDetailsResponse);
  let convertResponse = playersDetailsResponse.map((x) => ({
    playerId: x.player_id,
    playerName: x.player_name,
    totalScore: x.score,
    totalFours: x.fours,
    totalSixes: x.sixes,
  }));
  console.log(convertResponse);
  response.send(convertResponse);
});

module.exports = app;
