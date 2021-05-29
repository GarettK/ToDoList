

module.exports.getDate = function() {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
  options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  const today = new Date();
  return today.toLocaleDateString("en-US", options);
}

module.exports.getDay = function() {
  options = {
    weekday: "long"
  };

  const today = new Date();
  return today.toLocaleDateString("en-US", options);
}
