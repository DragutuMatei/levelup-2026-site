import React, { useEffect, useRef, useState } from "react";
import api from "../Utils/api";
import "./minigame.scss";

const TEXT_WIDTH = 100;
const TEXT_HEIGHT = 30;
const SQUARE_PADDING = 6;

function getRandomPosition(existingRects) {
  const maxAttempts = 1000;
  const width = TEXT_WIDTH + SQUARE_PADDING * 2;
  const height = TEXT_HEIGHT + SQUARE_PADDING * 2;
  const NAVBAR_HEIGHT = 100;
  const FOOTER_HEIGHT = 100;
  const HUD_WIDTH = 250;
  const HUD_HEIGHT_FROM_MNT = 150;

  for (let i = 0; i < maxAttempts; i++) {
    const minY = NAVBAR_HEIGHT;
    const maxY = window.innerHeight - FOOTER_HEIGHT - height;

    if (maxY <= minY) return null;

    const x = Math.floor(Math.random() * (window.innerWidth - width));
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    if (x < HUD_WIDTH && y < NAVBAR_HEIGHT + HUD_HEIGHT_FROM_MNT) {
      continue;
    }

    const newRect = { x, y, width: TEXT_WIDTH, height: TEXT_HEIGHT };

    const overlaps = existingRects.some((rect) => {
      return !(
        x + width < rect.x ||
        x > rect.x + rect.width + SQUARE_PADDING * 2 ||
        y + height < rect.y ||
        y > rect.y + rect.height + SQUARE_PADDING * 2
      );
    });

    if (!overlaps) return newRect;
  }

  return null;
}

