const request = require('supertest');
const app = require('../../examples/express/app');

describe('Express integration', () => {
    test('Simple template', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(expect.stringContaining('Hello, world!'));
    });

    test('Validation error', async () => {
        const response = await request(app).get('/non-valid');

        expect(response.statusCode).toBe(500);
        expect(response.text).toEqual(expect.stringContaining('Error: Import statement not allowed in express views, plz use precompilation if u need it'));
    });
});
