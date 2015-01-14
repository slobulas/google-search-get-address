(function () {
  'use strict';
  
  // Setting up requirements and variables.
  var fs = require('fs');
  var searchTerms = [];

  // Setting up CasperJS variable.
  var casper = require('casper').create({
    stepTimeout: 7000,
    verbose: true,
    onError: function (self, message) {
      console.log("Error: " + message);
      self.exit();
    },
    onStepTimeout: function (self, message) {} // This is needed here so the script doesn't timeout while waiting
  });

  // Removing these arguments for the CLI, so we can supply a CSV file for searching.
  casper.cli.drop("cli");
  casper.cli.drop("casper-path");

  // Checking that the user supplies a reference to CSV file.
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
    line = stream.readLine();
  }
  stream.close();

  // User Agent MUST be set in order to get search results.
  casper.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64)" +
      " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36");

  casper.start();
  
  // Array.prototype.map each search term.
  var results = searchTerms.map(function(term) {
    
    // Create proper search term for Google.
    var searchString = term.replace(/ /g, "+").replace(/"/g, '').replace(/\//g, " ");
    
    // Setting up the URL to query.
    var url = 'https://google.com/search?q=' + searchString;
    
    // Open the URL and wait for the table cell with the address information to appear.
    // Add a space before the phone number and print the resulting address.
    casper.thenOpen(url, function (term) {
    }).waitUntilVisible('#lclbox .ts',
      function then() {
        var result = this.getHTML('#lclbox table.ts tbody tr td:nth-child(2)')
            .replace(/(<([^>]+)>)/ig, "")
            .replace("(", " (")
            .replace("+", " +");
        this.echo(term + "\t" + result);
      },
      function onWaitTimeout() {
        this.echo(term + "\t" + "Address not found");
      },
      7000 // Timeout set in milliseconds.
    );

  });

  casper.run();

})();
