module.exports = function (config) {

  return {
    save: function (report) {
      //I hardcoded log level to warn, because that's what csp log is. 
      //Proper configuration will allow mixing it into a file with other logs
      console.warn(report.getLog());
    }
  };
};
