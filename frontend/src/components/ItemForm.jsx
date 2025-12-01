import React, { useState, useEffect } from "react";

export default function ItemForm({ selected, onSave, onCancel }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (selected) {
      setLabel(selected.label);
      setValue(selected.value);
    }
  }, [selected]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ label, value });
    setLabel("");
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        value={label}
        placeholder="Label"
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        value={value}
        placeholder="Value"
        onChange={(e) => setValue(e.target.value)}
      />

      <button type="submit">{selected ? "Update" : "Add"}</button>

      {selected && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
