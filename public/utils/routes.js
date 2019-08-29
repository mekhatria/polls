import ajax from './ajax.js';

export default {
  getResults: function() {
    return ajax('get', 'displayResults')
      .then(function(res) {
        res.data = res.rows.map(element => {
          let count = 0;

          if (element.Cat > element.Dog) count = -1;
          else if (element.Cat == element.Dog) count = 1;
          return [
            element.name,
            element.Cat,
            element.Dog,
            element.nbrOfVotes,
            count
          ];
        });
        return res;
      })
      .catch(function(error) {
        throw error;
      });
  },

  submitPoll: function(data) {
    ajax('POST', 'petPolls', JSON.stringify(data)).catch(function(error) {
      throw error;
    });
  }
};
