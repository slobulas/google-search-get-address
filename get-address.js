(function () {
  'use strict';
  
  // Setting up file handling variables.
  var fs = require('fs');
  var utils = require('utils');
  var data = [];
  var searchTerms = [];
  var addresses = [];
  var outputToCsv = [];
  var stream = fs.open('example.csv', 'r');
  var outputPath = 'output.csv';
  var line = stream.readLine();
  while (line) {
    searchTerms.push(line);
    var string = line.replace(" ", "+");
    data.push(string);
    line = stream.readLine();
  }
  stream.close();

  // Setting up CasperJS variables.
  var casper = require('casper').create({
    stepTimeout: 7000,
    verbose: true,
    onError: function (self, message) {
      console.log("Error: " + m);
      self.exit();
    },
    onStepTimeout: function(self, message) {
      console.log("Address not found.");
    }
  });

  // User Agent must be set in order to get results.
  casper.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64)" +
      " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36");

  casper.start();

  for (var i = 0; i < data.length; i++) {
    var url = 'https://google.com/search?q=' + data[i];
    casper.thenOpen(url, function (outputToCsv) {
    }).waitUntilVisible('#lclbox .ts',
      function then() {
        var output = this.getHTML('#lclbox table.ts tbody tr td:nth-child(2)').replace(/(<([^>]+)>)/ig, "");
        var finalOutput = output.replace("(", " (");
        addresses.push(finalOutput);
      },
      function onTimeout() {
        addresses.push("NO ADDRESS FOUND");
      },
      7000
    );
  }

  casper.then(function () {

    // TO FIX: bug in the layout of the CSV file. 2014-11-06 - Pete Herbst
    for (var i = 0; i < searchTerms.length; i++) {
      var searchTermForCsv = '"' + searchTerms[i] + '"';
      outputToCsv = outputToCsv.concat(searchTermForCsv);
      var addressForCsv = '"' + addresses[i] + '"';
      outputToCsv = outputToCsv.concat(addressForCsv);
      outputToCsv = outputToCsv.concat('\n');
    }
    fs.write(outputPath, outputToCsv, 'w');
  });

  casper.run();

})();