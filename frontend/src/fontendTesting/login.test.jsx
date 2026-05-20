import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import Login from "../pages/Login.jsx"

test("renders login form", () => {
    // this tests that the Login component renders
    // and displays its heading correctly

    render(<Login setPage={vi.fn()} />)
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()// this checks that there is a heading with the text "Login" in the DOM
})

test("shows error when fields are empty", async () => {
    // this tests submitting empty fields
    // makes sure all fields have input

    render(<Login setPage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Login" })) // this simulates a click on the Login button without filling in any fields
    
    // this checks that after clicking the Login button with empty fields, an error message "Please fill all fields." appears in the DOM
    expect(await screen.findByText("Please fill all fields.")).toBeInTheDocument() 
})

test("navigates to signup page", () => {
    // this tests the Sign Up button
    // calls setPage with the correct route key

    const setPage = vi.fn()
    render(<Login setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
    expect(setPage).toHaveBeenCalledWith("signup") // this checks that setPage was called with "signup" when the Sign Up button is clicked
})

test("navigates to reset password page", () => {
    // this tests the Reset Password button
    // calls setPage with the correct route key
    
    const setPage = vi.fn()
    render(<Login setPage={setPage} />)
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }))
    expect(setPage).toHaveBeenCalledWith("resetpwd") // this checks that setPage was called with "resetpwd" when the Reset Password button is clicked
})