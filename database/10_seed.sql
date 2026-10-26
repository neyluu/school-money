BEGIN;

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    password_hash,
    role,
    is_blocked
) VALUES
      (
          1,
          'j.kowalski@test.com',
          'Jan',
          'Kowalski',
          '$2y$10$9OXptFLOJxXcJLYm8jz06ePJ1icViVjS4VbKD4z08rE8qPNsNGfaq',
          'USER',
          false
      ),
      (
          2,
          'a.nowak@test.com',
          'Anna',
          'Nowak',
          '$2y$10$9OXptFLOJxXcJLYm8jz06ePJ1icViVjS4VbKD4z08rE8qPNsNGfaq',
          'USER',
          false
      ),
      (
          3,
          'p.wisniewski@test.com',
          'Piotr',
          'Wiśniewski',
          '$2y$10$9OXptFLOJxXcJLYm8jz06ePJ1icViVjS4VbKD4z08rE8qPNsNGfaq',
          'USER',
          false
      ),
      (
          4,
          'k.wojcik@test.com',
          'Karolina',
          'Wójcik',
          '$2y$10$9OXptFLOJxXcJLYm8jz06ePJ1icViVjS4VbKD4z08rE8qPNsNGfaq',
          'USER',
          false
      ),
      (
          5,
          'm.kaminskin@test.com',
          'Michał',
          'Kamiński',
          '$2y$10$9OXptFLOJxXcJLYm8jz06ePJ1icViVjS4VbKD4z08rE8qPNsNGfaq',
          'USER',
          false
      );


INSERT INTO children (
    id,
    parent_id,
    first_name,
    last_name,
    birth_date,
    avatar_file_id,
    active
) VALUES
      (1, 1, 'Antoni', 'Kowalski', '2017-04-12', NULL, true),
      (2, 1, 'Zofia', 'Kowalska', '2019-09-03', NULL, true),
      (3, 1, 'Maja', 'Kowalska', '2021-02-18', NULL, true),

      (4, 2, 'Jakub', 'Nowak', '2016-11-25', NULL, true),
      (5, 2, 'Lena', 'Nowak', '2019-06-14', NULL, true),

      (6, 3, 'Franciszek', 'Wiśniewski', '2018-03-21', NULL, true),

      (7, 4, 'Oliwia', 'Wójcik', '2017-08-30', NULL, true),
      (8, 4, 'Szymon', 'Wójcik', '2020-01-11', NULL, true),

      (9, 5, 'Laura', 'Kamińska', '2018-12-07', NULL, true),
      (10, 5, 'Kacper', 'Kamiński', '2020-05-19', NULL, true);


INSERT INTO classes (
    id,
    owner_id,
    name,
    school,
    city,
    access_code,
    logo_file_id,
    is_blocked
) VALUES
      (
          1,
          1,
          'Klasa 2A',
          'Szkoła Podstawowa nr 10',
          'Łódź',
          'K7P4X2QA',
          NULL,
          false
      ),
      (
          2,
          1,
          'Klasa 3B',
          'Szkoła Podstawowa nr 10',
          'Warszawa',
          'M8R5T1ZW',
          NULL,
          false
      ),
      (
          3,
          2,
          'Klasa 1C',
          'Szkoła Podstawowa nr 25',
          'Łódź',
          'N3V8Q6LK',
          NULL,
          false
      ),
      (
          4,
          3,
          'Klasa 4A',
          'Szkoła Podstawowa nr 34',
          'Pabianic',
          'B9H2F7XP',
          NULL,
          false
      );


INSERT INTO class_memberships (
    id,
    class_id,
    child_id,
    status,
    requested_at,
    decided_at
) VALUES
      (1, 1, 1, 'ACCEPTED', '2026-08-20 09:15:00', '2026-08-21 10:30:00'),
      (2, 1, 2, 'ACCEPTED', '2026-08-20 09:17:00', '2026-08-21 10:32:00'),
      (3, 1, 4, 'ACCEPTED', '2026-08-21 08:40:00', '2026-08-22 09:10:00'),
      (4, 1, 9, 'PENDING',  '2026-08-25 14:20:00', NULL),

      (5, 2, 3, 'ACCEPTED', '2026-08-22 11:00:00', '2026-08-23 08:45:00'),
      (6, 2, 6, 'ACCEPTED', '2026-08-22 11:15:00', '2026-08-23 08:50:00'),
      (7, 2, 7, 'PENDING',  '2026-08-26 16:30:00', NULL),

      (8, 3, 5, 'ACCEPTED', '2026-08-24 09:30:00', '2026-08-25 10:00:00'),
      (9, 3, 8, 'PENDING',  '2026-08-27 12:10:00', NULL),

      (10, 4, 10, 'ACCEPTED', '2026-08-23 13:00:00', '2026-08-24 09:20:00');



