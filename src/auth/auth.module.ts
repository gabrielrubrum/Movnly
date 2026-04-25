import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DriverController } from './driver.controller';
import { AdminController } from './admin.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { AppleStrategy } from './apple.strategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env['JWT_SECRET'] || 'super-secret-key-change-me-in-production',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AuthController, DriverController, AdminController],
    providers: [AuthService, JwtStrategy, GoogleStrategy, AppleStrategy],
    exports: [AuthService],
})
export class AuthModule { }
