
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Level20.scss";
import { getLevel, to, updateLevel } from "../../utils/stuff";
import { getHint, startLevel } from "../../utils/points";
import Poveste from "../../Pages/Poveste";

const NUM_ITEMS = 30;
const TEXT_WIDTH = 100;
const TEXT_HEIGHT = 30;
const SQUARE_PADDING = 6;
const TIMER_SECONDS = 180;

function getRandomPosition(existingRects) {
  const maxAttempts = 1000;
  const width = TEXT_WIDTH;
  const height = TEXT_HEIGHT;

  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(
      Math.random() * (window.innerWidth - width - SQUARE_PADDING * 2)
    );
    const y = Math.floor(
      Math.random() * (window.innerHeight - height - SQUARE_PADDING * 2)
    );
    const newRect = { x, y, width, height };

    const overlaps = existingRects.some((rect) => {
      return !(
        x + width + SQUARE_PADDING * 2 < rect.x ||
        x > rect.x + rect.width + SQUARE_PADDING * 2 ||
        y + height + SQUARE_PADDING * 2 < rect.y ||
        y > rect.y + rect.height + SQUARE_PADDING * 2
      );
    });

    if (!overlaps) return newRect;
  }

  return null;
}

export default function Level20({ uid, loading_comp }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();

  const initialize = () => {
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
    setTimeLeft(TIMER_SECONDS);
  };  
  useEffect(() => { 
    if (!loading_comp) { 
      startLevel(uid, getLevel()) ;
    }
  }, [,loading_comp]);


  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          alert("A expirat timpul!");
          initialize(); // reset la final
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    setItems((prev) =>
      prev.map((item) =>
        item.id === dragRef.current
          ? {
              ...item,
              x: e.clientX - offset.current.x,
              y: e.clientY - offset.current.y,
            }
          : item
      )
    );
  };

  const onMouseUp = () => {
    dragRef.current = null;
  };

  const handleTextClick = (id) => {
    const index = selected.indexOf(id);
    if (index >= 0) {
      // Deselectare
      setSelected(selected.filter((i) => i !== id));
    } else {
      // Selectare nouă doar dacă e următoarea corectă
      if (id === selected.length) {
        const newSelected = [...selected, id];
        setSelected(newSelected);
        if (newSelected.length === NUM_ITEMS) {
          setTimeout(() => {
             updateLevel(
                  newSelected.length,
                  uid,
                  getLevel() + 1,
                  "mediu"
                ).then((res) => {
                  if (res.data.ok) {
                    alert(res.data.message);
                    to(`/level${getLevel() + 1}`);
                  }
                });
          }, 200);
        }
      }
    }
  };
  const hint = async (uid, level) => {
    await getHint(uid, level).then((res) => {
      if (res.data.ok) {
        alert(res.data.hint);
      } else {
        alert(res.data.message);
      }
    });
  };

  return <div className="level" style={{background:"#222"}}>

  {!loading_comp ? (
    <div
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "#222",
      }}
    >
      <Poveste />
      <div className="cerinta hint" onClick={() => hint(uid, getLevel())}>
        <img
          src={require("../../assets/img/styling/hint.svg").default}
          alt=""
        />
      </div>

      {/* Timer sus stanga */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: "black",
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid white",
        }}
      >
        Time: {timeLeft}s
      </div>

      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <React.Fragment key={item.id}>
            {/* Textul vizibil sub pătrat */}
            <div
              onClick={() => handleTextClick(item.id)}
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
              {item.text}
              {isSelected && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(selected.filter((i) => i !== item.id));
                  }}
                  style={{
                    marginLeft: 8,
                    color: "red",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  X
                </span>
              )}
            </div>

            {/* Pătratul care acoperă textul */}
            <div
              onMouseDown={(e) => onMouseDown(e, item.id)}
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: TEXT_WIDTH + SQUARE_PADDING * 2,
                height: TEXT_HEIGHT + SQUARE_PADDING * 2,
                background: "rgba(34,34,34, 0.98)",
                // background: "red",
                cursor: "grab",
                borderRadius: 4,
                zIndex: 10,
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  ) : (
    <>Loading</>
  )}
  </div>
}
