const express = require("express");
const app = express();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

app.use(express.urlencoded({ extended: true }));

require("dotenv").config();

aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: BUCKET,

    key: (req, file, cb) => {
      // renameing the files

      cb(null, file.originalname);
    },
  }),
});

// uploads the file
app.post("/upload", upload.single("file"), async (req, res, next) => {
  // can be modifiyed according to your project
  res.send("Successfully uploaded " + req.file.location + " location!");
});

// this handler will get all the files from the server
app.get("/list", async (req, res) => {
  let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
  let x = r.Contents.map((item) => item.Key);

  // can be modifiyed according to your project
  res.send(x);
});

// downloads the file
app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  let x = await s3.getObject({ Bucket: BUCKET, Key: filename }).promise();

  // can be modifiyed according to your project
  res.send(x.Body);
});

// downloads the file
app.delete("/delete/:filename", async (req, res) => {
  const filename = req.params.filename;
  await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();

  //   can be modifiyed according to your project
  res.send("File Deleted Successfully");
});

// error handler

app.use((err, req, res, next) => {
  if (err.message) {
    res.status(500).send(err.message);
  } else {
    res.status(500).send("There was an error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
