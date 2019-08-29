let url = 'http://localhost:3007/';
let ajax = function(type, route, data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: type,
      url: url + route,
      dataType: 'json',
      data: data,
      contentType: 'application/json',
      success: function(result) {
        resolve(result);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
};
export default ajax;
