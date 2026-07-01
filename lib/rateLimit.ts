import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const ratelimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(10, "1 h"),

  analytics: true,

  prefix: "git-commit-generator",
});
