const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.charactersId}`
  });
});

app.get('/characters', async(req, res) => {
  try {
    const data = await client.query(` SELECT characters.id,
        characters.name,
        characters.bad, 
        characters.species_id,
        breeds.name as species
    FROM characters INNER JOIN breeds
    ON characters.species_id = breeds.id
    ORDER BY characters.id;`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/characters/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    const data = await client.query(` SELECT characters.id,
        characters.name,
        characters.bad, 
        characters.species_id,
        breeds.name as species
    FROM characters INNER JOIN breeds
    ON characters.species_id = breeds.id
    WHERE characters.id = $1
    ORDER BY characters.id;`, [id]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/breeds', async (req, res)=>{
  try{
    const data = await client.query('SELECT * FROM breeds;');
    res.json(data.rows);
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/characters', async(req, res)=>{
  
  try {
    const data = await client.query(`
    INSERT INTO characters(
      id,
      name,
      bad,
      species_id
    ) VALUES ($1, $2, $3, $4) 
    RETURNING *;`, [
      req.body.id,
      req.body.name,
      req.body.bad,
      req.body.species_id
    ]);
    res.json(data.rows[0]);

  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

app.put('/characters/:id', async(req, res)=>{
  try {
    const data = await client.query(`
      UPDATE characters
      SET 
        name=$2,
        bad=$3,
        species_id=$4
      WHERE id = $1
      RETURNING *;
    `, [
      req.params.id,
      req.body.name,
      req.body.bad,
      req.body.species_id
    ]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/characters/:id', async(req, res)=>{
  try {
    const data = await client.query(`
    INSERT INTO characters(
      id,
      name,
      bad,
      species_id
    ) VALUES ($1, $2, $3, $4) 
    RETURNING *;`, [
      req.body.id,
      req.body.name,
      req.body.bad,
      req.body.species_id
    ]);
    res.json(data.rows[0]);

  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

app.delete('/characters/:id', async (req, res) => {
  try {
    const data = await client.query(`
    DELETE FROM characters WHERE id=$1
    RETURNING *`, [
      req.params.id
    ]
    );
    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;


