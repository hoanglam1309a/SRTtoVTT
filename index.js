const express = require("express");
const app = express();
require("dotenv/config");
const { convert } = require("subtitle-converter");
const axios = require("axios").default;
const cors = require("cors");

app.use(cors({ origin: true }));

app.get("/", async (req, res) => {
  try {
    if (!req.query.url)
      return res.send("SRT to VTT Proxy. Params url is required");

    const response = await axios.get(encodeURI(req.query.url));

    if (!response.headers["content-type"].startsWith("application/x-subrip") && !response.headers["content-type"].startsWith("srt"))
      return res.status(400).send("Invalid content type");

    const { subtitle } = convert(response.data, ".vtt");

    if (!subtitle) return res.status(400).send("Cannot convert");

    res.setHeader("content-type", "text/vtt");

    res.send(subtitle);
  } catch (error) {
    console.log(error);
    if (!res.headerSent) res.sendStatus(500);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
