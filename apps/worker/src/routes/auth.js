import { Hono } from 'hono';
import { Firestore } from '../lib/firestore';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const authRoutes = new Hono();

// Generate JWT Helper
async function generateToken(user, secret) {
    const alg = 'HS256';
    const secretKey = new TextEncoder().encode(secret);

    return new SignJWT({ id: user.id, role: user.role })
        .setProtectedHeader({ alg })
        .setExpirationTime('7d')
        .sign(secretKey);
}

authRoutes.post('/register', async (c) => {
    const db = new Firestore(c.env);
    const { name, email, password } = await c.req.json();

    try {
        // Check if user exists
        const existingUsers = await db.runQuery('users', [{ field: 'email', value: email }]);
        if (existingUsers.length > 0) {
            return c.json({ message: 'User already exists' }, 400);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = {
            name,
            email,
            password_hash,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        const doc = await db.addDocument('users', newUser);
        // doc returned from addDocument response has structure { name: "projects/.../documents/users/ID", fields: ... }
        // We need to map it to our format manually or use the helper if we had the ID.
        // The addDocument response creates the ID.
        const id = doc.name.split('/').pop();

        const userForToken = { id, role: 'user' };
        const token = await generateToken(userForToken, c.env.JWT_SECRET);

        return c.json({
            token,
            user: { id, name, email, role: 'user' }
        }, 201);

    } catch (error) {
        return c.json({ message: error.message }, 500);
    }
});

authRoutes.post('/login', async (c) => {
    const db = new Firestore(c.env);
    const { email, password } = await c.req.json();

    try {
        const users = await db.runQuery('users', [{ field: 'email', value: email }]);
        if (users.length === 0) {
            return c.json({ message: 'Invalid credentials' }, 400);
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return c.json({ message: 'Invalid credentials' }, 400);
        }

        const token = await generateToken(user, c.env.JWT_SECRET);

        return c.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        return c.json({ message: error.message }, 500);
    }
});

export default authRoutes;
