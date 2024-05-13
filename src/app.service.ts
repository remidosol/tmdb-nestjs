import { Injectable } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import crypto from "crypto";
import { Response } from "express";
import { MovieService } from "./movie/movie.service";
import { TmdbApiService } from "./tmdb-api/tmdb-api.service";
import { Movie } from "./movie/schemas";

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly movieService: MovieService,
    private readonly tmdbApiService: TmdbApiService
  ) {}

  /**
   * Use to generate csrf token
   *
   * @param res
   * @returns csrf token
   */
  setCsrfToken(res: Response): string {
    const token = crypto.randomBytes(256).toString("base64url");

    res.cookie(this.configService.getOrThrow("CSRF_COOKIE_NAME"), token, {
      httpOnly: true,
      sameSite: "strict",
      secure: this.configService.getOrThrow("NODE_ENV") === "production",
    });

    return token;
  }

  /**
   * Main goal of this case
   *
   * @returns persisted movies
   */
  async mainGoal(): Promise<Movie[]> {
    const response = await this.tmdbApiService.discoverMovies({
      sortBy: "primary_release_date.asc",
      "vote_average.gte": "8.4",
      "vote_count.gte": "1500",
      watch_region: "TR",
      with_watch_providers: "8",
    });

    if (!response) {
      return [];
    }

    const dataToBeFetched = response.results.slice(0, 5);

    const createdMovies = [];

    for (const movie of dataToBeFetched) {
      const movieDetail = await this.tmdbApiService.getMovieDetails(movie.id.toString());

      if (!movieDetail) {
        continue;
      }

      const createdMovie = await this.movieService.createMovie({
        id: movieDetail.id.toString(),
        name: movieDetail.title,
        overview: movieDetail.overview,
        releaseDate: movieDetail.release_date,
        voteAverage: movieDetail.vote_average,
        voteCount: movieDetail.vote_count,
        genres: movieDetail.genres.map((genre) => ({ id: genre.id, name: genre.name })),
        popularity: movieDetail.popularity,
      });

      createdMovies.push(createdMovie);
    }

    return createdMovies;
  }
}
