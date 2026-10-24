import { defineEventHandler } from "h3";
import { handleOgRequest } from "../og";

export default defineEventHandler(handleOgRequest);
