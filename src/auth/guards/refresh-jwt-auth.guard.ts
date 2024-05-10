import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {}
