import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CustomThrottlerGuard } from "./common/guards";
import { TransformResponseInterceptor } from "./common/interceptors";
import { makeMockMovies } from "./movie/test/stubs/movie.stub";

describe("AppController", () => {
  let controller: AppController;
  let appService: AppService;
  let mockResponse: Partial<Response>;

  const mockMovies = makeMockMovies(5);

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            setCsrfToken: jest.fn().mockReturnValue("mock-csrf-token"),
            mainGoal: jest.fn().mockReturnValue(mockMovies),
          },
        },
      ],
    })
      .overrideGuard(CustomThrottlerGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .overrideInterceptor(TransformResponseInterceptor)
      .useValue({ intercept: jest.fn((_, handler) => handler.handle()) })
      .compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("/csrf endpoint", () => {
    it("should set a CSRF token and return it", async () => {
      const result = await controller.csrf(mockResponse as Response);

      expect(result).toEqual({ csrfToken: "mock-csrf-token" });
      expect(appService.setCsrfToken).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe("/main_goal endpoint", () => {
    it("should return an array of movies", async () => {
      jest.spyOn(appService, "mainGoal").mockResolvedValue(mockMovies);

      const result = await controller.mainGoal();
      expect(result).toEqual(mockMovies);
      expect(appService.mainGoal).toHaveBeenCalled();
    });
  });
});
