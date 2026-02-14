const { admin: firebaseAdmin, db } = require('../config/firebaseAdmin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify Firebase Token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            req.user = decodedToken;

            // Fetch generic user details from Firestore (especially Role)
            try {
                const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    req.user.role = userData.role || 'user';
                    req.user.id = decodedToken.uid;
                } else {
                    req.user.role = 'user';
                    req.user.id = decodedToken.uid;
                }
            } catch (dbError) {
                console.error("Firestore Read Failed in Middleware:", dbError);
                req.user.role = 'user';
                req.user.id = decodedToken.uid;
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error);
            res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