INSERT INTO fundraisings (
    id,
    class_id,
    logo_file_id,
    name,
    description,
    end_at,
    amount_per_child,
    status,
    cancelled_at,
    closed_at,
    is_blocked
) VALUES

      -- Class 1
      (
          1,
          1,
          NULL,
          'Wycieczka do Centrum Nauki',
          'Zbiórka na wyjazd klasowy do Centrum Nauki.',
          '2026-10-15',
          120.00,
          'CLOSED',
          NULL,
          '2026-10-16 09:00:00',
          false
      ),
      (
          2,
          1,
          NULL,
          'Materiały plastyczne',
          'Zakup materiałów plastycznych dla uczniów klasy.',
          '2026-11-30',
          45.50,
          'ACTIVE',
          NULL,
          NULL,
          false
      ),
      (
          3,
          1,
          NULL,
          'Mikołajki klasowe',
          'Zbiórka na organizację wydarzenia mikołajkowego.',
          '2026-11-25',
          60.00,
          'CANCELLED',
          '2026-10-24 12:00:00',
          NULL,
          false
      ),

      -- Class 2
      (
          4,
          2,
          NULL,
          'Wyposażenie klasy',
          'Zakup dodatkowego wyposażenia oraz pomocy dydaktycznych.',
          '2026-12-15',
          81.30,
          'ACTIVE',
          NULL,
          NULL,
          false
      ),
      (
          5,
          2,
          NULL,
          'Wyjazd jesienny',
          'Dofinansowanie jednodniowego wyjazdu integracyjnego.',
          '2026-09-30',
          100.00,
          'CLOSED',
          NULL,
          '2026-10-01 08:30:00',
          false
      ),

      -- Class 3
      (
          6,
          3,
          NULL,
          'Książki do biblioteczki klasowej',
          'Zakup nowych książek do klasowej biblioteczki.',
          '2026-12-10',
          35.00,
          'ACTIVE',
          NULL,
          NULL,
          false
      );


INSERT INTO wallets (
    id,
    user_id,
    fundraising_id,
    iban,
    balance
) VALUES

      -- User wallets
      (
          1,
          1,
          NULL,
          'PL61109010140000071219812874',
          0.00
      ),
      (
          2,
          2,
          NULL,
          'PL61109010140000071219812875',
          0.00
      ),
      (
          3,
          3,
          NULL,
          'PL61109010140000071219812876',
          0.00
      ),
      (
          4,
          4,
          NULL,
          'PL61109010140000071219812877',
          0.00
      ),
      (
          5,
          5,
          NULL,
          'PL61109010140000071219812878',
          0.00
      ),

      -- Fundraising wallets
      (
          6,
          NULL,
          1,
          'PL61109010140000071219812879',
          0.00
      ),
      (
          7,
          NULL,
          2,
          'PL61109010140000071219812880',
          0.00
      ),
      (
          8,
          NULL,
          3,
          'PL61109010140000071219812881',
          0.00
      ),
      (
          9,
          NULL,
          4,
          'PL61109010140000071219812882',
          0.00
      ),
      (
          10,
          NULL,
          5,
          'PL61109010140000071219812883',
          0.00
      ),
      (
          11,
          NULL,
          6,
          'PL61109010140000071219812884',
          0.00
      );


SELECT setval(
   pg_get_serial_sequence('users', 'id'),
   COALESCE((SELECT MAX(id) FROM users), 1),
   true
);

SELECT setval(
   pg_get_serial_sequence('children', 'id'),
   COALESCE((SELECT MAX(id) FROM children), 1),
   true
);

SELECT setval(
   pg_get_serial_sequence('classes', 'id'),
   COALESCE((SELECT MAX(id) FROM classes), 1),
   true
);

SELECT setval(
   pg_get_serial_sequence('class_memberships', 'id'),
   COALESCE((SELECT MAX(id) FROM class_memberships), 1),
   true
);

SELECT setval(
       pg_get_serial_sequence('fundraisings', 'id'),
       COALESCE((SELECT MAX(id) FROM fundraisings), 1),
       true
);

SELECT setval(
   pg_get_serial_sequence('wallets', 'id'),
   COALESCE((SELECT MAX(id) FROM wallets), 1),
   true
);

COMMIT;
