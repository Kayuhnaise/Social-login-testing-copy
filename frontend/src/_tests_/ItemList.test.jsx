import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ItemList from "../components/ItemList";

describe("ItemList", () => {
  const items = [
    { id: 1, label: "cat", value: "3" },
    { id: 2, label: "dog", value: "5" },
  ];

  test("renders items with labels and values", () => {
    render(<ItemList items={items} onDelete={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByText(/cat/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/dog/i)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  test("delete button triggers onDelete with correct id", () => {
    const onDelete = jest.fn();

    render(<ItemList items={items} onDelete={onDelete} onEdit={jest.fn()} />);

    fireEvent.click(screen.getAllByText(/delete/i)[0]);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("edit button triggers onEdit with the item object", () => {
    const onEdit = jest.fn();

    render(<ItemList items={items} onDelete={jest.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getAllByText(/edit/i)[0]);

    expect(onEdit).toHaveBeenCalledWith(items[0]);
  });
});
