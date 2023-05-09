const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
   SELECT
   *
   FROM
   player_details ORDER BY player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//API 2
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
    *
    FROM
     player_details WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  response.send(convertDbObjectToResponseObject(player));
});
//API 3
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      player_details
    SET
      player_name='${playerName}'
      
      
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
    *
    FROM
     match_details WHERE match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  response.send(convertDbObjectToResponseObject(match));
});
//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
   SELECT
   *
   FROM
   player_match_score NATURAL JOIN match_details WHERE player_id=${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  response.send(
    playerMatches.map((eachMatch) => convertDbObjectToResponseObject(eachMatch))
  );
});
//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchesQuery = `
   SELECT
   *
   FROM
   player_details NATURAL JOIN player_match_score WHERE match_id=${matchId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  response.send(
    playerMatches.map((eachMatch) => convertDbObjectToResponseObject(eachMatch))
  );
  //   response.send(convertDbObjectToResponseObject(playerMatches));
});
//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  //   const getPlayerQuery = `
  //     SELECT
  //      player_id,
  //      player_name,
  //      SUM(score),
  //      SUM(fours),
  //      SUM(sixes)
  //     FROM
  //      player_match_score WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerScored);
  //   const convertDbObjectToResponseObject = (dbObject) => {
  //     return {
  //       playerId: dbObject.player_id,
  //       playerName: dbObject.player_name,
  //     };
  //   };
  //   response.send(convertDbObjectToResponseObject(player));
  response.send(player);
});
module.exports = app;
