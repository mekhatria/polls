const mysql = require('mysql');
const config = require('config-json');
const SqlString = require('sqlstring');

config.load('config.json');
// To get access to the production database
let host = config.get('host'),
  user = config.get('user'),
  password = config.get('password'),
  database = config.get('database');
// To get access to the local database
let hostLocal = config.get('hostLocal'),
  userLocal = config.get('userLocal'),
  databaseLocal = config.get('databaseLocal');
const connection = mysql.createConnection({
  /* host: host,
  user: user,
  password: password,
  database: database*/
  host: hostLocal,
  user: userLocal,
  password: '',
  database: databaseLocal
});
let query = function(query) {
  return new Promise(function(resolve, reject) {
    connection.query(query, (err, rows, fields) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};
/*module.exports.insertAnswers = function(country, pet) {
  return query(
    'insert into answers (`country_id`, `pet_id`) values (' +
      country +
      ', ' +
      pet +
      ');'
  );
};*/
module.exports.insertAnswers = function(country, pet) {
  console.log(
    SqlString.format('insert into answers (country_id, pet_id) values (?, ?)', [
      country,
      pet
    ])
  );
  return query(
    SqlString.format('insert into answers (country_id, pet_id) values (?, ?)', [
      country,
      pet
    ])
  );
};

module.exports.countAnswers = function() {
  return query('select count(*) as numberPet from answers group by pet_id;');
};

module.exports.displayResultsCount = function() {
  return query('select count(*) as numberPet from answers group by pet_id;');
};

module.exports.displayResultsCountry = function() {
  return query(
    'select country.name, sum( case when answers.pet_id = 1 then 1 else 0 end) as Cat, sum( case when answers.pet_id = 2 then 1 else 0 end) as Dog, count(answers.pet_id) as nbrOfVotes from country left join answers on country.id = answers.country_id group by country.id;'
  );
};
