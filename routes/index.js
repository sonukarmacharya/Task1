const express = require("express");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");

const UserM = require("../models/Users");
const ProfileM = require("../models/Profile");
const router = express.Router();

/**using multer to store image */
router.use(express.static(__dirname + "./public/"));

var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: Storage,
}).single("file");

/**token */
if (typeof localStorage == "undefined" || localStorage == null) {
  const LocalStoraage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStoraage("./scratch");
}

/*login*/
router.post("/", (req, res) => {
  try {
    var email = req.body.email;
    var pass = req.body.pass;
    var checkUname = UserM.findOne({ email: email });
    checkUname.exec((err, data) => {
      try {
        if (err) throw err;
        var getId = data._id;
        var getPass = data.password;
        if (bcrypt.compare(pass, getPass)) {
          var token = jwt.sign({ userId: getId }, "loginToken");
          localStorage.setItem("userToken", token);
          localStorage.setItem("userId", getId);
          res.status(200).json({ message: "loggedin", token });
        } else {
          res.status(400).json({ message: "error" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*Register */
router.post(
  "/register",
  [check("pass").isLength({ min: 5 }), check("email").isEmail()],
  (req, res) => {
    try {
      var email = req.body.email;

      var emailExist = UserM.findOne({ email: email });
      const error = validationResult(req);
      emailExist.exec((err, data) => {
        if (data)
          return res.status(400).json({
            msg: "Email already exist",
          });
        if (!error.isEmpty()) {
          res.status(400).json({ msg: error });
        } else {
          const fname = req.body.fname;
          const lname = req.body.lname;
          const email = req.body.email;
          const pass = req.body.pass;
          const cpass = req.body.cpass;
          if (pass != cpass) {
            res.status(400).json({ msg: "password not match" });
          } else {
            const passHash = bcrypt.hashSync(pass, 10);
            var User = new UserM({
              first_name: fname,
              last_name: lname,
              email: email,
              password: passHash,
            });
            User.save(function (err, data) {
              if (err) throw err;
              res.status(400).json({
                msg: "Registered successfully",
                data,
              });
            });
          }
        }
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  }
);

/*Logout */
router.get("/logout", (req, res) => {
  localStorage.removeItem("userToken");
  res.json({ msg: "logout" });
});

/**profile  */
router.post("/profile", upload, (req, res) => {
  try {
    var loginId = localStorage.getItem("userId");
    var userToken = localStorage.getItem("userToken");

    var decoder = jwt.verify(userToken, "loginToken");
    if (decoder) {
      const imageFile = req.file.filename;
      const profile = new ProfileM({
        user_id: loginId,
        image: imageFile,
        address: req.body.add,
        phone: req.body.phone,
      });
      profile.save(function (err, data) {
        if (err) throw err;
        res.status(400).json({
          msg: "Inserted successfully",
          data,
        });
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/profile", upload, (req, res) => {
  try {
    var loginId = localStorage.getItem("userId");
    var userToken = localStorage.getItem("userToken");

    var decoder = jwt.verify(userToken, "loginToken");
    if (decoder) {
      const id = ProfileM.findOne({ user_id: loginId });
      id.exec((err, data) => {
        res.status(200).json({ data });
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
