
CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    createDate TEXT DEFAULT (DATE('now')),
    deleteDate TEXT
);

CREATE TABLE IF NOT EXISTS accountSettings (
    accountSettingsID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL,
    responseLength TEXT NOT NULL DEFAULT 'Medium',
    displayMode TEXT NOT NULL DEFAULT 'Light',
    displayTextSize TEXT NOT NULL DEFAULT 'Medium',
    displayFontStyle TEXT NOT NULL DEFAULT 'Arial',

    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE IF NOT EXISTS tempChats (
    tempChatID INTEGER PRIMARY KEY,
    tempChatTitle TEXT NOT NULL,
    tempChatSubject TEXT NOT NULL,
    tempChatExplanationLevel TEXT NOT NULL,
    tempChatCreateDate TEXT DEFAULT (DATETIME('now'))
);


CREATE TABLE IF NOT EXISTS chatSession (
    chatSessionID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL,
    chatTitle TEXT NOT NULL,
    chatSubject TEXT NOT NULL,
    chatExplanationLevel TEXT NOT NULL,
    chatCreateDate TEXT DEFAULT (DATETIME('now')),

    FOREIGN KEY (userID) REFERENCES users(userID)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    messageID INTEGER PRIMARY KEY,
    chatSessionID INTEGER,
    tempChatID INTEGER,
    sender TEXT NOT NULL,
    messageContent TEXT NOT NULL,
    messageTime TEXT DEFAULT (DATETIME('now')),

    FOREIGN KEY (chatSessionID) REFERENCES chatSession(chatSessionID),
    FOREIGN KEY (tempChatID) REFERENCES tempChats(tempChatID),

    CHECK(sender IN ('User', 'TutorGPT')),
    CHECK((chatSessionID IS NOT NULL AND tempChatID IS NULL) OR (chatSessionID IS NULL AND tempChatID IS NOT NULL)
    )
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
    citationSource TEXT NOT NULL,
    citationName TEXT NOT NULL,
    citationText TEXT NOT NULL,
    citationURL TEXT NOT NULL,

    FOREIGN KEY (documentID) REFERENCES uploadedDocuments(documentID),

    CHECK (citationSource != 'Uploaded Document' OR documentID IS NOT NULL),
    CHECK(citationSource IN ('Uploaded Document', 'External Source')),
    UNIQUE (documentID, citationURL)
);

CREATE TABLE IF NOT EXISTS messageCitations (
    messageID INTEGER NOT NULL,
    citationID INTEGER NOT NULL,

    PRIMARY KEY (messageID, citationID),
    FOREIGN KEY (messageID) REFERENCES messages(messageID),
    FOREIGN KEY (citationID) REFERENCES citations(citationID)
);

INSERT OR IGNORE INTO users (username, email, password) VALUES ('Test User', 'testuser@example.com', 'password123');

INSERT OR IGNORE INTO accountSettings (userID, responseLength, displayMode, displayTextSize, displayFontStyle) VALUES (1, 'Medium', 'Light', 'Medium', 'Arial');

INSERT OR IGNORE INTO chatSession (userID, chatTitle, chatSubject, chatExplanationLevel) VALUES (1, 'Sample Chat', 'Mathematics', 'Advanced');

INSERT OR IGNORE INTO messages (chatSessionID, sender, messageContent) VALUES (1, 'User', 'This is user logged example messagge'),
(1, 'TutorGPT', 'This is system response to logged example message');
