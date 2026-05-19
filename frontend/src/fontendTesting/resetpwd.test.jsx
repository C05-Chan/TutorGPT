import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import ResetPassword from "../pages/ResetPwd.jsx"

test("shows error when fields are empty", async () => {
    // this tests submitting empty fields
    // makes sure all fields have input

    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText("Please fill in all fields.")).toBeInTheDocument()
})

test("shows error when passwords do not match", async () => {
    // this tests submitting mismatched passwords
    // makes sure the passwords match

    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "test@test.com" } })
    fireEvent.change(screen.getByLabelText("New Password:"), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText("Confirm New Password:"), { target: { value: "different123" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument()
})

test("shows error when password is too short", async () => {
    // this tests submitting password under 8 characters
    // makes sure the password is not too short
    
    render(<ResetPassword setPage={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "test@test.com" } })
    fireEvent.change(screen.getByLabelText("New Password:"), { target: { value: "short" } })
    fireEvent.change(screen.getByLabelText("Confirm New Password:"), { target: { value: "short" } })
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeInTheDocument()
})