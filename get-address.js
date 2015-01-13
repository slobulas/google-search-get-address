(function () {
  'use strict';
  
  // Setting up file handling variables.
  var fs = require('fs');
  var utils = require('utils');
  var data = [];
  var searchTerms = [];

  // Setting up CasperJS variables.
  var casper = require('casper').create({
    stepTimeout: 7000,
    verbose: true,
    onError: function (self, message) {
      console.log("Error: " + m);
      self.exit();
    },
    onStepTimeout: function (self, message) {
      console.log("Address not found.");
    }
  });

  casper.cli.drop("cli");
  casper.cli.drop("casper-path");

  if (casper.cli.args.length === 0 && Object.keys(casper.cli.options).length === 0) {
    casper.echo("You must supply an input file as your first command line argument.").exit();
  }

  // A CSV file with the search terms you want to search on; should be in the first column only.
  var inputFile = casper.cli.raw.get(0);
  var stream = fs.open(inputFile, 'r');

  // Read the CSV file with the search terms, put into an array.
  var line = stream.readLine();
  while (line) {
    searchTerms.push(line);
    var string = line.replace(/ /g, "+").replace(/"/g, '').replace(/""/g, '').replace(/\//g, " ");
    data.push(string);
    line = stream.readLine();
  }
  stream.close();

  // User Agent must be set in order to get results.
  casper.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64)" +
      " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36");

  casper.start();

  // Primary function that iterates over our search term array and attempt to get location results from google.
  for (var i = 0; i < data.length; i++) {
    var url = 'https://google.com/search?q=' + data[i];
    casper.thenOpen(url, function () {
    }).waitUntilVisible('#lclbox .ts',
      function then() {
        var output = this.getHTML('#lclbox table.ts tbody tr td:nth-child(2)').replace(/(<([^>]+)>)/ig, "");
        var finalOutput = output.replace("(", " (");
        console.log(finalOutput);
      },
      function onTimeout() {},
      7000 // Time (in ms) we should wait for location to appear on the page.
    );
  }

  casper.run();

})();
