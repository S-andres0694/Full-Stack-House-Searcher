CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (role) REFERENCES roles(role_name)
);
CREATE TABLE IF NOT EXISTS properties (
    identifier INTEGER PRIMARY KEY,
    bedrooms INTEGER NOT NULL,
    address TEXT NOT NULL,
    monthly_rent TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    summary TEXT NOT NULL,
    url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS viewed_properties (
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES Properties(identifier) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES Properties(identifier) ON DELETE CASCADE
);




