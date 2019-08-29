//import { stringify } from 'querystring';
import routes from './utils/routes.js';
import charts from './src/charts.js';

let displayChart = function() {
  routes
    .getResults()
    .then(function(res) {
      pieChart(res.nbrPets.nbrOfCats, res.nbrPets.nbrOfDogs);
      mapChart(res.data);
    })
    .catch(function(res) {
      console.log(res);
    });
};

let pieChart = function(x, y) {
  charts.pieChart(x, y);
};

let mapChart = function(mapData) {
  charts.mapChart(mapData);
};

let displayHideBlock = function() {
  //Hide the poll block
  let pollBlock = document.getElementById('pollBlock');
  pollBlock.style.display = 'none';
  //Display the chartsBlock
  let chartsBlock = document.getElementById('chartsBlock');
  chartsBlock.style.display = 'inline';
  displayChart();
};

let stylePet = function(removePet, addPet) {
  let addPetElement = document.getElementById(addPet),
    removePetElement = document.getElementById(removePet),
    pollRequest = document.getElementById('pollRequest');

  pollRequest.innerText = 'Your vote: ' + addPet;
  pollRequest.style.color = addPet === 'cat' ? 'blue' : 'red';
  petSelected = addPet === 'cat' ? 1 : 2;

  removePetElement.classList.remove('active');
  if (!addPetElement.classList.contains('active')) {
    addPetElement.classList += ' active';
  }
};

let petSelected = null;
function imageClick(e) {
  if (e == 'cat') {
    stylePet('dog', 'cat');
  } else {
    stylePet('cat', 'dog');
  }
}

window.imageClick = imageClick;

let displayResults = function() {
  //Hide the poll block
  displayHideBlock();
  //Display the chart
  displayChart();
};

window.displayResults = displayResults;
document.addEventListener('DOMContentLoaded', function() {
  $('#results').click(function() {
    displayChart();
  });

  $('#submit').click(function() {
    if (petSelected) {
      //A pet was selected
      let toSend = { pet: 0, country: 0 };
      let country = document.getElementsByName('country');

      toSend.pet = petSelected;
      //Reset petSelected
      petSelected = null;
      toSend.country = country[0].value; //ID (in the database) starts at 1
      routes.submitPoll(toSend);

      displayHideBlock();
    }
  });
});
