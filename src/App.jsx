import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    setLoading(true);
    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
      const userData = await userRes.json();

      const leaguesRes = await fetch(
        `https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2024`
      );
      const leaguesData = await leaguesRes.json();
      setLeagues(leaguesData);
    } catch (err) {
      console.error("Failed to load user data", err);
      alert("Check username or network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Sleeper Fantasy Dashboard</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Sleeper username"
      />
      <button onClick={loadUser}>Load Leagues</button>

      {loading && <p>Loading...</p>}
      {leagues.length > 0 && (
        <div>
          <h2>Leagues:</h2>
          {leagues.map((league) => (
            <div key={league.league_id} className="league-card">
              <h3>{league.name}</h3>
              <p>League ID: {league.league_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
