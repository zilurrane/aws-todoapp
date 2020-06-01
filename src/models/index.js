// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Todo, User } = initSchema(schema);

export {
  Todo,
  User
};