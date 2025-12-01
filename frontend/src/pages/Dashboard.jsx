import React, { useEffect, useState } from "react";
import ItemForm from "../components/ItemForm";
import ItemList from "../components/ItemList";
import "./Dashboard.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  /* -----------------------------
     LOAD USER FROM BACKEND
  ------------------------------ */
  const loadUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  /* -----------------------------
     LOAD ITEMS
  ------------------------------ */
  const loadItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error loading items:", err);
    }
  };

  useEffect(() => {
    loadUser();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -----------------------------
     CRUD Operations
  ------------------------------ */
  const addItem = async (item) => {
    await fetch(`${API_BASE}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(item),
    });

    loadItems();
  };

  const updateItem = async (item) => {
    await fetch(`${API_BASE}/api/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(item),
    });

    setSelected(null);
    loadItems();
  };

  const deleteItem = async (id) => {
    await fetch(`${API_BASE}/api/items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    loadItems();
  };

  /* -----------------------------
     LOGOUT
  ------------------------------ */
  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, {
      method: "GET",
      credentials: "include",
    });

    window.location.href = "/login";
  };

  /* -----------------------------
     RENDER UI
  ------------------------------ */
  return (
    <div className="page">
      {/* -------- AVATAR HEADER -------- */}
      <div className="dash-header-avatar">
        <h1>Dashboard</h1>

        {user && (
          <div className="user-info">
            <img
              src={user.photo || "https://via.placeholder.com/80"}
              alt="avatar"
              className="avatar-img"
            />
            <span className="user-name">{user.displayName}</span>
          </div>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* ITEM FORM SECTION */}
      <div className="section item-form">
        <ItemForm
          selected={selected}
          onSave={selected ? updateItem : addItem}
          onCancel={() => setSelected(null)}
        />
      </div>

      {/* ITEM LIST SECTION */}
      <div className="section item-list">
        <ItemList
          items={items}
          onEdit={(item) => setSelected(item)}
          onDelete={deleteItem}
        />
      </div>
    </div>
  );
}


