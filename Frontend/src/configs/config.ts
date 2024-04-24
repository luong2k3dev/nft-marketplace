import { ConfigEnv } from "@/interface/contractInfo";
import { configDevelopment } from "./env/development";
import { configProduction } from "./env/production";

const env: string = process.env.APP_ENV || "development";

let config: ConfigEnv;

switch (env) {
  case "development":
    config = configDevelopment;
    break;
  case "production":
    config = configProduction;
    break;
  default:
    config = configDevelopment;
    break;
}

export default config;
