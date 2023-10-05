import { Knex } from "knex";

declare module "knex/types/table" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      created_at: string;
      updated_at: string;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      user_id: string;
      inDiet: boolean;
      date: string;
      hour: string;
      created_at: string;
      updated_at: string;
    };
  }
}
