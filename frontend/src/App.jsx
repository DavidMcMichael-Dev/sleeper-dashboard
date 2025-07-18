import { useEffect, useState } from "react";
import React from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import "./App.css";

const LEAGUE_ID = "1124851920960249856";

function LeagueHome() {
  const [league, setLeague] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagueData() {
      try {
        const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}`);
        const usersRes = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`);

        const leagueData = await leagueRes.json();
        const usersData = await usersRes.json();

        setLeague(leagueData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching league data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagueData();
  }, []);

  return (
    <div className="app">
      <h1>Sleeper League Dashboard</h1>

      {loading && <p>Loading league data...</p>}

      {league && (
        <div className="league-info">
          <h2>{league.name}</h2>
          <p>Season: {league.season}</p>
          <p>Status: {league.status}</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="teams-grid">
          {users.map((user) => (
            <Link
              to={`/team/${user.user_id}`}
              key={user.user_id}
              className="team-card"
            >
              <img
                src={
                  user.avatar
                    ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
                    : "https://via.placeholder.com/50?text=No+Avatar"
                }
                alt="team avatar"
                className="avatar"
              />
              <p>{user.metadata?.team_name || user.display_name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamRoster() {
  const { userId } = useParams();
  const [roster, setRoster] = useState(null);
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoster() {
      try {
        // Fetch rosters for the league
        const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`);
        const rostersData = await rostersRes.json();

        // Find roster owned by this userId
        const userRoster = rostersData.find((r) => r.owner_id === userId);
        setRoster(userRoster);

        if (!userRoster) {
          setPlayers([]);
          setLoading(false);
          return;
        }

        // Fetch player details for roster players
        // userRoster.players is an array of player IDs
        if (userRoster.players.length > 0) {
          const playersRes = await fetch("/api/players");   
          const playersData = await playersRes.json();

          // Map player IDs to player info
          const rosterPlayers = userRoster.players.map((playerId) => playersData[playerId]);
          setPlayers(rosterPlayers);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error("Error fetching roster data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoster();
  }, [userId]);

  if (loading) return <p>Loading roster...</p>;
  if (!roster) return <p>Roster not found for this team.</p>;

  return (
    <div className="app">
      <h1>Roster for Team: {roster.metadata?.team_name || "Unnamed Team"}</h1>
      <p>
        <a href="/" style={{ textDecoration: "underline", color: "blue" }}>
          ← Back to League
        </a>
      </p>

      {players && players.length > 0 ? (
        <ul className="player-list">
          {players.map((player) =>
            player ? (
              <li key={player.player_id} className="player-item">
                <strong>{player.full_name}</strong> - {player.position} - {player.team}
              </li>
            ) : (
              <li key={Math.random()}>Unknown player</li>
            )
          )}
        </ul>
      ) : (
        <p>This team has no players.</p>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeagueHome />} />
      <Route path="/team/:userId" element={<TeamRoster />} />
    </Routes>
  );
}

export default App;
