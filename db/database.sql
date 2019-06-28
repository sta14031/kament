CREATE TABLE Users
(
    Id SERIAL,
    Username VARCHAR(64),
    Password VARCHAR(64),

    PRIMARY KEY (Id)
);

INSERT INTO Users (Username) VALUES ('Tyler');