import { render, screen, fireEvent } from "@testing-library/react"
import { test, expect, beforeEach, vi } from "vitest"
import ChatPromptBar from "../components/ChatPromptBar.jsx"

beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn()
})

test("renders input and send button", () => {
    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    expect(screen.getByPlaceholderText("Enter your question or topic here...")).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument()
})

test("shows error when prompt is empty", async () => {
    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    fireEvent.click(screen.getByRole("button"))
    expect(await screen.findByText("Please enter a prompt.")).toBeInTheDocument()
})

test("shows error when prompt is over 100 characters", async () => {
    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    const input = screen.getByPlaceholderText("Enter your question or topic here...")
    fireEvent.change(input, { target: { value: "a".repeat(101) } })
    fireEvent.click(screen.getByRole("button"))
    expect(await screen.findByText("Prompt is too long. Please enter a prompt less than 100 characters.")).toBeInTheDocument()
})

test("shows timer error when submitting too quickly", async () => {
    localStorage.setItem("userID", "1")
    global.fetch.mockResolvedValue({
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
    render(<ChatPromptBar messages={[]} setMessage={vi.fn()} />)
    const input = screen.getByPlaceholderText("Enter your question or topic here...")
    fireEvent.change(input, { target: { value: "hello" } })
    expect(screen.getByText("5/100")).toBeInTheDocument()
})