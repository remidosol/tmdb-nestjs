import { Controller, Get, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { AppService } from "./app.service";
import { CustomThrottlerGuard } from "./common/guards";
import { TransformResponseInterceptor } from "./common/interceptors";
import { Movie } from "./movie/schemas";
import { ApiCookieAuth, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { findAllResponse } from "./movie/movie.swagger";

@Controller()
@ApiTags("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/csrf")
  @UseGuards(CustomThrottlerGuard)
  @UseInterceptors(TransformResponseInterceptor(Object))
  csrf(@Res({ passthrough: true }) res: Response) {
    return { csrfToken: this.appService.setCsrfToken(res) };
  }

  @Get("/main_goal")
  @UseGuards(CustomThrottlerGuard)
  @ApiCookieAuth()
  @ApiResponse(findAllResponse)
  @ApiSecurity({ "x-tmdb-nestjs-csrf": [] })
  @UseInterceptors(TransformResponseInterceptor(Movie))
  async mainGoal() {
    return this.appService.mainGoal();
  }
}
