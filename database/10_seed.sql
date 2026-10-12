INSERT INTO users(email, first_name, last_name, password_hash, role, is_blocked)
VALUES (
    'user1@test.com', 'Jan', 'Kowalski',
    '$2a$12$qm.dsnXqcMWnN86VdtE6ReGjbLZfMl6J2am8DvZBW39J6DILd4OiO',
    'USER', false
);

INSERT INTO users(email, first_name, last_name, password_hash, role, is_blocked)
VALUES (
   'user2@test.com', 'Anna', 'Nowak',
   '$2a$12$qm.dsnXqcMWnN86VdtE6ReGjbLZfMl6J2am8DvZBW39J6DILd4OiO',
   'USER', false
);
