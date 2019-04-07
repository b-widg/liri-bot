require(`dotenv`).config();
var keys = require(`./keys.js`);
var axios  = require(`axios`);
var Spotify = require(`node-spotify-api`);
var omdbApi = require(`omdb-client`);
var moment = require('moment');
var fs = require(`fs`);

var spotify = new Spotify(keys.spotify);
var omdbKey = keys.omdbKey;
var concertKey = keys.concertKey;

var command = process.argv[2];
var movieParams = {};

switch(command){
    case `spotify-this-song`:
    // spotify:track:2vAJzMPjMoTROtntmZoaIb I Saw The Sign
        if (!process.argv[3]){
            searchSpotify(`The Sign`, 5);
        }else{
            let song = process.argv[3];
            searchSpotify(song, 5);
        }
        break;
    case `movie-this`:
        if(!process.argv[3]){
            movieParams = {
                apiKey: omdbKey,
                title: 'Mr. Nobody',
                year: 2009,
            }
        }else{
            movieParams = {
                apiKey: omdbKey,
                title: process.argv[3],
                year: parseInt(process.argv[4]),
            }
        }
        searchOMDb(movieParams);
        break;
    case `concert-this`:
        let band = process.argv[3];
        searchBandsInTown(band);
        break;
    case `do-what-it-says`:
        console.log(`I warned you not to...
        `);
        searchSpotify(`I Want It That Way`, 1);
        break;
    case 'help':
        console.log(
`Possible Commands:
help (If you're reading this, you've got this one.)
spotify-this-song '<song title>' (hint: Don't forget song title if you know what's good for you!)
concert-this '<artist name>'
movie-this '<movie name>' <year> (year is optional)
do-what-it-says (No parameters needed.  Don't use this!  You've been warned!!!)`);
        break;
    default:
        console.log(`Huh??? You Get Back Street Boys.  Hope you're happy.  Read the help file next time chump!
        `);
        searchSpotify(`I Want It That Way`, 1);
} 


function searchSpotify(song, totalResults){
    spotify.search({ type: `track`, query: song }, function(error, data) {
        if (error) {
            return console.log(`Spotify search error: ${error}`);
        }
        let responseList = data.tracks.items.splice(0, totalResults);
        // let artists = responseList[0].artists[0].name;
        // console.log('artists:', artists)
        responseList.forEach(songDetail => { ////${songDetail.artists[0].name}
            let songData = 
`Artist(s): ${songDetail.artists[0].name}
Song Name: ${songDetail.name}
Preview Link: ${songDetail.preview_url}
Album: ${songDetail.album.name}
----------------------
`;
            console.log(songData);
            fs.appendFile('log.txt', songData, error => {
                if (error) throw error;
            });
        });
    });
}

function searchBandsInTown(band){
    axios.get(`https://rest.bandsintown.com/artists/${band}/events?app_id=${concertKey}`).then(response => {
        let venues = response.data.splice(0, 5);
        venues.forEach(venue => {
            let concertData = 
`Venue Name: ${venue.venue.name}
Location: ${venue.venue.city}, ${venue.venue.region} ${venue.venue.country} 
Date: ${moment(venue.datetime).format(`MM-DD-YYYY`)}
See venue location on Google Maps: https://maps.google.com/?q=${venue.venue.latitude},${venue.venue.longitude}
----------------------
`;
            console.log(concertData);
            fs.appendFile('log.txt', concertData, error => {
                if (error) throw error;
            });
        });
    }).catch(error => {
        console.log(`Concert Search Error: ${error}`);
    });
}

function searchOMDb(movieParams){
        omdbApi.get(movieParams, (error, response) => {
        let movieData =
`Title: ${response.Title}
Year: ${response.Year}
IMDB Rating: ${response.imdbRating}
Rotten Tomato Ratig: ${response.Ratings[1].Value}
Country Produced In: ${response.Country}
Language: ${response.Language}
Plot: ${response.Plot}
Actors: ${response.Actors}
`;
        console.log(movieData);
        fs.appendFile('log.txt', movieData, error => {
            if (error) throw error;
        });
    });
    
}

