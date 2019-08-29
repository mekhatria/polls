const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const queries = require('./queries');

const app = express();
const port = 3007;

app.use(bodyParser.json()); // To support JSON-encoded bodies
app.use(cors()); // To bypass the cross orrigine issues
app.use('/', express.static(path.join(__dirname, 'public')));

// ----

app.post('/petPolls', (req, res) => {
  let petPollsReceived = req.body;
  //Write into the table
  queries
    .insertAnswers(petPollsReceived.country, petPollsReceived.pet)
    .then(function(rows) {
      res.send({ WriteInDataBase: true });
    })
    .catch(function(error) {
      res.send({ WriteInDataBase: false });
    });
});

app.get('/displayResults', (req, res) => {
  //create a promise to read the number of cats and dogs
  let nbrPets = { nbrOfCats: 0, nbrOfDogs: 0 };
  let promiseToReadNbrPets = function() {
    return new Promise(function(resolve, reject) {
      //Read from the table
      return queries
        .displayResultsCount()
        .then(function(rows) {
          nbrPets.nbrOfCats = rows[0].numberPet;
          nbrPets.nbrOfDogs = rows[1].numberPet;
          resolve('readFromTable');
        })
        .catch(function(error) {
          res.send({ WriteInDataBase: false });
          reject();
        });
    });
  };
  promiseToReadNbrPets().then(function(fromResolve) {
    //Read the data with the countries and the pets
    queries
      .displayResultsCountry()
      .then(function(rows) {
        res.send({ nbrPets, rows });
      })
      .catch(function(erro) {
        res.send({ WriteInDataBase: false });
        reject();
      });
  });
});

app.listen(port);
