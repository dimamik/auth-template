import argon2 from "argon2";
import { MyExpressContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import sendEmail from "../utils/sendEmail";
import { isEmail, validateEmail } from "../utils/validators/validateEmail";
import { validatePassword } from "../utils/validators/validatePassword";
import { validateUserName } from "../utils/validators/validateUserName";
import { FieldError } from "../utils/validators/validation";

@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // There we add mutations or queries
  // And we are declaring the type the query returns

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyExpressContext
  ): Promise<UserResponse> {
    // Validate password
    let validationResult = validatePassword(newPassword);
    if (!validationResult.isValid) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password is not valid",
          },
        ],
      };
    }
    // Validate token

    const tokenPathRedis = FORGET_PASSWORD_PREFIX + token;

    let userId = await redis.get(tokenPathRedis);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired or invalid",
          },
        ],
      };
    }
    // Validate user and change password
    const userIdNumber = parseInt(userId);
    const user = await User.findOne({ id: userIdNumber });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await redis.del(tokenPathRedis);

    await User.update(
      { id: userIdNumber },
      {
        password: await argon2.hash(newPassword),
      }
    );

    // log in user after changing password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyExpressContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // User is not in the database (but we are not telling the user that)
      return true;
    }
    // TODO Send email with token to reset password :)

    // For that we generate a token, store it in redis, and send it to the user
    // Then listen on the endpoint for that token

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 day expiration

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyExpressContext): Promise<User | null> {
    const userId = req.session!.userId;
    if (!userId) {
      return null;
    }
    const user = await User.findOne({ id: userId });
    if (!user) {
      return null;
    }
    return user;
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyExpressContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async user(@Arg("id") id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("userInput") userInput: UserInput,
    @Ctx() { req }: MyExpressContext
  ): Promise<UserResponse> {
    // Do some validation
    let validationResult = validateUserName(userInput.username);
    if (!validationResult.isValid) {
      return {
        errors: [validationResult.errors!],
      };
    }

    validationResult = validateEmail(userInput.email);
    if (!validationResult.isValid) {
      return {
        errors: [validationResult.errors!],
      };
    }

    validationResult = validatePassword(userInput.password);
    if (!validationResult.isValid) {
      return {
        errors: [validationResult.errors!],
      };
    }

    // Check if username is already taken
    // TODO Consider if this is safe
    let oldUser = await User.findOne({
      username: userInput.username,
    });
    if (oldUser) {
      return {
        errors: [
          {
            field: "username",
            message: "username already taken",
          },
        ],
      };
    }
    // Check if email is already taken
    oldUser = await User.findOne({ where: { email: userInput.email } });
    if (oldUser) {
      return {
        errors: [
          {
            field: "email",
            message: "email already taken",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(userInput.password);
    try {
      // Alternative is below
      const user = await User.create({
        username: userInput.username,
        password: hashedPassword,
        email: userInput.email,
      }).save();

      // const result = await getConnection()
      //   .createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values({
      //     username: userInput.username,
      //     password: hashedPassword,
      //     email: userInput.email,
      //   })
      //   .returning("*")
      //   .execute();

      // // TODO This is a bad practise imho
      // user = result.raw[0];

      console.log("user: ", user);
      req.session!.userId = user.id;

      return {
        user: user,
      };
    } catch (err) {
      console.log("message: " + err.message);
      return {
        errors: [
          {
            field: "unknown",
            message: "unexpected error",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyExpressContext
  ): Promise<UserResponse> {
    let user: User | null | undefined = null;
    if (isEmail(usernameOrEmail)) {
      // email
      const validationResult = validateEmail(usernameOrEmail);
      if (!validationResult.isValid) {
        return {
          errors: [validationResult.errors!],
        };
      }
      user = await User.findOne({ email: usernameOrEmail });
    } else {
      // username
      const validationResult = validateUserName(usernameOrEmail);
      if (!validationResult.isValid) {
        return {
          errors: [validationResult.errors!],
        };
      }
      user = await User.findOne({ username: usernameOrEmail });
    }

    // Check if username is already taken
    if (!user) {
      //  TODO Don't reveal to client users
      return {
        errors: [
          {
            field: "username",
            message: "there is no such user",
          },
        ],
      };
    }
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }
    req.session.userId = user.id;

    return {
      user,
    };
  }
}
