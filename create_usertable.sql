CREATE DATABASE Test;
GO
USE Test;
GO
CREATE TABLE Users ( 
  UserID CHAR(5) PRIMARY KEY,
  FirstName VARCHAR(10) NOT NULL,
  LastName VARCHAR(10) NOT NULL,
  Telephone VARCHAR(20),
  email VARCHAR(256)
);
GO
INSERT INTO Users
    (UserID, FirstName, LastName, Telephone, email)
VALUES
    (1, 'example', 'user1', '080-xxxx-0001', 'example1@example.com'),
    (2, 'example', 'user2', '080-xxxx-0002', 'example2@example.com'),
    (3, 'example', 'user3', '' , 'example3@example.com'),
    (4, 'example', 'user4', '080-xxxx-0004', ''),
    (5, 'example', 'user5', '', '')
GO
