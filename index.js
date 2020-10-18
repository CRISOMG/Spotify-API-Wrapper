const express = require('express');
const server = express();

const cors = require('cors');
server.use(cors());

const spotifyService = require('./service/spotifyService');

server.get('/search', async (req, res, next) => {
  const { q, type } = req.query;
  try {
    const { data, status } = await spotifyService.search(q, type);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
});

server.get('/tracks/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, status } = await spotifyService.getTrack(id);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
});

const PORT = '3000';
const dg_server = require('debug')('server:start');
server.listen(PORT, () => {
  dg_server(`Server Listening at http://localhost:${PORT}`);
});
