import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import Signup from "../pages/Signup.jsx"

vi.mock("../utility.jsx", () => ({
    // this mocks the utility module so that localStorageSettingsLoader
    // and getUserInfo do not make real calls during tests

    localStorageSettingsLoader: vi.fn(), // this is a mock function
    getUserInfo: vi.fn(),
}))

function fillForm({ username = "", email = "", password = "", confirm = "" }) {
    // this is a helper that fills in whichever signup form fields are provided
    // and skips any that are left empty

    if (username) fireEvent.change(screen.getByLabelText("Username:"), { target: { value: username } })
    if (email) fireEvent.change(screen.getByLabelText("Email:"), { target: { value: email } })
    if (password) fireEvent.change(screen.getByLabelText("Password:"), { target: { value: password } })
    if (confirm) fireEvent.change(screen.getByLabelText("Confirm Password:"), { target: { value: confirm } })
}

test("shows error when fields are empty", async () => {
    // this tests submitting an empty form
    // makes sure all fields have input

    render(<Signup setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("All fields are required.")).toBeInTheDocument()
})

test("shows error when username is too short", async () => {
    // this tests submitting a username under 3 characters
    // makes sure username is not too short

    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "ab", email: "test@test.com", password: "password123", confirm: "password123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("Username must be at 3 - 20 characters long.")).toBeInTheDocument()
})

test("shows error when email has no @", async () => {
    // this tests submitting an email without an @ symbol
    // makes sure email is valid

    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "test user", email: "testtest.com", password: "password123", confirm: "password123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText(/must include @ symbol/)).toBeInTheDocument()
})

test("shows error when passwords do not match", async () => {
    // this tests submitting mismatched passwords
    // makes sure passwords match

    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "test user", email: "test@test.com", password: "password123", confirm: "different123" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument()
})

test("shows error when password is too short", async () => {
    // this tests submitting a password under 8 characters
    // makes sure password is not too short

    render(<Signup setPage={vi.fn()} />)
    fillForm({ username: "test user", email: "test@test.com", password: "short", confirm: "short" })
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeInTheDocument()
})

test("navigates to login page", () => {
    // this tests the Login button 
    // calls setPage with the correct route key

    const setPage = vi.fn()
    render(<Signup setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Login" }))
    expect(setPage).toHaveBeenCalledWith("login")
})