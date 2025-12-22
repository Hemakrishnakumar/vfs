import { createClient } from "redis";
import { REDIS_CONNECTION_STRING } from "./constants.js";

const redisClient = createClient({
  url: REDIS_CONNECTION_STRING
});


redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;

export function testDup() {
  console.log("a");
  console.log("b");
  console.log("c");
  console.log("d");
  console.log("e");
}
