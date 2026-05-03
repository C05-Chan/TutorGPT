import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import ResetPassword from "../pages/ResetPwd.jsx"

test("shows error when fields are empty", async () => {
    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText("Please fill in all fields.")).toBeInTheDocument()
})

test("shows error when passwords do not match", async () => {
    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "test@test.com" } })
    fireEvent.change(screen.getByLabelText("New Password:"), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText("Confirm New Password:"), { target: { value: "different123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument()
})

test("shows error when password is too short", async () => {
    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "test@test.com" } })
    fireEvent.change(screen.getByLabelText("New Password:"), { target: { value: "short" } })
    fireEvent.change(screen.getByLabelText("Confirm New Password:"), { target: { value: "short" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeInTheDocument()
})