import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { Server } from "http";

describe("AppController (e2e)", () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/csrf (POST)", async () => {
    const response = await request(app.getHttpServer()).post("/csrf").expect(201);

    expect(response.body.data).toHaveProperty("csrfToken");
    expect(typeof response.body.data.csrfToken).toBe("string");
  });
});
