import "reflect-metadata";
import { __prod__ } from "./constants";
import express from "express";
import { HelloResolver } from "./resolvers/hello";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
  // Creates typeorm connection
  await createConnection({
    type: "postgres",
    // TODO There you need to provide your credentials
    database: "some_name",
    // url: process.env.DATABASE_URL || "postgres://postgres:secret@localhost:5432/postgres",
    logging: true,
    // To perform auto-migrations
    synchronize: true,
    username: "root",
    // dropSchema: true,
    entities: [Post, User],
  });

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis({ lazyConnect: true });
  await redis.connect();

  app.set("trust proxy", 1);
  // TODO There CORS Policy needs to be updated
  app.use(
    cors({
      // TODO Replace this with domain name
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        // The problem is with the redis client types
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "this is a secret",
      resave: false,
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("Listening on port 4000");
  });
};

process.once("SIGUSR2", function () {
  process.kill(process.pid, "SIGUSR2");
});

process.on("SIGINT", function () {
  process.kill(process.pid, "SIGINT");
});

main().catch((err) => {
  console.error(err);
});
