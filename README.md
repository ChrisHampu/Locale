# Locale

Locale is a location based chat service currently available at [GetLocale.me](http://getLocale.me/).
Users can create Locales in their area and communicate to other people within the radius of the locale.

## Installation

Clone the repository to your desired directory.
Run the following commands inside that directory:
```
  npm install
  bower install
  grunt
```
This will copy all the necessary files to begin development.

You can also have grunt run bower for you by directly running:
```
  npm install
  grunt
```
Though if the bower_components directory already exists, this will **not** update packages.

## Usage

When any changes to npm/bower packages are made, the standard command to prepare
for development:
```
  grunt
```
Which will copy updated files from bower to the development directory.
***
To run the development server:
```
  grunt server
```
***
To build the code for production.
This will compile SASS then combine & uglify the JS:
```
  grunt deploy
```
***
To run the server in production mode.
This will also build everything before running the server:
```
  grunt deploy:server
```
***
To skip the build process and run the production server directly:
```
  grunt server:production
```
This is useful in cases where the server crashes and you don't feel like waiting on the build process.

## History
Locale was conceived at nwHacks 2015 and built within 48 hours.
Development has slowly continued since then and brought multiple reworks to the code foundation.

## Credits
The development team:
* Jake Cooper
* Chris Hampu
* Denis Kisselev
* Ben Hawker

## License
N/A