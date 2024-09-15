import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import formbody from '@fastify/formbody';
import { FastifyRequest } from 'fastify';
import {getAllReservations, getReservationsByUserId, getUserByCredentials, createReservation} from './database.memory'

interface LoginDTO {
    username: string;
    password: string;
}

interface ReservationDTO {
    name: string;
    user_id: number;
    time: string;
    phone?: string;
}

interface User {
    id: number;
    username: string;
    password: string;
    role: string;
}

interface Reservation {
    id: number;
    name: string;
    time: string;
    user_id: number;
    phone: string;
}

interface DecodedAuthToken {
    typ: string;
    uid: number;
}

const fastify = Fastify({ logger: true });

// Register formbody plugin
fastify.register(formbody);
// Register JWT plugin
fastify.register(fastifyJwt,
    {secret: 'supersecret'});

const decodedAuthTokenFactory = ({role, id}: User): DecodedAuthToken => {
    // switch case to return payload based on role
    switch (role) {
        case 'admin':
            return { typ: 'admin', uid: id};
        case 'user':
            return { typ: 'user', uid: id };
        default:
            throw new Error('Invalid role');
    } 
}

const reservationFactory = ({name, time, user_id, phone}: ReservationDTO, userToken: DecodedAuthToken): Reservation => {
    //switch case to build reservation based on user type
    switch (userToken.typ) {
        case 'admin':
            return {
                id: Date.now(), // Simple ID generation
                name,
                time,
                user_id,
                phone
            } as Reservation; // instance type #3
        case 'user':
            return {
                id: Date.now(), // Simple ID generation
                name,
                time,
                user_id,
                phone: '' // Regular users do not provide phone number
            } as Reservation; // instance type #3
        default:
            throw new Error('Invalid user type');
    }
}

// JWT authentication hook
fastify.addHook('onRequest', async (request, reply) => {
    if (request.url === '/login') return; // Skip authentication for login route
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

// Route to get reservations
fastify.get('/reservations', async (request, reply) => {
    const payload: DecodedAuthToken = request.user as DecodedAuthToken; // instance type #1
    console.log('user', payload);
    if (payload.typ === 'admin')
    {
        const reservations = getAllReservations() as Reservation[];
        return reply.status(200).send({reservations});
    }
    const reservations = getReservationsByUserId(payload.uid);
    
    return reply.status(200).send({reservations});
});


// Route to make reservation
// if the user is an admin, they can make a reservation for any user
// their payload will include the user id of the user they are making the reservation for
// the payload will also include the phone number
// if the user is a regular user, they can only make a reservation for themselves
fastify.post('/reservations', async (request: FastifyRequest<{ Body:ReservationDTO }>, reply) => {
    const userToken: DecodedAuthToken = request.user as DecodedAuthToken;
    const reservation = reservationFactory(request.body, userToken);
    createReservation(reservation);
    return reply.status(201).send({ reservation });
});


// Route to login and get a token
fastify.post('/login', async (request: FastifyRequest<{ Body: LoginDTO }>, reply) => {
    const { username, password } = request.body;
    const user = getUserByCredentials(username, password) as User; // instance type #2
    if (user) { 
        const token = fastify.jwt.sign(decodedAuthTokenFactory(user));
        return reply.status(201).send({ token });
    }

    reply.status(401).send({ error: 'Unauthorized' });
});

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        fastify.log.info(`Server listening on http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();