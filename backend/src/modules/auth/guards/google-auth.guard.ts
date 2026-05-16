import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: any) {
    const request = context.switchToHttp().getRequest();
    const role = request.query.role || 'PASSENGER';
    return {
      state: JSON.stringify({ role }),
    };
  }
}
