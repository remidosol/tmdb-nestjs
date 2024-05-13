import { Test, TestingModule } from "@nestjs/testing";
import { MovieController } from "../movie.controller";
import { MovieService } from "../movie.service";
import { Types } from "mongoose";
import { CreateMovieDto } from "../dto";
import { Movie } from "../schemas";
import { makeMockCreateMovieDto } from "./stubs";
import { Logger, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { NotFoundExceptionMessageKeys } from "../../common/error-message";
import { MovieRepository } from "../movie.repository";
import { getModelToken } from "@nestjs/mongoose";
import { CustomThrottlerGuard } from "../../common/guards";

type MockModel = {
  create: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  findOneAndDelete: jest.Mock;
  save: jest.Mock;
};

describe("MovieController", () => {
  let controller: MovieController;
  let service: MovieService;

  const mockCreateMovieDto: CreateMovieDto = makeMockCreateMovieDto();
  const mockMovieData: Movie = { ...mockCreateMovieDto, _id: new Types.ObjectId() };

  beforeEach(async () => {
    const modelMock: MockModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockMovieData]) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMovieData) }),
      findOneAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      save: jest.fn().mockReturnValue(mockMovieData),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        MovieService,
        MovieRepository,
        {
          provide: getModelToken(Movie.name),
          useValue: modelMock,
        },
        { provide: Logger, useValue: { error: jest.fn(), verbose: jest.fn() } },
      ],
    })
      .overrideProvider(Reflector)
      .useValue(new Reflector())
      .overrideGuard(CustomThrottlerGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);

    await module.init();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of movies", async () => {
      jest.spyOn(service, "getMovies").mockResolvedValue([mockMovieData]);

      expect(await controller.findAll()).toStrictEqual([mockMovieData]);
    });
  });

  describe("findById", () => {
    it("should return a single movie object", async () => {
      jest.spyOn(service, "findMovie").mockResolvedValue(mockMovieData);

      expect(await controller.findById(mockMovieData.id)).toBe(mockMovieData);
      expect(service.findMovie).toHaveBeenCalledWith(mockMovieData.id);
    });

    it("should return null if no movie with the specified ID is found", async () => {
      const nonExistentId = "999999";
      jest.spyOn(service, "findMovie").mockResolvedValue(null);

      const result = await controller.findById(nonExistentId);
      expect(result).toBeNull();
      expect(service.findMovie).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe("save", () => {
    it("should create and return the movie", async () => {
      jest.spyOn(service, "createMovie").mockImplementation(() => Promise.resolve(mockMovieData));

      expect(await controller.save(mockCreateMovieDto)).toBe(mockMovieData);
      expect(service.createMovie).toHaveBeenCalledWith(mockCreateMovieDto);
    });
  });

  describe("removeById", () => {
    it("should return the deleted movie object", async () => {
      jest.spyOn(service, "deleteMovie").mockImplementation(() => Promise.resolve(mockMovieData));

      expect(await controller.removeById(mockMovieData.id)).toBe(mockMovieData);
      expect(service.deleteMovie).toHaveBeenCalledWith(mockMovieData.id);
    });

    it("should throw if movie not found", async () => {
      const nonExistentId = "999999";

      jest
        .spyOn(service, "deleteMovie")
        .mockImplementation(() => Promise.reject(new NotFoundException(NotFoundExceptionMessageKeys.MOVIE_NOT_FOUND)));

      await expect(controller.removeById(nonExistentId)).rejects.toThrow(NotFoundException);
      expect(service.deleteMovie).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
