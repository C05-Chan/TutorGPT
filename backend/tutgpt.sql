
CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    createDate TEXT DEFAULT (date('now')),
    deleteDate TEXT
);

CREATE TABLE IF NOT EXISTS accountSettings (
    settingsID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL,
    responseLength TEXT NOT NULL DEFAULT 'Medium' CHECK(responseLength IN ('Short', 'Medium', 'Long')),
    displayMode TEXT NOT NULL DEFAULT 'Light' CHECK(displayMode IN ('Light', 'Dark')),
    displayTextSize TEXT NOT NULL DEFAULT 'Medium' CHECK(displayTextSize IN ('Small', 'Medium', 'Large')),
    displayFontStyle TEXT NOT NULL DEFAULT 'Arial' CHECK(displayFontStyle IN ('Arial', 'Times New Roman', 'Courier New')),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE IF NOT EXISTS chatSession (
    chatSessionID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL,
    chatTitle TEXT NOT NULL DEFAULT 'New Chat',
    chatSubject TEXT,
    chatCreateDate TEXT DEFAULT (date('now')),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    messageID INTEGER PRIMARY KEY,
    chatSessionID INTEGER NOT NULL,

    sender TEXT NOT NULL CHECK(sender IN ('User', 'TutorGPT')),
    messageContent TEXT NOT NULL,
    messageTime TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (chatSessionID) REFERENCES chatSession(chatSessionID)
);

-- UPLOADED DOCUMENTS
CREATE TABLE IF NOT EXISTS uploadedDocuments (
    documentID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    fileType TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    uploadTime TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE IF NOT EXISTS citations (
    citationID INTEGER PRIMARY KEY,
    documentID INTEGER,

    citationSource TEXT NOT NULL CHECK(citationSource IN ('Uploaded Document', 'External Source')),

    citationName TEXT NOT NULL,
    citationText TEXT NOT NULL,
    citationURL TEXT NOT NULL,

    FOREIGN KEY (documentID) REFERENCES uploadedDocuments(documentID),

    CHECK (citationSource != 'Uploaded Document' OR documentID IS NOT NULL),

    UNIQUE (documentID, citationURL)
);

CREATE TABLE IF NOT EXISTS messageCitations (
    messageID INTEGER NOT NULL,
    citationID INTEGER NOT NULL,

    PRIMARY KEY (messageID, citationID),

    FOREIGN KEY (messageID) REFERENCES messages(messageID),
    FOREIGN KEY (citationID) REFERENCES citations(citationID)
);