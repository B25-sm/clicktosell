const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+919876543210',
        password: 'Password123',
        city: 'Mumbai'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(userData.firstName);
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+919876543211',
        password: 'Password123',
        location: { city: 'Mumbai' }
      });

      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'jane.doe@example.com', // Same email
        phone: '+919876543212',
        password: 'Password123',
        city: 'Mumbai'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('EMAIL_EXISTS');
    });

    it('should validate required fields', async () => {
      const userData = {
        firstName: 'John',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'Password123',
        location: { city: 'Mumbai' }
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should login with phone number', async () => {
      const loginData = {
        identifier: '+919876543210',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.phone).toBe(testUser.phone);
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should not login with non-existent user', async () => {
      const loginData = {
        identifier: 'nonexistent@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'Password123',
        location: { city: 'Mumbai' }
      });
      
      authToken = generateToken({ userId: testUser._id });
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not return profile without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not return profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'Password123',
        location: { city: 'Mumbai' },
        refreshTokens: [{ token: 'refresh-token-123' }]
      });
      
      authToken = generateToken({ userId: testUser._id });
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refreshToken: 'refresh-token-123' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify refresh token was removed
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.refreshTokens).toHaveLength(0);
    });
  });
});

describe('Authentication Middleware', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+919876543210',
      password: 'Password123',
      location: { city: 'Mumbai' }
    });
    
    authToken = generateToken({ userId: testUser._id });
  });

  it('should protect routes requiring authentication', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});



