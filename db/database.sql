CREATE TABLE Users
(
    Id SERIAL,
    Username VARCHAR(64),
    Password VARCHAR(64),

    PRIMARY KEY (Id)
);

CREATE TABLE Posts
(
    Id SERIAL,
    Poster INT,
    Title VARCHAR(32),
    Content TEXT,
    IsLink BOOLEAN,

    PRIMARY KEY (Id),
    FOREIGN KEY (Poster) REFERENCES Users(Id)
);

CREATE TABLE Comments
(
    Id SERIAL,
    Post INT,
    Poster INT,
    Content TEXT,

    PRIMARY KEY (Id),
    FOREIGN KEY (Poster) REFERENCES Users(Id),
    FOREIGN KEY (Post) REFERENCES Posts(Id)
);

CREATE TABLE Ratings
(
    Id SERIAL,
    Post INT,
    Val INT,

    PRIMARY KEY (Id),
    FOREIGN KEY (Post) REFERENCES Posts(Id)
);

INSERT INTO Users (Username) VALUES ('Tyler');

INSERT INTO Posts
    (Poster, Title, Content, IsLink)
VALUES
    (2, 'My test post',
    'This is my awesome text post. It''s great!', FALSE);

INSERT INTO Posts
    (Poster, Title, Content, IsLink)
VALUES
    (2, 'My awesome link post',
    'google.com/', TRUE);