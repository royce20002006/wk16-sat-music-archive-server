const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */
    if (req.method === 'GET' && req.url === '/artists') {
      res.setHeader('content-type', 'application/json');
      res.statusCode = 200;
      let body = fs.readFileSync('./seeds/artists.json');
      return res.end(body);
    }

    if (req.method === 'GET' && req.url.startsWith('/artists/')) {
      let id = req.url.split('/')[2];
      let artists = JSON.parse(fs.readFileSync('./seeds/artists.json', 'utf-8'))
      console.log(artists);
      let data = artists[id];
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify(data));
    }

    if (req.method === 'POST' && req.url === '/artists') {
      let body = JSON.parse(fs.readFileSync('./seeds/artists.json', 'utf-8'));
      body[nextArtistId] = { name: req.body.name, artistId: nextArtistId };
      let newArtist = body[nextArtistId];
      res.statusCode = 201;
      res.setHeader('content-type', 'application/json');
      nextArtistId++;
      let updatedDataString = Object.values(body)
        .map(artist => JSON.stringify(artist))
        .join(',\n');
      fs.writeFileSync('./seeds/artists.json', `[${updatedDataString}]`, { flag: 'w' });

      return res.end(JSON.stringify(newArtist));
    }

    if (req.method === 'PUT' && req.url.startsWith('/artists/')) {
      let artistId = req.url.split('/')[2];
      let body = JSON.parse(fs.readFileSync('./seeds/artists.json', 'utf-8'));
      body[artistId].name = req.body.name;
      body[artistId].updatedAt = Date.now();
      fs.writeFileSync('./seeds/artists.json', JSON.stringify(body, null, 2));
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify(body[artistId]));

    }
    // Your code here 

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
