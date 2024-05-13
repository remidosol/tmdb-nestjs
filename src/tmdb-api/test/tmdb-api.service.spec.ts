import { Test, TestingModule } from "@nestjs/testing";
import { TmdbApiService } from "../tmdb-api.service";
import { ConfigService } from "../../config/config.service";
import { TmdbDiscoverMovieRequest, TmdbDiscoverMovieResponse, TmdbMovieDetailResponse } from "../types";
import { makeMockDiscoverMovieRequest, makeMockDiscoverMovieResponse, makeMockMovieDetailResponse } from "./stubs";
import mockAxios from "jest-mock-axios";

describe("TmdbApiService", () => {
  let service: TmdbApiService;
  let configService: ConfigService;

  const mockDiscoverMovieRequest: TmdbDiscoverMovieRequest = makeMockDiscoverMovieRequest();
  const mockDiscoverMovieResponse: TmdbDiscoverMovieResponse = makeMockDiscoverMovieResponse();
  const mockMovieDetailResponse: TmdbMovieDetailResponse = makeMockMovieDetailResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbApiService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case "NODE_ENV":
                  return "development";
                case "TMDB_BASE_URL":
                  return "https://api.example.com";
                case "TMDB_READ_ACCESS_TOKEN":
                  return "some-access-token";
                case "TMDB_API_KEY":
                  return "some-api-key";
                default:
                  return null;
              }
            }),
            get: jest.fn().mockReturnValue("some-access-token"),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbApiService>(TmdbApiService);
    configService = module.get<ConfigService>(ConfigService);
    mockAxios.reset();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("discoverMovies", () => {
    it("should return a list of movies on success", async () => {
      const promise = service.discoverMovies(mockDiscoverMovieRequest);

      const clientMessage = {
        data: mockDiscoverMovieResponse,
        status: 200,
      };

      expect(mockAxios.get).toHaveBeenCalledWith("/discover/movie", { params: mockDiscoverMovieRequest });

      mockAxios.mockResponse(clientMessage);

      await expect(promise).resolves.toEqual(mockDiscoverMovieResponse);
    });

    it("should return null on failure", async () => {
      const promise = service.discoverMovies(mockDiscoverMovieRequest);

      const clientMessage = {
        data: { message: "Not found" },
        status: 404,
      };

      expect(mockAxios.get).toHaveBeenCalledWith("/discover/movie", { params: mockDiscoverMovieRequest });

      mockAxios.mockResponse(clientMessage);

      await expect(promise).resolves.toBeNull();
    });
  });

  describe("getMovieDetails", () => {
    it("should return movie details on success", async () => {
      const promise = service.getMovieDetails(mockMovieDetailResponse.id.toString());

      const clientMessage = {
        data: mockMovieDetailResponse,
        status: 200,
      };

      expect(mockAxios.get).toHaveBeenCalledWith(`/movie/${mockMovieDetailResponse.id}`);

      mockAxios.mockResponse(clientMessage);

      await expect(promise).resolves.toEqual(mockMovieDetailResponse);
    });

    it("should return null on failure", async () => {
      const nonExistedMovieId = "159753444444";

      const promise = service.getMovieDetails(nonExistedMovieId);

      const clientMessage = {
        data: { message: "Not found" },
        status: 404,
      };

      expect(mockAxios.get).toHaveBeenCalledWith(`/movie/${nonExistedMovieId}`);

      mockAxios.mockError(clientMessage);

      await expect(promise).resolves.toBeNull();
    });
  });
});
