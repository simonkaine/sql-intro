const client = require('../lib/client');
// import our seed data:
const data = require('./myData.js');
// const usersData = require('./users');
const { getEmoji } = require('../lib/emoji.js');
const breedsData = require('./breeds.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      breedsData.map(breed => {
        return client.query(`
                      INSERT INTO breeds (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [breed.name]);
      })
    );

    await Promise.all(
      data.map(character => {
        return client.query(`
                    INSERT INTO characters (name, bad, species_id)
                    VALUES ($1, $2, $3);
                `,
        [character.name, character.bad, character.species_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
