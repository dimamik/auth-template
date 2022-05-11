# First use
## Should have
- PostgreSQL up and running
- redis up and running

## Commands to run
Go to the server and run `yarn i`
Go to the client and run `yarn i`
Go to the server and run `yarn watch` & in other terminal `yarn dev`
Go to the client and run `yarn dev`


# Some usefull tips:

## package.json

```
    "watch": "tsc --watch",
    "dev": "nodemon dist/index.js",
    "start": "node dist/index.js",
    "start_tsnode": "ts-node src/index.ts",
    "dev_tsnode": "nodemon --exec ts-node src/index.ts"
```

Some comments:

- ts-node is slow, so we need to compile to js and run js
- nodemon is watching for changes and restarting node.js
- tsc is watching for changes and recompiling our typescript

# VS Code Extensions

- GraphQL for VS Code
- Bracket Pair Colorizer
- Docker
- Prettier

# PostgreSQL

There we can create user or use default

```
sudo su - postgres
psql
```

Configuring POSTGRESQL on Linux:
https://stackoverflow.com/questions/11919391/postgresql-error-fatal-role-username-does-not-exist

## Postgre Table flow

https://www.postgresqltutorial.com/postgresql-show-tables/


# Mikro-orm
- Be careful, migrations are copied to dist folder, you need to remove them as well to have normal workflow!!!
- https://mikro-orm.io/docs/migrations#migration-class



# GraphQL && apollo

yarn add apollo-server-express graphql type-graphql

In graphql we can instead of throwing errors we can return them

## Some facts

- Query is for getting data
- Mutation is for changing data

# TypeScript

- The :? in that position marks the property optional.
- The :! in that position is the definite assignment assertion. It's sort of a declaration-level version of the non-null assertion operator, but used on a property (can also be used on variables) rather than on an expression.

# Hashing passwords

- bcrypt vs argon (argon is somehow better)

# Redis

Is used for storing sessions and caching like hashmap

# Chakra

```
yarn create next-app --example with-chakra-ui-typescript with-chakra-ui-typescript-app
```

# Urql Data Policy

https://formidable.com/open-source/urql/docs/graphcache/cache-updates/

## dedupExchange

Client-side data deduplication is a data deduplication technique that is used on the backup-archive client to remove redundant data during backup and archive processing before the data is transferred to the Tivoli Storage Manager server. Using client-side data deduplication can reduce the amount of data that is sent over a local area network.

Server-side data deduplication is a data deduplication technique that is done by the server. The Tivoli Storage Manager administrator can specify the data deduplication location (client or server) to use with the DEDUP parameter on the REGISTER NODE or UPDATE NODE server command.

## cacheExchange

Policy on how to update Cache when mutation is executed

# Fragments GraphQL

Framgents are used to extract query params we want to get to a single class (fragment)
Like a RegularUserFragment in this example

# Next-urql setup for Server Side Rendering (SSR)




# Why CORS?
The Same Origin Policy (which CORS allows you to punch selective holes through) prevents third party sites from masquerading as a user in order to read (private) data from another site.

# What is CSRF
A Cross Site Request Forgery attack is when a third party site masquerades as a user to submit data to another site (as that user). It doesn't need to read the response back.



# Password reset

## uuid and ioredis for redis client
