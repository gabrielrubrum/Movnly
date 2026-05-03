import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { DriverController } from '../drivers/controllers/driver.controller';
import { AdminController } from '../admin/controllers/admin.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

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
