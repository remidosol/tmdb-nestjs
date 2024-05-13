import { SortBy, TmdbDiscoverMovieRequest } from "../../types";
import { faker } from "@faker-js/faker";

/**
 * Generates a mock discover movie api request.
 *
 * @returns  [`TmdbDiscoverMovieRequest`](../types/tmdb.request.ts)
 */
export const makeMockDiscoverMovieRequest = (): TmdbDiscoverMovieRequest => {
  const sortBy = faker.helpers.arrayElement<SortBy>([
    "primary_release_date.asc",
    "primary_release_date.desc",
    "original_title.asc",
    "original_title.desc",
    "popularity.desc",
    "popularity.asc",
    "revenue.desc",
    "revenue.asc",
    "title.desc",
    "title.asc",
    "vote_average.desc",
    "vote_average.asc",
    "vote_count.desc",
    "vote_count.asc",
    "vote_count.gte",
  ]);

  return {
    page: faker.number.int({ min: 1, max: 10 }),
    sortBy,
    watch_region: faker.location.countryCode(),
    with_watch_providers: faker.lorem.words({ min: 1, max: 3 }).split(" ").join(","),
  };
};
