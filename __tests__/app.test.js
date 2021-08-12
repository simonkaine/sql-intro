require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns characters', async() => {

      const expectation = [
        {
          id:1,
          name: 'Simon Kaine',
          bad: false,
          species: 'human',
        },
        {
          id:2,
          name: 'Glerg',
          bad: true,
          species: 'plutonian',
        },
        {
          id:3,
          name: 'Noob Noob',
          bad: true,
          species: 'human',
        },
        {
          id:4,
          name: 'Flim-flom',
          bad: false,
          species: 'plutonian',
        },
        {
          id:5,
          name: 'Nimbix',
          bad: true,
          species: 'martian',
        },
      ];

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
