import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, beforeEach, vi } from "vitest"
import ChatPromptBar from "../components/ChatPromptBar.jsx"

beforeEach(() => {
    // this clears localStorage and creates a mock function before each test
    // makes a clean and isolated state

    localStorage.clear() // this clears the mock localStorage before each test to ensure tests do not interfere with each other
    global.fetch = vi.fn() // this mocks the global fetch function so that real network requests are not made during tests
})

test("renders input and send button", () => {
    // this tests the text input
    // and send button are present on render

    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    expect(screen.getByPlaceholderText("Enter your question or topic here...")).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument() // this checks that there is a button in the DOM, which is the send button
})

test("shows error when prompt is empty", async () => {
    // this tests submitting an empty input
    // makes sure the prompt field has input

    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button"))
    expect(await screen.findByText("Please enter a prompt.")).toBeInTheDocument() // this checks that an error message "Please enter a prompt." appears in the DOM when the send button is clicked with an empty input
})

test("shows error when prompt is over 100 characters", async () => {
    // this tests a prompt exceeding 100 characters
    // makes sure prompt is not over character limit

    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    const input = screen.getByPlaceholderText("Enter your question or topic here...")
    fireEvent.change(input, { target: { value: "a".repeat(101) } }) // this simulates typing a string of 101 'a' characters into the input field
    fireEvent.click(screen.getByRole("button"))
    // this checks that an error message about the prompt being too long appears in the DOM when the send button is clicked with a prompt over 100 characters
    expect(await screen.findByText("Prompt is too long. Please enter a prompt less than 100 characters.")).toBeInTheDocument() 
})

test("shows timer error when submitting too quickly", async () => {
    // this tests sending a second submission immediately after the first
    // shows cooldown timer

    localStorage.setItem("userID", "1")
    global.fetch.mockResolvedValue({ // this mocks the fetch response to always return a successful response for testing purposes

        // this simulates the JSON response from the server when a prompt is submitted, showing  success and providing a message and confidence score
        json: async () => ({ success: true, message: "response", confidence: "9", messageID: 1 }) 
            
    })

    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    const input = screen.getByPlaceholderText("Enter your question or topic here...")

    // First submission
    fireEvent.change(input, { target: { value: "What is recursion?" } })
    fireEvent.click(screen.getByRole("button"))

    // Second submission immediately after
    fireEvent.change(input, { target: { value: "What is a loop?" } })
    fireEvent.click(screen.getByRole("button"))

    expect(await screen.findByText(/Please wait/)).toBeInTheDocument()
})

test("shows character count", () => {
    // this tests the character counter
    // updates correctly as the user types
    
    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    const input = screen.getByPlaceholderText("Enter your question or topic here...")
    fireEvent.change(input, { target: { value: "hello" } })

    // this checks that the character count "5/100" appears in the DOM after typing "hello" into the input field, indicating that the character count updates correctly as the user types
    expect(screen.getByText("5/100")).toBeInTheDocument() 
})