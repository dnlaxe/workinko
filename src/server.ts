import app from "./app.js";
import { config } from "./config/config.js";

app.listen(config.port, () => {
  console.log({ port: config.port }, "Server listening on port");
});
