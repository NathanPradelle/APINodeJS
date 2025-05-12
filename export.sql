-- Insert users
INSERT INTO "user" (email, password, role, balance, "createdAt", "updatedAt") VALUES
('admin@example.com', '$2b$10$hashedadmin', 'admin', 200.00, now(), now()),
('user1@example.com', '$2b$10$hasheduser1', 'client', 80.00, now(), now()),
('user2@example.com', '$2b$10$hasheduser2', 'client', 10.00, now(), now()),
('user3@example.com', '$2b$10$hasheduser3', 'client', 0.00, now(), now());

-- Insert movies
INSERT INTO "movie" (title, synopsis, duration, genres, "createdAt", "updatedAt") VALUES
('Inception', 'A mind-bending thriller.', 148, ARRAY['Sci-Fi', 'Thriller'], now(), now()),
('The Matrix', 'A hacker discovers reality.', 136, ARRAY['Sci-Fi', 'Action'], now(), now()),
('Interstellar', 'Exploration through wormholes.', 169, ARRAY['Sci-Fi', 'Drama'], now(), now()),
('The Godfather', 'Mafia family drama.', 175, ARRAY['Crime', 'Drama'], now(), now());

-- Insert rooms
INSERT INTO "room" (name, description, images, type, capacity, "isAccessible", "isInMaintenance", "createdAt", "updatedAt") VALUES
('Room A', 'Classic 2D hall', ARRAY['img1'], '2D', 25, true, false, now(), now()),
('Room B', 'VIP seating', ARRAY['img2'], 'VIP', 30, true, false, now(), now()),
('Room C', '3D experience', ARRAY['img3'], '3D', 20, false, true, now(), now()),
('Room D', 'Small indie room', ARRAY['img4'], '2D', 15, true, false, now(), now());

-- Insert sessions
INSERT INTO "session" ("startTime", "endTime", "movieId", "roomId") VALUES
('2025-06-20T10:00:00Z', '2025-06-20T12:30:00Z', 1, 1),
('2025-06-20T13:00:00Z', '2025-06-20T15:30:00Z', 2, 2),
('2025-07-01T09:30:00Z', '2025-07-01T12:15:00Z', 3, 4),
('2025-07-01T14:00:00Z', '2025-07-01T16:30:00Z', 4, 1);

-- Insert transactions
INSERT INTO "transaction" ("type", "amount", "userId", "createdAt") VALUES
('deposit', 200, 1, now()),
('deposit', 80, 2, now()),
('deposit', 10, 3, now()),
('deposit', 0, 4, now()),
('ticket_purchase', 10, 2, now()),
('ticket_purchase', 5, 3, now());

-- Insert tickets
INSERT INTO "ticket" ("userId", "sessionId", "isUsed", "isSuperTicket", "remainingUses", "createdAt") VALUES
(2, 1, true, false, 0, now()),
(2, 2, false, true, 10, now()),
(3, 3, false, false, 1, now()),
(4, 4, false, false, 1, now());