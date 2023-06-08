const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
app.use(express.json());

const intilizationAndDbServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server running"));
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
intilizationAndDbServer();

const convertdbObjectIntoResponseObjcet = (dbobject) => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
  };
};

const convertdbObjectIntoResponseMatchObjcet = (dbobject) => {
  return {
    matchId: dbobject.match_id,
    match: dbobject.match,
    year: dbobject.year,
  };
};
// get all players
app.get("/players/", async (request, response) => {
  const getQuery = `SELECT * 
    FROM player_details;`;

  const dbUsersList = await db.all(getQuery);
  response.send(
    dbUsersList.map((eachObject) =>
      convertdbObjectIntoResponseObjcet(eachObject)
    )
  );
});
//get speccificc player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `SELECT *
  FROM player_details
  WHERE player_id=${playerId};`;
  const dbUser = await db.get(getQuery);
  response.send(convertdbObjectIntoResponseObjcet(dbUser));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//api 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getQuery = `SELECT * 
    FROM match_details
    WHERE match_id=${matchId};`;

  const dbUser = await db.get(getQuery);
  response.send(convertdbObjectIntoResponseMatchObjcet(dbUser));
});

//api5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `SELECT
	                            match_details.match_id AS matchId,
	                            match_details.match AS match,match_details.year
                            FROM 
                                player_match_score NATURAL JOIN match_details
                            WHERE 
                                player_id='${playerId}';`;
  const ubUser = await db.all(getMatchQuery);
  response.send(ubUser);
});
//api 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getQuery = `SELECT player_id AS playerId,player_name AS playerName  FROM player_details 
    NATURAL JOIN player_match_score WHERE match_id=${matchId};`;

  const dbUser = await db.all(getQuery);
  response.send(dbUser);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `SELECT player_id AS playerId,player_name AS playerName ,SUM(score) AS totalScore,SUM(fours) AS totalFours ,SUM(sixes) AS totalSixes
   FROM player_match_score  NATURAL JOIN player_details
    WHERE player_id=${playerId};`;

  const Userdb = await db.get(getQuery);
  response.send(Userdb);
});

module.exports = app;
