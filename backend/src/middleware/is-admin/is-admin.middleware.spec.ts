import { IsAdminGuard } from './is-admin-guard.service';

describe('IsAdminMiddleware', () => {
  it('should be defined', () => {
    expect(new IsAdminGuard()).toBeDefined();
  });
});
