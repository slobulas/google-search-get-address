(function () {
  'use strict';
  
  // Setting up file handling variables.
  var fs = require('fs');
  var utils = require('utils');
  var data = [];
  var searchTerms = [];
  var addresses = [];

  // A CSV file with the search terms you want to search on; should be in the first column only.
  var stream = fs.open(casper.cli.get(0), 'r');

  // Name of the output CSV file you want to use.
  var outputPath = casper.cli.get(1);

  // Read the CSV file with the search terms, put into an array.
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

  if ( (casper.cli.has(0) && casper.cli.has(1)) === false) {
    this.echo("You must supply an input file as your first command line argument and an output file name as the second argument.");
    casper.exit();
  }

  // User Agent must be set in order to get results.
  casper.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64)" +
      " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36");

  casper.start();

  // Primary function that iterates over our search term array and attempt to get location results from google.
  // If no search term is found and Casper times out, we add address not found to the address array.
  for (var i = 0; i < data.length; i++) {
    var url = 'https://google.com/search?q=' + data[i];
    casper.thenOpen(url, function () {
    }).waitUntilVisible('#lclbox .ts',
      function then() {
        var output = this.getHTML('#lclbox table.ts tbody tr td:nth-child(2)').replace(/(<([^>]+)>)/ig, "");
        var finalOutput = output.replace("(", " (");
        addresses.push(finalOutput);
      },
      function onTimeout() {
        addresses.push("NO ADDRESS FOUND");
      },
      7000 // Time (in ms) we should wait for location to appear on the page.
    );
  }

  casper.then(function () {
    for (var i = 0; i < searchTerms.length; i++) {
      if (i === 0) {
        fs.write(outputPath, '"' + searchTerms[i] + '",' + '"' + addresses[i] + '"\n', 'w');
      } else {
        fs.write(outputPath, '"' + searchTerms[i] + '",' + '"' + addresses[i] + '"\n', 'a');
      }      
    }
  });

  casper.run();

})();