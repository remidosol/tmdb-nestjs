import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config.service";

describe("ConfigService", () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("isProduction", () => {
    it('should return true when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = "production";
      expect(service.isProduction).toBe(true);
    });

    it('should return false when NODE_ENV is not "production"', () => {
      process.env.NODE_ENV = "development";
      expect(service.isProduction).toBe(false);
    });
  });

  describe("isDevelopment", () => {
    it('should return true when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = "development";
      expect(service.isDevelopment).toBe(true);
    });

    it('should return false when NODE_ENV is not "development"', () => {
      process.env.NODE_ENV = "production";
      expect(service.isDevelopment).toBe(false);
    });
  });

  describe("isTest", () => {
    it('should return true when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = "test";
      expect(service.isTest).toBe(true);
    });

    it('should return false when NODE_ENV is not "test"', () => {
      process.env.NODE_ENV = "development";
      expect(service.isTest).toBe(false);
    });
  });
});
