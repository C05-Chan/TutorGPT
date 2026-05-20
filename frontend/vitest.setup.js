// vitest.setup.js
import '@testing-library/jest-dom'

const localStorageMock = (() => { 
    // this is a simple mock for localStorage that stores data in a plain object

    let store = {} // this object will hold the dictionary pairs for localStorage
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { store = {} },
    }
})()

Object.defineProperty(global, 'localStorage', {
    //  this defines the global localStorage variable to use the mock implementation above
    value: localStorageMock, // this sets the value of global.localStorage to our mock
    writable: true, // this allows tests to modify localStorage if needed
})