CREATE SEQUENCE users_id_seq;

CREATE TABLE users (
   id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
   username TEXT,
   password TEXT,
   logged BOOLEAN,
   last_activity TIMESTAMP WITH TIME ZONE
);

ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
ALTER SEQUENCE users_id_seq OWNED BY users.id;