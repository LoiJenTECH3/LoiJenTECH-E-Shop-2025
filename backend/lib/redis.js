import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);




//const client = new Redis("rediss://default:AS_wAAIncDIxNDliMGJiYjEzOGY0MjAyOWU0YTUwYzBjNzhmMTY2NXAyMTIyNzI@big-duckling-12272.upstash.io:6379");
//await redis.set("foo", "bar");