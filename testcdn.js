const express = require("express");
const path = require("path");
const fs = require("fs");
const ipRangeCheck = require("ip-range-check");
const config = require("./config.json");
const adminusr = {
	name: config.adminuser,
	password: config.adminpass
};

const app = express();

passport.use(new LocalStrategy(
	(username, password, done) => {
		
		if(username !== adminusr.name) {
			//*ERR
			return done(null, false)
		} else if (password !== adminusr.password) {
			//*ERR
			return done(null, false)
		} else {
			return done(null, { username: username, password: password })
		}
	}
));
