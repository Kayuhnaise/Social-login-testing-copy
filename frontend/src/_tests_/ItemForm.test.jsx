// frontend/src/__tests__/ItemForm.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ItemForm from "../components/ItemForm";

describe("ItemForm", () => {
  test("renders empty form with Add button when not editing", () => {
    const onSave = jest.fn();

    render(<ItemForm onSave={onSave} />);

    const labelInput = screen.getByPlaceholderText(/label/i);
    const valueInput = screen.getByPlaceholderText(/value/i);

    expect(labelInput).toBeInTheDocument();
    expect(valueInput).toBeInTheDocument();
    expect(screen.getByText(/add/i)).toBeInTheDocument();
    // No Cancel button in create mode
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
  });

  test("submitting form calls onSave with label and value and clears inputs", () => {
    const onSave = jest.fn();

    render(<ItemForm onSave={onSave} />);

    const labelInput = screen.getByPlaceholderText(/label/i);
    const valueInput = screen.getByPlaceholderText(/value/i);
    const submitButton = screen.getByText(/add/i);

    fireEvent.change(labelInput, { target: { value: "cat" } });
    fireEvent.change(valueInput, { target: { value: "3" } });

    fireEvent.click(submitButton);

    expect(onSave).toHaveBeenCalledWith({ label: "cat", value: "3" });
    // After submit, the form should clear
    expect(labelInput.value).toBe("");
    expect(valueInput.value).toBe("");
  });

  test("when selected is provided, form is prefilled and shows Update + Cancel", () => {
    const selected = { id: 1, label: "dog", value: "5" };
    const onSave = jest.fn();
    const onCancel = jest.fn();

    render(
      <ItemForm selected={selected} onSave={onSave} onCancel={onCancel} />
    );

    const labelInput = screen.getByPlaceholderText(/label/i);
    const valueInput = screen.getByPlaceholderText(/value/i);

    // Pre-filled values
    expect(labelInput.value).toBe("dog");
    expect(valueInput.value).toBe("5");

    // Button text changes to Update
    expect(screen.getByText(/update/i)).toBeInTheDocument();
    // Cancel button is visible
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  test("clicking Cancel in edit mode calls onCancel", () => {
    const selected = { id: 2, label: "bird", value: "2" };
    const onSave = jest.fn();
    const onCancel = jest.fn();

    render(
      <ItemForm selected={selected} onSave={onSave} onCancel={onCancel} />
    );

    fireEvent.click(screen.getByText(/cancel/i));
    expect(onCancel).toHaveBeenCalled();
  });

  test("submitting in edit mode calls onSave with updated values", () => {
    const selected = { id: 3, label: "fish", value: "1" };
    const onSave = jest.fn();

    render(
      <ItemForm selected={selected} onSave={onSave} onCancel={jest.fn()} />
    );

    const labelInput = screen.getByPlaceholderText(/label/i);
    const valueInput = screen.getByPlaceholderText(/value/i);
    const updateButton = screen.getByText(/update/i);

    // Change values
    fireEvent.change(labelInput, { target: { value: "fish updated" } });
    fireEvent.change(valueInput, { target: { value: "10" } });

    fireEvent.click(updateButton);

    expect(onSave).toHaveBeenCalledWith({
      label: "fish updated",
      value: "10",
    });
  });
});
