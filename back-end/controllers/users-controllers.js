const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async(req, res, next) => {
  let users;
  try{
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError('Fetching users failed, try again later', 500);
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});
};

const signup = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
      return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    
    const {name, email, password} = req.body;
    
    let existingUser;
    try{
      existingUser = await User.findOne({email})
    } catch (err) {
      const error = new HttpError('Signing up failed, please try again later', 500);
      return next(error);
    }

    if(existingUser){
      const error = new HttpError('User exists already, Please login instead', 422);
      return next(error);
    }
    const createdUser = new User({
        name,
        email,
        image: 'https://resize.hswstatic.com/w_907/gif/lion.jpg',
        password,
        places: []
    });

    
    try{
      await createdUser.save();
    }catch(err){
     const error = new HttpError('signin up has failed :(', 500)
     return next(error)
    }
    res.status(201).json({user: createdUser.toObject({getters: true})});
};

const login = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try{
      existingUser = await User.findOne({email})
    } catch (err) {
      const error = new HttpError('Login in failed, please check your credentials', 500);
      return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
      const error = new HttpError('Could not identify user, credentials seem to be wrong.', 401);
      return next(error);
    }
  
    res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;