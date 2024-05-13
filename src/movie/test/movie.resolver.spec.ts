import { Test, TestingModule } from "@nestjs/testing";
import { MovieResolver } from "../movie.resolver";
import { MovieService } from "../movie.service";
import { makeMockMovie } from "./stubs";
import { Movie } from "../schemas";

describe("MovieResolver", () => {
  let resolver: MovieResolver;
  let movieService: MovieService;

  const mockMovieData: Movie = makeMockMovie();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieResolver,
        {
          provide: MovieService,
          useValue: {
            findMovie: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<MovieResolver>(MovieResolver);
    movieService = module.get<MovieService>(MovieService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("findById", () => {
    it("should return a movie for a valid ID", async () => {
      jest.spyOn(movieService, "findMovie").mockResolvedValue(mockMovieData);

      const result = await resolver.findById(mockMovieData.id);
      expect(result).toEqual(mockMovieData);
      expect(movieService.findMovie).toHaveBeenCalledWith(mockMovieData.id);
    });

    it("should return null if no movie is found", async () => {
      jest.spyOn(movieService, "findMovie").mockResolvedValue(null);

      const result = await resolver.findById("nonexistent");
      expect(result).toBeNull();
      expect(movieService.findMovie).toHaveBeenCalledWith("nonexistent");
    });
  });
});
