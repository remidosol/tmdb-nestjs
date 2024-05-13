import { TmdbDiscoverMovieResponse, TmdbMovieDetailResponse } from "../../types";
import { faker } from "@faker-js/faker";
import { Genre } from "../../types/tmdb-common.types";

/**
 * Generates a mock discover movie api response.
 *
 * @returns  [`TmdbDiscoverMovieResponse`](../types/tmdb.response.ts)
 */
export const makeMockDiscoverMovieResponse = (): TmdbDiscoverMovieResponse => {
  const genreCount = faker.number.int({ min: 1, max: 5 });

  return {
    page: faker.number.int({ min: 1, max: 10 }),
    results: Array.from({ length: 20 }, () => ({
      id: +faker.string.numeric({ length: { min: 1, max: 5 } }),
      overview: faker.lorem.paragraph(),
      popularity: faker.number.float({ min: 0, max: 100, fractionDigits: 3 }),
      vote_average: faker.number.float({ min: 0, max: 10, fractionDigits: 1 }),
      vote_count: faker.number.int({ min: 0, max: 100000 }),
      release_date: faker.date.between({ from: "1931-01-01", to: "2024-05-11" }).toISOString().split("T")[0],
      genre_ids: Array.from({ length: genreCount }, () => faker.number.int({ min: 1, max: 1000 })),
      original_title: faker.lorem.words({ min: 1, max: 3 }),
      poster_path: faker.image.urlPicsumPhotos(),
      title: faker.lorem.words({ min: 1, max: 3 }),
      adult: faker.datatype.boolean(),
      backdrop_path: faker.system.filePath(),
      original_language: faker.location.countryCode(),
      video: faker.datatype.boolean(),
    })),
    total_pages: faker.number.int({ min: 1, max: 10 }),
    total_results: faker.number.int({ min: 1, max: 200 }),
  };
};

/**
 * Generates a mock movie detail api response.
 *
 * @returns  [`TmdbMovieDetailResponse`](../types/tmdb.response.ts)
 */
export const makeMockMovieDetailResponse = (): TmdbMovieDetailResponse => {
  const genreCount = faker.number.int({ min: 1, max: 5 });

  const genres: Genre[] = Array.from({ length: genreCount }, () => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.words({ min: 1, max: 2 }),
  }));

  return {
    id: +faker.string.numeric({ length: { min: 1, max: 5 } }),
    overview: faker.lorem.paragraph(),
    popularity: faker.number.float({ min: 0, max: 100, fractionDigits: 3 }),
    vote_average: faker.number.float({ min: 0, max: 10, fractionDigits: 1 }),
    vote_count: faker.number.int({ min: 0, max: 100000 }),
    release_date: faker.date.between({ from: "1931-01-01", to: "2024-05-11" }).toISOString().split("T")[0],
    original_title: faker.lorem.words({ min: 1, max: 3 }),
    poster_path: faker.system.filePath(),
    title: faker.lorem.words({ min: 1, max: 3 }),
    adult: faker.datatype.boolean(),
    backdrop_path: faker.system.filePath(),
    original_language: faker.word.noun(),
    video: faker.datatype.boolean(),
    genres,
    belongs_to_collection: {
      id: +faker.string.numeric({ length: { min: 1, max: 3 } }),
      name: faker.lorem.words({ min: 1, max: 3 }),
      poster_path: faker.system.filePath(),
      backdrop_path: faker.system.filePath(),
    },
    budget: faker.number.int({ min: 0, max: 100000000 }),
    homepage: faker.internet.url(),
    imdb_id: faker.internet.url(),
    production_companies: Array.from({ length: 5 }, () => ({
      id: faker.number.int({ min: 1, max: 1000 }),
      logo_path: faker.system.filePath(),
      name: faker.company.name(),
      origin_country: faker.location.countryCode(),
    })),
    production_countries: Array.from({ length: 5 }, () => ({
      iso_3166_1: faker.location.countryCode(),
      name: faker.location.country(),
    })),
    revenue: faker.number.int({ min: 0, max: 100000000 }),
    runtime: faker.number.int({ min: 0, max: 300 }),
    spoken_languages: Array.from({ length: 5 }, () => ({
      english_name: faker.location.country(),
      iso_639_1: faker.location.countryCode(),
      name: faker.location.country(),
    })),
    status: faker.lorem.words({ min: 1, max: 2 }),
    tagline: faker.lorem.words({ min: 1, max: 3 }),
  };
};
