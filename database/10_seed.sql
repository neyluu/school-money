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

INSERT INTO wallets(user_id, fundraising_id, iban, balance)
VALUES (
    1,
    null,
    'PL85638476658329025370465785',
    265.31
);

INSERT INTO wallets(user_id, fundraising_id, iban, balance)
VALUES (
   2,
   null,
   'PL68940753927490312749032174',
   75.00
);

INSERT INTO classes(owner_id, name, school, city, access_code)
VALUES (1, '3B', 'Szkoła Podstawowa nr 1', 'Warszawa', 'ABCD2345');

INSERT INTO children(parent_id, first_name, last_name, birth_date)
VALUES (1, 'Piotr', 'Kowalski', '2017-03-12');

INSERT INTO children(parent_id, first_name, last_name, birth_date)
VALUES (2, 'Zofia', 'Nowak', '2017-09-24');

INSERT INTO class_memberships(class_id, child_id, status, decided_at)
VALUES (1, 1, 'ACCEPTED', now());

INSERT INTO class_memberships(class_id, child_id, status, decided_at)
VALUES (1, 2, 'ACCEPTED', now());

INSERT INTO fundraisings(class_id, name, description, start_at, end_at, amount_per_child)
VALUES (
    1,
    'Wyjście do teatru',
    'Bilety na spektakl Pinokio',
    now() - interval '1 day',
    now() + interval '1 year',
    100.00
);

INSERT INTO wallets(user_id, fundraising_id, iban, balance)
VALUES (
    null,
    1,
    'PL12345678901234567890123456',
    0
);
