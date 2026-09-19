const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  transcribeVoiceAnswer,
} = require("../controllers/voiceController");


/*
========================================
Multer Memory Storage
========================================
*/

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});


router.post(
  "/transcribe",
  protect,
  upload.single("audio"),
  transcribeVoiceAnswer
);


module.exports = router;