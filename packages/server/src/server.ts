import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';

import { SERVER_PORT } from './environment.js';
import { getNymphInstance } from './nymph.js';

const { LogEntry, StateObject } = getNymphInstance();

function checkJsonData(request: Request, response: Response) {
  if (typeof request.body !== 'object') {
    response.status(400);
    response.send('Body must be a JSON object.');
    return false;
  }
  if ('guid' in request.body) {
    response.status(400);
    response.send('Body must be not contain `guid` property.');
    return false;
  }
  if ('cdate' in request.body) {
    response.status(400);
    response.send('Body must be not contain `cdate` property.');
    return false;
  }
  if ('mdate' in request.body) {
    response.status(400);
    response.send('Body must be not contain `mdate` property.');
    return false;
  }
  if ('user' in request.body) {
    response.status(400);
    response.send('Body must be not contain `user` property.');
    return false;
  }
  if ('group' in request.body) {
    response.status(400);
    response.send('Body must be not contain `group` property.');
    return false;
  }
  if ('acUser' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acUser` property.');
    return false;
  }
  if ('acGroup' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acGroup` property.');
    return false;
  }
  if ('acOther' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acOther` property.');
    return false;
  }
  if ('acRead' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acRead` property.');
    return false;
  }
  if ('acWrite' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acWrite` property.');
    return false;
  }
  if ('acFull' in request.body) {
    response.status(400);
    response.send('Body must be not contain `acFull` property.');
    return false;
  }
  if (
    'tags' in request.body &&
    (!Array.isArray(request.body.tags) ||
      request.body.tags.find(
        (tag: any) => typeof tag !== 'string' || tag === '',
      ))
  ) {
    response.status(400);
    response.send('The `tags` property must be an array of strings.');
    return false;
  }

  return true;
}

const app = express();

app.use(bodyParser.json({ limit: '25mb' }));

app.post('/log', async (request, response) => {
  if (!checkJsonData(request, response)) {
    return;
  }
  response.sendStatus(202);
  response.end();

  const entry = await LogEntry.factory();
  for (let name in request.body) {
    if (name === 'tags') {
      entry.$addTag(...request.body.tags);
    } else {
      entry[name] = request.body[name];
    }
  }

  await entry.$saveSkipAC();
});
app.post('/state', async (request, response) => {
  if (!checkJsonData(request, response)) {
    return;
  }

  if (
    !('id' in request.body) ||
    typeof request.body.id !== 'string' ||
    request.body.id === ''
  ) {
    response.status(400);
    response.send('Body of a state object must contain a string `id`.');
    return false;
  }

  response.sendStatus(202);
  response.end();

  let stateObject = await StateObject.factoryId(request.body.id);
  for (let name in request.body) {
    if (name === 'tags') {
      stateObject.$addTag(...request.body.tags);
    } else {
      stateObject[name] = request.body[name];
    }
  }

  await stateObject.$saveSkipAC();
});

app.listen(SERVER_PORT, () => {
  console.log('Server is loaded. Ready to accept logs.');
});
