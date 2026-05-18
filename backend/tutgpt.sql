
-- Local SQLite3 Database
-- 'CREATE TABLE IF NOT EXISTS' is used so there is no duplicated or missing tables
-- 'ON DELETE CASCADE' is used when a user deletes their account or chat messages

CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createDate TEXT DEFAULT (DATETIME('now')),
    deleteDate TEXT
);

CREATE TABLE IF NOT EXISTS accountSettings (
    accountSettingsID INTEGER PRIMARY KEY,
    userID INTEGER NOT NULL UNIQUE,
    responseLength TEXT NOT NULL DEFAULT 'Medium',
    displayMode TEXT NOT NULL DEFAULT 'Light',
    displayTextSize TEXT NOT NULL DEFAULT 'Medium',
    displayFontStyle TEXT NOT NULL DEFAULT 'Arial',

    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tempChats (
    tempChatSessionID INTEGER PRIMARY KEY,
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

    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    messageID INTEGER PRIMARY KEY,
    chatSessionID INTEGER,
    tempChatSessionID INTEGER,
    sender TEXT NOT NULL,
    messageContent TEXT NOT NULL,
    messageConfidence TEXT,
    messageConfidenceReason TEXT,
    messageTime TEXT DEFAULT (DATETIME('now')),

    FOREIGN KEY (chatSessionID) REFERENCES chatSession(chatSessionID) ON DELETE CASCADE,
    FOREIGN KEY (tempChatSessionID) REFERENCES tempChats(tempChatSessionID) ON DELETE CASCADE,

    CHECK(sender IN ('User', 'TutorGPT')), 

    -- This check is to ensure that either chatSessionID has a variable OR tempChatSessionID but not both at the same time.
    CHECK((chatSessionID IS NOT NULL AND tempChatSessionID IS NULL) OR (chatSessionID IS NULL AND tempChatSessionID IS NOT NULL)),

    -- This check is to ensure that if it is a response from 'TutorGPT', it must have a messageConfidence
    CHECK(sender = 'User' OR (sender = 'TutorGPT' AND messageConfidence IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS uploadedDocuments (
    documentID INTEGER PRIMARY KEY,
    chatSessionID INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    fileType TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    uploadTime TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (chatSessionID) REFERENCES chatSession(chatSessionID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citations (
    citationID INTEGER PRIMARY KEY,
    documentID INTEGER UNIQUE,
    citationSource TEXT NOT NULL,
    citationName TEXT NOT NULL,
    citationText TEXT NOT NULL,
    citationURL TEXT NOT NULL,

    FOREIGN KEY (documentID) REFERENCES uploadedDocuments(documentID) ON DELETE CASCADE,

    CHECK(citationSource IN ('Uploaded Document', 'External Source')),

    -- This check is to ensure uploaded document citations are referencing to a documentID otherwise, its NULL.
    CHECK (citationSource != 'Uploaded Document' OR documentID IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS messageCitations (
    messageID INTEGER NOT NULL,
    citationID INTEGER NOT NULL,

    PRIMARY KEY (messageID, citationID),
    FOREIGN KEY (messageID) REFERENCES messages(messageID) ON DELETE CASCADE,
    FOREIGN KEY (citationID) REFERENCES citations(citationID) ON DELETE CASCADE
);

-- INSERTS TO CREATE DEFAULT USERS, SETTINGS AND AN EXAMPLE CHAT
INSERT OR IGNORE INTO users (username, email, password) VALUES 
('Test User', 'testuser@fakemail.com', '$2b$12$sdlVsjPPhgXU5GjFrzCx4OWe6xx5TYoIa9UbxrF93lM82g2.QhxwC'); -- password: password123

INSERT OR IGNORE INTO accountSettings (userID, responseLength, displayMode, displayTextSize, displayFontStyle) VALUES 
(1, 'Medium', 'Light', 'Medium', 'Arial');

INSERT OR IGNORE INTO chatSession (userID, chatTitle, chatSubject, chatExplanationLevel) VALUES 
(1, 'Sample Advanced Mathematics Chat', 'Mathematics', 'Advanced');

INSERT OR IGNORE INTO messages (chatSessionID, sender, messageContent, messageConfidence, messageConfidenceReason) VALUES 
(1, 'User', 'This is the first example prompt!', NULL, NULL),
(1, 'TutorGPT', 'This is the first example response with a low confidence!', '3', 'Just cause it is.' ),
(1, 'User', 'This is the second example prompt!', NULL, NULL),
(1, 'TutorGPT', 'This is the first example response with a high confidence!', '10', NULL);
