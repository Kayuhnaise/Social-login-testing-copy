import React from "react";

export default function ItemList({ items, onDelete, onEdit }) {
  if (items.length === 0) {
    return <p>No items yet.</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} style={{ marginBottom: "10px" }}>
          <b>{item.label}:</b> {item.value}
          <button onClick={() => onEdit(item)}>Edit</button>
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
