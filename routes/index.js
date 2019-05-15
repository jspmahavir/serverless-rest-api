const Router = require("express");
const todosController = require("../todos");
const convertController = require("../convert");
const router = new Router();

// PUBLIC ROUTES //

router.route("/list").get(todosController.list);
router.route("/encrypt").post(convertController.encryptText);
router.route("/decrypt").post(convertController.decryptText);

module.exports = router;