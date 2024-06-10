import request from 'supertest';
import app from '..';

describe('GET /', () => {
  it('should respond with static file!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('html');
  });
});

describe('GET /api/v1/tasks', () => {
  it('should respond with a list of done tasks', async () => {
    const res = await request(app).get('/api/v1/tasks');
    expect(res.statusCode).toEqual(200);
    const { body } = res;
    expect(Array.isArray(body)).toBe(true);
    if (body.length) {
      const firstItem = body[0];
      expect(typeof firstItem).toBe('object');
      expect(typeof firstItem.id).toBe('string');
      expect(typeof firstItem.operation).toBe('string');
      expect(typeof firstItem.left).toBe('number');
      expect(typeof firstItem.right).toBe('number');
    }
  });
});
