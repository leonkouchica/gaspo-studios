import { defineEventHandler } from "h3";
import { handleUniversalOg } from "./og/[...path].ts";

export default defineEventHandler(handleUniversalOg);
