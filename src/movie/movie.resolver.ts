import { Resolver, Query, Args } from "@nestjs/graphql";
import { MovieService } from "./movie.service";
import { Movie } from "./schemas";

@Resolver()
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @Query(() => Movie, { name: "findById" })
  async findById(@Args("id") id: string): Promise<Movie | null> {
    return this.movieService.findMovie(id);
  }
}
