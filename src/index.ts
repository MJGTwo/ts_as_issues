import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import formbody from '@fastify/formbody';
import { FastifyRequest } from 'fastify';
import {getAllReservations, getReservationsByUserId, getUserByCredentials} from './database.memory'

interface LoginDTO {
    username: string;
    password: string;
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
}

interface Payload {
    typ: string;
    uid: number;
}

const fastify = Fastify({ logger: true });

// Register formbody plugin
        fastify.register(formbody);
// Register JWT plugin
fastify.register(fastifyJwt, {
    secret: 'supersecret',
    
});

const payloadFactory = ({role, id}: User): Payload => {
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
    const payload: Payload = request.user as Payload; // instance #1
    console.log('user', payload);
    if (payload.typ === 'admin')
    {
        const reservations = getAllReservations() as Reservation[];
        return reply.status(200).send({reservations});
    }
    const reservations = getReservationsByUserId(payload.uid);
    
    return reply.status(200).send({reservations});
});

// Route to login and get a token
fastify.post('/login', async (request: FastifyRequest<{ Body: LoginDTO }>, reply) => {
    const { username, password } = request.body;
    const user = getUserByCredentials(username, password) as User; // instance #2
    if (user) { 
        const token = fastify.jwt.sign(payloadFactory(user));
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