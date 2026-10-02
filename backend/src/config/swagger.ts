import path from "path";
import { fileURLToPath } from "url";
import swaggerjsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsPath = path.resolve(__dirname, "../docs/**/*.ts").replace(/\\/g, "/");

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fluxion API",
      version: "1.0.0",
      description:
        "A professional social media API built with Express, TS, and MongoDB",
      contact: {
        name: "Emad",
        url: "https://emad-site.vercel.app/",
        email: "emadahmeddev@gmail.com",
      },
      servers: [
        {
          url: "http://localhost:5000/",
        },
      ],
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication APIs",
      },
      {
        name: "Users",
        description: "User management APIs",
      },
      {
        name: "Posts",
        description: "Blog posts management APIs",
      },
      {
        name: "Comments",
        description: "Comments and Replies management APIs",
      },
      {
        name: "Notifications",
        description: "Notifications management APIs",
      },
      {
        name: "Stories",
        description: "Stories management APIs",
      },
      {
        name: "Chat",
        description: "Chat & Messaging APIs",
      },
    ],
  },
  apis: [docsPath],
};

const spacs = swaggerjsdoc(options);
export default spacs;
