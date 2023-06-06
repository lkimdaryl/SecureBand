ALTER TABLE locations
DROP FOREIGN KEY locations_ibfk_1;
ALTER TABLE children
DROP FOREIGN KEY children_ibfk_1;
DROP TABLE locations;
DROP TABLE children; 
DROP TABLE users;
DROP TABLE sessions;