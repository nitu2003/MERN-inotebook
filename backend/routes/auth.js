const express = require("express");
const Users = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser.js');

const JWT_SECRET = 'NITUISAGOODGIRL';



//Route 1 create a user using POST "/aoi/auth/createuser".Doesnt require auth or login
router.post('/createuser', [
  body('email', 'Enter a valid email').isEmail(),
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('password', 'passwor must have 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  //if there are errors  return that request and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  //check whether theuser with this email exists already
  let user = await Users.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
    return res.status(400).json({ error: "Sorry a user with this email exists" })
  }
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt)

  //create new user 
  user = await Users.create({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
  })
  //.then(user=>res.json(user));
  const data = {
    user: {
      id: user.id
    }
  }

  const jwtData = jwt.sign(data, JWT_SECRET);
  console.log(jwtData);
  // res.json(user)
  res.json({ jwtData })

  try {

  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
})
//router 2 authenticate a user using:"/api/auth/login".no login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  //if there are errors  return that request and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Sorry user does not exists' });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: 'Please try to login with correct credentials' });
    }
    const data = {
      user: {
        idL: user.id
      }
    }
    const jwtData = jwt.sign(data, JWT_SECRET);
    res.json({ jwtData })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})
//ROUTE 3:Get logged in user details using:POST "/api/auth/grtuser".Login required
router.post('/getuser', fetchuser, async (req, res) => {

  try {
    userId = req.user.id;
    const user = await Users.findById(userId).select('-password')
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})
module.exports = router