export default function MiniGame() {
  const [gameState, setGameState] = useState("leaderboard");  
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null);

  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const timerIntervalRef = useRef(null);

  const startGame = async () => {
    if (!config) return;
    if (!playerName.trim()) {
      alert("Te rugam sa introduci un nume!");
      return;
    }
    try {
      // Request a server-side session token (anti-cheat: server tracks start time)
      const res = await api.post("/leaderboard/start");
      if (res.data.status === "success") {
        setShowNamePopup(false);
        setGameState("playing");
        initializeBoard();
      }
    } catch (err) {
      console.error("Failed to start game session", err);
      alert("Eroare la pornirea jocului. Incearca din nou.");
    }
  };

  const initializeBoard = () => {
    if (!config) return;
    const NUM_ITEMS = config.NUM_ITEMS || 30;
    const TIMER = config.TIMER_SECONDS || 180;

    const rects = [];
    const newItems = [];

    for (let i = 0; i < NUM_ITEMS; i++) {
      const pos = getRandomPosition(rects);
      if (pos) {
        rects.push(pos);
        newItems.push({
          id: i,
          text: `Link ${i + 1}`,
          text_x: pos.x,
          text_y: pos.y,
          x: pos.x,
          y: pos.y,
        });
      }
    }

    setItems(newItems);
    setSelected([]);
    setTimeLeft(TIMER);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          alert("A expirat timpul!");
          setGameState("leaderboard");
          return TIMER;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchLeaderboardAndConfig = async () => {
    try {
      const [ldbRes, cfgRes] = await Promise.all([
        api.get("/leaderboard"),
        api.get("/leaderboard/config")
      ]);
      if (ldbRes.data.status === "success") {
        setLeaderboard(ldbRes.data.data);
      }
      if (cfgRes.data.status === "success") {
        setConfig(cfgRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchLeaderboardAndConfig();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Anti-cheat protections
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Daca iesi din pagina vei pierde progresul curent!";
      return e.returnValue;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "j" || e.key.toLowerCase() === "c")) ||
        (e.ctrlKey && e.key.toLowerCase() === "u")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState]);

  const saveScoreAndFinish = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsSubmitting(true);
    setGameState("leaderboard");
    
    try {
      await api.post("/leaderboard", {
        name: playerName,
      });
    } catch (err) {
      console.error("Failed to save score", err);
    }
    
    setIsSubmitting(false);
    fetchLeaderboardAndConfig();
  };

  const onMouseDown = (e, id) => {
    dragRef.current = id;
    const item = items.find((i) => i.id === id);
    offset.current = {
      x: e.clientX - item.x,
      y: e.clientY - item.y,
    };
  };

  const onMouseMove = (e) => {
    if (dragRef.current === null) return;

    let newX = e.clientX - offset.current.x;
    let newY = e.clientY - offset.current.y;

    const w = TEXT_WIDTH + SQUARE_PADDING * 2;
    const h = TEXT_HEIGHT + SQUARE_PADDING * 2;
    const NAVBAR_HEIGHT = 100;
    const FOOTER_HEIGHT = 100;
    const HUD_WIDTH = 250;
    const HUD_HEIGHT_FROM_MNT = 150;

    newX = Math.max(0, Math.min(newX, window.innerWidth - w));
    newY = Math.max(NAVBAR_HEIGHT, Math.min(newY, window.innerHeight - FOOTER_HEIGHT - h));

    if (newX < HUD_WIDTH && newY < NAVBAR_HEIGHT + HUD_HEIGHT_FROM_MNT) {
      return; 
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === dragRef.current
          ? {
              ...item,
              x: newX,
              y: newY,
            }
          : item
      )
    );
  };

  const onMouseUp = () => {
    dragRef.current = null;
  };

  const handleTextClick = async (e, id) => {
    // Anti-cheat: prevent automated element.click() from JS console scripts
    if (!e.isTrusted) return;

    // Anti-cheat: prevent CSS bots that hide the square `display: none` without dragging
    const item = items.find(i => i.id === id);
    if (!item) return;
    const hasMoved = Math.abs(item.x - item.text_x) > 20 || Math.abs(item.y - item.text_y) > 20;
    if (!hasMoved) return;

    // Only allow clicking the next item in order (no deselect — server tracks order)
    if (id !== selected.length) return;
    if (selected.includes(id)) return;

    try {
      // Validate click with server
      const res = await api.post("/leaderboard/click", {
        itemId: id,
      });

      if (res.data.status === "success") {
        const newSelected = [...selected, id];
        setSelected(newSelected);

        if (res.data.completed) {
          saveScoreAndFinish();
        }
      }
    } catch (err) {
      console.error("Click validation failed", err.response?.data || err.message);
    }
  };

  const handleReset = async () => {
    const pwd = prompt("Introdu parola pentru resetare:");
    if (!pwd) return;
    try {
      const res = await api.post("/leaderboard/reset", { password: pwd });
      if (res.data.status === "success") {
        alert("Leaderboard resetat cu succes!");
        fetchLeaderboardAndConfig();
      }
    } catch (err) {
      alert("Eroare la resetare: " + (err.response?.data?.message || err.message));
    }
  };

  if (gameState === "leaderboard") {
    return (
      <div className="minigame-page">
        <div className="centered-box leaderboard-box" style={{ position: "relative" }}>
          <h1 className="glitch-text">CLASAMENT</h1>
          
          <div style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "#bbb", textAlign: "left", background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px", border: "1px dashed #9DD6FF" }}>
            <h3 style={{ color: "#9DD6FF", marginBottom: "8px", fontSize: "1rem", textTransform: "uppercase" }}>Cum se joaca?</h3>
            <ul style={{ paddingLeft: "20px", margin: 0, lineHeight: "1.4" }}> 
              <li style={{ marginBottom: "5px" }}>Gaseste link-urile ascunse si apasa pe ele <strong>in ordine</strong>, de la 1 la {config?.NUM_ITEMS || 30}.</li>
              <li>Ai la dispozitie <strong>{config?.TIMER_SECONDS || 180} de secunde</strong> pentru a intra in clasament!</li>
            </ul>
          </div>

          {isSubmitting ? (
            <p>Se salveaza scorul...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loc</th>
                    <th>Nume</th>
                    <th>Timp (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        Nu exista scoruri inca.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, idx) => (
                      <tr key={entry.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{entry.name}</td>
                        <td>{entry.time}s</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="primary-btn"
              onClick={() => setShowNamePopup(true)}
            >
              PLAY
            </button>
            <button
              className="secondary-btn"
              onClick={handleReset}
            >
              RESETEAZA LEADERBOARD
            </button>
          </div>

          {showNamePopup && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(12, 11, 19, 0.95)", display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", borderRadius: "8px", zIndex: 100
            }}>
              <h2 style={{ color: "#9DD6FF", marginBottom: "1rem" }}>Introdu Numele</h2>
              <div className="input-group" style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="Numele tau"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && startGame()}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="primary-btn" onClick={startGame}>START</button>
                <button className="secondary-btn" onClick={() => setShowNamePopup(false)}>ANULEAZA</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="minigame-play-area"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0449AA",
      }}
    >
      <div className="game-hud">
        <div className="time-display">Timp ramas: {timeLeft}s</div>
        <div className="progress-display">Progres: {selected.length} / {config?.NUM_ITEMS || 30}</div>
      </div>

      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <React.Fragment key={item.id}>
            <div
              onClick={(e) => handleTextClick(e, item.id)}
              style={{
                position: "absolute",
                left: item.text_x + SQUARE_PADDING,
                top: item.text_y + SQUARE_PADDING + 5,
                width: TEXT_WIDTH,
                height: TEXT_HEIGHT,
                textAlign: "center",
                fontSize: "14px",
                color: isSelected ? "#0f0" : "white",
                backgroundColor: isSelected ? "#093" : "transparent",
                border: isSelected ? "1px solid #0f0" : "none",
                borderRadius: "4px",
                lineHeight: `${TEXT_HEIGHT}px`,
                zIndex: 1,
                cursor: "pointer",
              }}
            >
              {/* Anti-cheat: text remains hidden until the square is genuinely dragged away */}
              {(Math.abs(item.x - item.text_x) > 20 || Math.abs(item.y - item.text_y) > 20) ? item.text : "?"}
            </div>

            <div
              onMouseDown={(e) => onMouseDown(e, item.id)}
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: TEXT_WIDTH + SQUARE_PADDING * 2,
                height: TEXT_HEIGHT + SQUARE_PADDING * 2,
                background: "rgba(20, 73, 171, 1)",   
                cursor: "grab",
                borderRadius: 4,
                zIndex: 10,
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
