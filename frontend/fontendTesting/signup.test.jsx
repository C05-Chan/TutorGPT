import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import Signup from "../pages/Signup.jsx"

vi.mock("../utility.jsx", () => ({
    localStorageSettingsLoader: vi.fn(),
    getUserInfo: vi.fn(),
}))

function fillForm({ username = "", email = "", password = "", confirm = "" }) {
    if (username) fireEvent.change(screen.getByLabelText("Username:"), { target: { value: username } })
    if (email) fireEvent.change(screen.getByLabelText("Email:"), { target: { value: email } })
    if (password) fireEvent.change(screen.getByLabelText("Password:"), { target: { value: password } })
    if (confirm) fireEvent.change(screen.getByLabelText("Confirm Password:"), { target: { value: confirm } })
}

test("shows error when fields are empty", async () => {
    render(<Signup setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("All fields are required.")).toBeInTheDocument()
})

test("shows error when username is too short", async () => {
    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "ab", email: "test@test.com", password: "password123", confirm: "password123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("Username must be at 3 - 20 characters long.")).toBeInTheDocument()
})

test("shows error when email has no @", async () => {
    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "crystal", email: "testtest.com", password: "password123", confirm: "password123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText(/must include @ symbol/)).toBeInTheDocument()
})

test("shows error when passwords do not match", async () => {
    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "crystal", email: "test@test.com", password: "password123", confirm: "different123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument()
})

test("shows error when password is too short", async () => {
    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "crystal", email: "test@test.com", password: "short", confirm: "short" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeInTheDocument()
})

test("navigates to login page", () => {
    const setPage = vi.fn()
    render(<Signup setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Login" }))
    expect(setPage).toHaveBeenCalledWith("login")
})