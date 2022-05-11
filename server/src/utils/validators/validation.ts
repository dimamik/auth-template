import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

export type validationResponse = {
  isValid: boolean;
  errors?: FieldError;
};
