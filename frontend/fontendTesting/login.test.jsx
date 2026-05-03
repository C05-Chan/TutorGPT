import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import Login from "../pages/Login.jsx"

test("renders login form", () => {
    render(<Login setPage={vi.fn()} />)
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
})

test("shows error when fields are empty", async () => {
    render(<Login setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Login" }))
    expect(await screen.findByText("Please fill all fields.")).toBeInTheDocument()
})

test("navigates to signup page", () => {
    const setPage = vi.fn()
    render(<Login setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(setPage).toHaveBeenCalledWith("signup")
})

test("navigates to reset password page", () => {
    const setPage = vi.fn()
    render(<Login setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(setPage).toHaveBeenCalledWith("resetpwd")
})