import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", table => {
    table.uuid('id').defaultTo(knex.fn.uuid())
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("meals", table => {
    table.uuid('id').defaultTo(knex.fn.uuid())
    table.string("name").notNullable();
    table.string("description");
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("user");
    table.boolean("inDiet").notNullable();
    table.string("date").notNullable();
    table.string("hour").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
  await knex.schema.dropTable("meals");
}
