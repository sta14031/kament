CREATE TABLE Users
(
    UserId SERIAL,
    Username VARCHAR(64),
    Password VARCHAR(64),

    PRIMARY KEY (Id)
);

CREATE TABLE Posts
(
    PostId SERIAL,
    Poster INT,
    Title VARCHAR(32),
    Body TEXT,
    IsLink BOOLEAN,

    PRIMARY KEY (Id),
    FOREIGN KEY (Poster) REFERENCES Users(Id)
);

CREATE TABLE Comments
(
    CommentId SERIAL,
    Post INT,
    Poster INT,
    Content TEXT,

    PRIMARY KEY (Id),
    FOREIGN KEY (Poster) REFERENCES Users(Id),
    FOREIGN KEY (Post) REFERENCES Posts(Id)
);

CREATE TABLE Ratings
(
    RatingId SERIAL,
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

SELECT p.Poster, p.Title, p.Content, (SELECT COUNT(*) AS CommentCount FROM (SELECT * FROM Comments c LEFT JOIN Posts p ON c.Post = p.Id) cn WHERE cn.Post = p.Id) FROM Posts p;

ALTER TABLE Users
RENAME COLUMN Id TO UserId;

ALTER TABLE Posts
RENAME COLUMN Id TO PostId;
ALTER TABLE Posts
RENAME COLUMN Content TO Body;

ALTER TABLE Comments
RENAME COLUMN Id TO CommentId;

ALTER TABLE Ratings
RENAME COLUMN Id TO RatingId;

SELECT CASE WHEN (SELECT COUNT(*) FROM 
  (SELECT * FROM Comments c WHERE c.Post = 2)
AS cn) = 0
THEN
0
ELSE
1
END;


SELECT Username, userid FROM Users WHERE UserId = 
(SELECT currval(pg_get_serial_sequence('Users','userid')) AS s);


SELECT setval('users_id_seq', 2, true); 