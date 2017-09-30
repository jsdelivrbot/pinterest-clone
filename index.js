const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config');
const port = process.env.PORT || 3000;
// connect to the database and load models
require('./server/models').connect(config.dbUri);
const User = require('mongoose').model('User');
const Image = require('mongoose').model('Image');

const app = express();
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authorization checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.get('/explorer',(req,res)=>{
    Image.find({}, function(err, images) {
      if (err) { return res.status(401).end(); }
        res.status(200).json({images : images,
                              profile: false});
    });
});


// start the server
app.listen(port, () => {
  console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});
