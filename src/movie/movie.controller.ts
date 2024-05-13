import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiExtraModels,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { ApiException } from "../common/api-exception.swagger";
import { OrderDto, orderRequestQuery } from "../common/filter";
import { CustomThrottlerGuard } from "../common/guards";
import { TransformResponseInterceptor } from "../common/interceptors";
import { MongoExceptionFilter } from "../common/mongo/mongo-exception.filter";
import { CreateMovieDto, GenreDto } from "./dto";
import { MovieService } from "./movie.service";
import { commonResponse, findAllResponse } from "./movie.swagger";
import { Movie } from "./schemas/movie.schema";

@UseFilters(MongoExceptionFilter)
@ApiCookieAuth()
@ApiSecurity({ "x-tmdb-nestjs-csrf": [] })
@ApiTags("movie")
@ApiBadRequestResponse({ type: ApiException })
@UseGuards(CustomThrottlerGuard)
@Controller("movie")
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiQuery(orderRequestQuery)
  @ApiResponse(findAllResponse)
  @ApiExtraModels(OrderDto)
  @UseInterceptors(TransformResponseInterceptor(Movie))
  async findAll(@Query("orderBy") orderBy?: OrderDto): Promise<Movie[]> {
    return this.movieService.getMovies(
      orderBy?.field && orderBy?.order ? { [orderBy.field]: orderBy.order === "asc" ? 1 : -1 } : undefined
    );
  }

  @Get("/:movieId")
  @ApiParam({ name: "movieId", example: "55" })
  @ApiResponse(commonResponse)
  @UseInterceptors(TransformResponseInterceptor(Movie))
  async findById(@Param("movieId") movieId: string): Promise<Movie | null> {
    return this.movieService.findMovie(movieId);
  }

  @Post()
  @ApiResponse(commonResponse)
  @ApiExtraModels(GenreDto)
  @UseInterceptors(TransformResponseInterceptor(Movie))
  async save(@Body() dto: CreateMovieDto): Promise<Movie> {
    return this.movieService.createMovie(dto);
  }

  @Delete("/:movieId")
  @ApiResponse(commonResponse)
  @UseInterceptors(TransformResponseInterceptor(Movie))
  @ApiParam({
    required: true,
    name: "movieId",
    example: "55",
  })
  async removeById(@Param("movieId") movieId: string): Promise<Movie> {
    return this.movieService.deleteMovie(movieId);
  }
}
