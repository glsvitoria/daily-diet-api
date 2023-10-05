import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";

describe("Meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("pnpm knex -- migrate:rollback --all");
    execSync("pnpm knex -- migrate:latest");
  });

  it("should be able to create a new meal", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server)
      .post("/meals")
      .send({
        name: "Ovos",
        description: "Ovos mexidos",
        user_id: userId,
        inDiet: true,
        date: "10/10/2021",
        hour: "09:00",
      })
      .expect(201);
  });

  it("should be able to list the meals", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    await request(app.server).post("/meals").send({
      name: "Macarrão",
      description: "Macarrão com tomate",
      user_id: userId,
      inDiet: false,
      date: "25/03/2021",
      hour: "15:00",
    });

    const listMealsResponse = await request(app.server).get("/meals");

    expect(listMealsResponse.body.meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Ovos",
          description: "Ovos mexidos",
          user_id: userId,
          inDiet: 1,
          date: "10/10/2021",
          hour: "09:00",
        }),
        expect.objectContaining({
          name: "Macarrão",
          description: "Macarrão com tomate",
          user_id: userId,
          inDiet: 0,
          date: "25/03/2021",
          hour: "15:00",
        }),
      ]),
    );
  });

  it("should be able to list a specific meal", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    const listMealsResponse = await request(app.server).get("/meals");

    const mealId = listMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Ovos",
        description: "Ovos mexidos",
        user_id: userId,
        inDiet: 1,
        date: "10/10/2021",
        hour: "09:00",
      }),
    );
  });

  it("should be able to update a meal", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    const listMealsResponse = await request(app.server).get("/meals");

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: "Macarrão",
        description: "Macarrão com tomate",
        inDiet: false,
        date: "25/03/2021",
        hour: "15:00",
      })
      .expect(200);
  });

  it("should be able to delete a meal", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    const listMealsResponse = await request(app.server).get("/meals");

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server).delete(`/meals/${mealId}`).expect(200);
  });

  it("should be able to list all meals from a specific user", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    await request(app.server).post("/meals").send({
      name: "Macarrão",
      description: "Macarrão com tomate",
      user_id: userId,
      inDiet: false,
      date: "25/03/2021",
      hour: "15:00",
    });

    const listMealsResponse = await request(app.server).get(
      `/meals/user/${userId}`,
    );

    console.log(listMealsResponse.body);
    

    expect(listMealsResponse.body.meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Ovos",
          description: "Ovos mexidos",
          user_id: userId,
          inDiet: 1,
          date: "10/10/2021",
          hour: "09:00",
        }),
        expect.objectContaining({
          name: "Macarrão",
          description: "Macarrão com tomate",
          user_id: userId,
          inDiet: 0,
          date: "25/03/2021",
          hour: "15:00",
        }),
      ]),
    );
  });
});
