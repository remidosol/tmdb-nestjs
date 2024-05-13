import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { AppService } from "./app.service";
import { ConfigService } from "./config/config.service";
import { MovieService } from "./movie/movie.service";
import { makeMockMovie } from "./movie/test/stubs";
import { makeMockDiscoverMovieResponse, makeMockMovieDetailResponse } from "./tmdb-api/test/stubs";
import { TmdbApiService } from "./tmdb-api/tmdb-api.service";

type MockConfigService = {
  getOrThrow: jest.Mock;
};

describe("AppService", () => {
  let service: AppService;
  let configService: MockConfigService;
  let movieService: MovieService;
  let tmdbApiService: TmdbApiService;
  let mockResponse: Partial<Response>;

  const mockMovie = makeMockMovie();
  const mockDiscoverMovieRes = makeMockDiscoverMovieResponse();
  const mockMovieDetailRes = makeMockMovieDetailResponse();

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
        {
          provide: MovieService,
          useValue: {
            createMovie: jest.fn(),
          },
        },
        {
          provide: TmdbApiService,
          useValue: {
            discoverMovies: jest.fn(),
            getMovieDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<MockConfigService>(ConfigService);
    movieService = module.get<MovieService>(MovieService);
    tmdbApiService = module.get<TmdbApiService>(TmdbApiService);
    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === "CSRF_COOKIE_NAME") return "X-CSRF-TOKEN";
      if (key === "NODE_ENV") return "development"; // or 'production'
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("setCsrfToken", () => {
    it("should set a CSRF token as a cookie and return it", () => {
      const token = service.setCsrfToken(mockResponse as Response);

      expect(typeof token).toBe("string");
      expect(mockResponse.cookie).toHaveBeenCalledWith("X-CSRF-TOKEN", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
      });
    });
  });

  describe("mainGoal", () => {
    it("should fetch and create movies", async () => {
      jest.spyOn(tmdbApiService, "discoverMovies").mockResolvedValue(mockDiscoverMovieRes);
      jest.spyOn(tmdbApiService, "getMovieDetails").mockResolvedValue(mockMovieDetailRes);

      jest.spyOn(movieService, "createMovie").mockImplementation(() => Promise.resolve(mockMovie));

      const result = await service.mainGoal();

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual(mockMovie);
      expect(movieService.createMovie).toHaveBeenCalled();
    });

    it("should handle empty movie list", async () => {
      jest.spyOn(tmdbApiService, "discoverMovies").mockResolvedValue(null);
      jest.spyOn(tmdbApiService, "getMovieDetails").mockResolvedValue(null);

      const result = await service.mainGoal();
      expect(result).toEqual([]);
    });
  });
});
