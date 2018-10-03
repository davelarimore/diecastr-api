const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const morgan = require('morgan');
const app = express();

app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());

//Catch for unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.message);
});

//Auth
const { localStrategy, jwtStrategy } = require('./lib/authStrategy');
passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

//DB
mongoose.Promise = global.Promise;
const { DATABASE_URL, PORT } = require('./config');


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});


//App
app.use('/auth', require('./routes/authRouter'))

app.use('/api', [
  jwtAuth,
  require('./routes/usersRouter'),
  require('./routes/petsRouter'),
  require('./routes/visitsRouter'),
  require('./routes/tasksRouter'),
]);

//404 handler
app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/public/index.html");
})


function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };