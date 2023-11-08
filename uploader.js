const express = require("express");
const router = express.Router();
router.use(express.static("./html"))
module.exports = router

router.get('/webupload', function(req, res) {
	res.status(200).send('HELLO')
})