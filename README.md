# Requirements #

This script requires CasperJS. Installation instructions can be found here: http://docs.casperjs.org/en/latest/installation.html

# Usage #

Using this script in the command line requires an argument, the input file that the script will read for the search terms. Your CSV file should have the search terms in the first column with no header.

Here is an example of script usage:
casperjs get-address.js example.csv > addresses.tsv

*Please note: the name of the script needs to come before the argument.* *The script is also set up to output tab separated values.*
