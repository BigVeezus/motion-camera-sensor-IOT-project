const PiCamera = require("pi-camera");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const connectDB = require("./db");
const fs = require("fs");
// const gpio = require("pi-gpio");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const Notification = require("./notificationModel");
cloudinary.config({
  secure: true,
});
connectDB();
// console.log(cloudinary.config());

const myCamera = new PiCamera({
  mode: "video",
  output: `${__dirname}/video.h264`,
  width: 1920,
  height: 1080,
  timeout: 5000, // Record for 5 seconds
  nopreview: true,
});

gpio.open(11, "input", function (err) {
  // Open pin 11 for input
  gpio.read(11, function (err, value) {
    if (err) throw err;
    console.log(value); // The current state of the pin
    if (value == 1) {
      console.log("Motion detected");
      myCamera
        .record()
        .then((result) => {
          // Your video was captured
          console.log("video captured");
        })
        .catch((error) => {
          // Handle your error
          console.log(error);
        });

      // send video to database
    }
  });
});

var inFilename = "video.h264";
var outFilename = "video.mp4";

ffmpeg(inFilename)
  .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
  .save(outFilename);

let videoUrl = "";

const uploadVidToCloudninary = async () => {
  const vid = await cloudinary.uploader
    .upload("video.mp4", {
      resource_type: "video",
      public_id: "myfolder/mysubfolder/video",
    })
    .then((result) => {
      // console.log(result.url);
      // videoUrl = result.url;
      return result.url;
    });

  return vid;
};

async function getVidUrlandUploadToMongoDB() {
  videoUrl = await uploadVidToCloudninary();
  // console.log(videoUrl);
  const data = await Notification.create({
    videoUrl: videoUrl,
    latitude: "6.465422",
    longitude: "3.406448",
    status: "UNREAD",
  });
  console.log(data);
}

getVidUrlandUploadToMongoDB();
