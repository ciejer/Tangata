const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth');
const Users = mongoose.model('Users');
const fs = require('fs');

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  // console.log(req.body);
  const { body: { user } } = req;
  Users.findOne({ 'email': user.email }, function(err, userLookup) {
    if (err) {
      res.status(422).json({
        errors: {
          user_lookup: err,
        },
      });
    }

    // check to see if theres already a user with that email
    if (userLookup) {
      res.status(422).json({
        errors: {
          email: 'already exists',
        },
      });
    } else {
      if(!user.email) {
        return res.status(422).json({
          errors: {
            email: 'is required',
          },
        });
      }
    
      if(!user.password) {
        return res.status(422).json({
          errors: {
            password: 'is required',
          },
        });
      }
    
      const finalUser = new Users(user);
    
      finalUser.setPassword(user.password);
      // console.log(finalUser.id);
      var userFolderDir = './user_folders';
      if (!fs.existsSync(userFolderDir)){
          fs.mkdirSync(userFolderDir); // ./user_folders is not created by Git, first user needs this
      }
      var userDir = './user_folders/'+finalUser.id;
      if (!fs.existsSync(userDir)){
          fs.mkdirSync(userDir);
      }
      fs.writeFileSync('./user_folders/'+finalUser.id+'/user.json', JSON.stringify(user.config), (err) => {
        if (err) throw err;
      });
    
      return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));
    }
  });
  
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return res.status(400).info;
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

router.get('/logout', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  // console.log("logging out");
  req.logout();
  res.send('Logout Success');
});

module.exports = router;