interface DbEntryUser {
    id: number;
    username: string;
    password: string;
    role: string;
}

interface DbEntryReservation {
    id: number;
    name: string;
    time: string;
    user_id: number;
    phone: string;
}

// In-memory table of reservations
const reservations: DbEntryReservation[] = [
    { id: 1, name: 'John Doe', time: '18:00', user_id: 2, phone: '123-4567' },
    { id: 2, name: 'Jane Smith', time: '19:00', user_id: 1, phone: '234-5678' },
    { id: 3, name: 'Alice Johnson', time: '20:00', user_id: 3, phone: '345-6789' }
];

// In-memory user data
const users: DbEntryUser[] = [
    { id: 1, username: 'admin', password: 'a-really-tough-password', role: 'admin' },
    { id: 2, username: 'user12', password: 'password1', role: 'user' },
    { id: 3, username: 'user43', password: 'password2', role: 'user' }
];

// CRUD operations for users
export const createUser = (user: DbEntryUser): void => {
    users.push(user);
};

export const getUserById = (id: number): DbEntryUser | undefined => {
    return users.find(user => user.id === id);
};

export const getUserByCredentials = (username: string, password: string): DbEntryUser | undefined => {
    return users.find((user) => user.password === password && user.username === username)
}

export const getAllUsers = (): DbEntryUser[] => {
    return users;
};

// CRUD operations for reservations
export const createReservation = (reservation: DbEntryReservation): void => {
    reservations.push(reservation);
};

export const getReservationsByUserId = (userId: number): DbEntryReservation[] => {
    return reservations.filter(reservation => reservation.user_id === userId);
};

export const getAllReservations = (): DbEntryReservation[] => {
    return reservations;
};