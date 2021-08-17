require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const characterData = require('../data/myData');
const breedsData = require('../data/breeds');

describe('app routes', () => {
  describe('routes', () => {
    // let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      // const signInData = await fakeRequest(app)
      //   .post('/auth/signup')
      //   .send({
      //     email: 'jon@user.com',
      //     password: '1234'
      //   });
      
      // token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('GET /characters returns list of characters', async() => {

      const expectation = characterData.map(character => character.name);
      const expectedData = {
        id: 1,
        name: 'Simon Kaine',
        bad: false,
        species_id: 1,
        species: 'human'
      };

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      const name = data.body.map(character => character.name);

      expect(name).toEqual(expectation);
      expect(name.length).toBe(characterData.length);
      expect(data.body[0]).toEqual(expectedData);
    }, 10000);

    test('GET /characters/:id returns the individual character', async ()=>{
      const expectation = {
        id: 1,
        name: 'Simon Kaine',
        bad: false,
        species_id: 1,
        species: 'human'
      };
      
      const data = await fakeRequest(app)
        .get('/characters/1')
        .expect('Content-Type', /json/)
        .expect(200);

      
      expect(data.body).toEqual(expectation);
    });

    test('GET /breeds returns list of breeds', async() => {
      const expected = breedsData.map(breed => breed.name);
      const data = await fakeRequest(app)
        .get('/breeds')
        .expect('Content-Type', /json/)
        .expect(200);
        
      const speciesNames = data.body.map(breed => breed.name);
        
      expect(speciesNames).toEqual(expected);
      expect(speciesNames.length).toBe(speciesNames.length);
      expect(data.body[0].id).toBeGreaterThan(0);
    });

    test('POST /characters creates a new character', async ()=>{

      const newCharacter = {
        id:6,
        name: 'JOY',
        bad: false,
        species_id: 3
      };

      const data = await fakeRequest(app)
        .post('/characters')
        .send(newCharacter)
        .expect(200)
        // console.log(data.body)
        .expect('Content-Type', /json/);
      expect(data.body.name).toEqual(newCharacter.name);
      expect(data.body.id).toBeGreaterThan(0);

    });

    test('POST /characters/:id create new character into array.', async ()=>{
      const newCharacterInArray = {
        id:6,
        name: 'JOY',
        bad: false,
        species_id: 3 
      };
      const data = await fakeRequest(app)
        .put('/characters/1')
        .send(newCharacterInArray)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(data.body.species).toEqual(newCharacterInArray.species);
      expect(data.body.id).toBeGreaterThan(0);
    });

    test('PUT /characters/:id updates characters', async ()=>{
      const characterUPDATEdata =   {
        id: 1,
        name:'Simon Kaine',
        bad: false,
        species_id: 3
      };
      const data = await fakeRequest(app)
        .put('/characters/1')
        .send(characterUPDATEdata)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(data.body.species).toEqual(characterUPDATEdata.species);

    });

    test('DELETE /deletes one object in the array by query id', async () => {
      const deletedObject = {
        name: 'JOY',
        bad: false,
        species_id: 3
      };
      await fakeRequest(app)
        .post('/characters')
        .send(deletedObject)
        .expect('Content-Type', /json/);
      const data = await fakeRequest(app)
        .delete('/characters/6')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body).toEqual({ ...deletedObject, id: 6 });

    });

    // test('returns characters', async() => {

    //   const expectation = [
    //     {
    //       id:1,
    //       name: 'Simon Kaine',
    //       bad: false,
    //       species: 'human',
    //     },
    //     {
    //       id:2,
    //       name: 'Glerg',
    //       bad: true,
    //       species: 'plutonian',
    //     },
    //     {
    //       id:3,
    //       name: 'Noob Noob',
    //       bad: true,
    //       species: 'human',
    //     },
    //     {
    //       id:4,
    //       name: 'Flim-flom',
    //       bad: false,
    //       species: 'plutonian',
    //     },
    //     {
    //       id:5,
    //       name: 'Nimbix',
    //       bad: true,
    //       species: 'martian',
    //     },
    //   ];

    //   const data = await fakeRequest(app)
    //     .get('/characters')
    //     .expect('Content-Type', /json/)
    //     .expect(200);

    //   expect(data.body).toEqual(expectation);
    // });
  });
});