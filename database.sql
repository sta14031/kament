CREATE TABLE Person
(
    Id SERIAL,
    FirstName VARCHAR(64),
    LastName VARCHAR(64),
    DateOfBirth DATE,

    PRIMARY KEY (Id)
);

CREATE TABLE Parentage
(
    Id SERIAL,
    Child INT,
    Mother INT,
    Father INT,

    FOREIGN KEY (Child)  REFERENCES Person(Id),
    FOREIGN KEY (Mother) REFERENCES Person(Id),
    FOREIGN KEY (Father) REFERENCES Person(Id)
);

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Tyler', 'Starr', 'Apr-05-1996');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('David', 'Starr', 'Sep-20-1969');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Rosalee Robinson', 'Starr', 'Jul-14-1974');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('George', 'Wieland', 'Apr-05-1992');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Michael', 'Wieland', 'Mar-14-1957');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Mary Helen', 'Wieland', 'Mar-14-1955');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Emily', 'Starr', 'Dec-30-1998');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Josie', 'Starr', 'Nov-01-2000');

INSERT INTO Person
    (FirstName, LastName, DateOfBirth)
VALUES
    ('Vladimir', 'Spotten', 'May-20-1994');

INSERT INTO Parentage
    (Father, Mother, Child)
VALUES
(
    (SELECT Id FROM Person WHERE FirstName LIKE 'David'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Rosalee%'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Tyler')
);

INSERT INTO Parentage
    (Father, Mother, Child)
VALUES
(
    (SELECT Id FROM Person WHERE FirstName LIKE 'Michael'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Mary%'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'George')
);

INSERT INTO Parentage
    (Father, Mother, Child)
VALUES
(
    (SELECT Id FROM Person WHERE FirstName LIKE 'David'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Rosalee%'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Emily')
);

INSERT INTO Parentage
    (Father, Mother, Child)
VALUES
(
    (SELECT Id FROM Person WHERE FirstName LIKE 'David'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Rosalee%'),
    (SELECT Id FROM Person WHERE FirstName LIKE 'Josie')
);