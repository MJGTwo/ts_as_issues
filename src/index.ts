import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import formbody from '@fastify/formbody';
import { FastifyRequest } from 'fastify';

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

// In-memory table of reservations
const reservations: Reservation[] = [
    { id: 1, name: 'John Doe', time: '18:00' },
    { id: 2, name: 'Jane Smith', time: '19:00' },
    { id: 3, name: 'Alice Johnson', time: '20:00' }
];

// In-memory user data
// in a real application, the password should be hashed and stored securely
const users: User[] = [
    { id: 1, username: 'admin', password: 'a-really-tough-password', role: 'admin' },
    { id: 2, username: 'user12', password: 'password1', role: 'user' },
    { id: 3, username: 'user43', password: 'password2', role: 'user' }
];

const payloadFactory = ({role, id}: User): Payload | {} => {
    // switch case to return payload based on role
    switch (role) {
        case 'admin':
            return { typ: 'admin', uid: id };
        case 'user':
            return { typ: 'user', uid: id };
        default:null
            return {};
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
    return reservations;
});

// Route to login and get a token
fastify.post('/login', async (request: FastifyRequest<{ Body: LoginDTO }>, reply) => {
    const { username, password } = request.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (user) { 
        const token = fastify.jwt.sign(payloadFactory(user));
        return { token };
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