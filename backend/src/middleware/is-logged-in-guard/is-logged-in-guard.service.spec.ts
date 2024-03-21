import { Test, TestingModule } from '@nestjs/testing';
import { IsLoggedInGuardService } from './is-logged-in-guard.service';

describe('IsLoggedInGuardService', () => {
  let service: IsLoggedInGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsLoggedInGuardService],
    }).compile();

    service = module.get<IsLoggedInGuardService>(IsLoggedInGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
