import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
    constructor() {
        super({
            clientID: process.env['APPLE_CLIENT_ID'] || 'placeholder',
            teamID: process.env['APPLE_TEAM_ID'] || 'placeholder',
            keyID: process.env['APPLE_KEY_ID'] || 'placeholder',
            // Usar privateKeyString é recomendado para deploys em cloud (Vercel/Railway)
            privateKeyString: process.env['APPLE_PRIVATE_KEY']?.replace(/\\n/g, '\n') || 'placeholder',
            callbackURL: `${process.env['BACKEND_URL'] || 'https://api.nexrice.com'}/auth/apple/callback`,
            scope: ['email', 'name'],
            passReqToCallback: true,
        });
    }

    async validate(req: any, accessToken: string, refreshToken: string, idToken: string, profile: any, done: (err: any, user?: any) => void): Promise<any> {
        // A Apple só envia o 'profile' (com o nome) no primeiro login.
        // Nos logins seguintes, vem vazio, mas o email vem sempre no idToken (gerido internamente pelo passport-apple).
        
        let email = profile?.email;
        let name = profile?.name?.firstName 
            ? `${profile.name.firstName} ${profile.name.lastName || ''}` 
            : 'Utilizador Apple';

        // Se o profile principal não tiver email, podemos extrair do id_token JWT (o passport-apple costuma pôr no profile.id)
        if (!email && profile?.id) {
            email = profile.id;
        }

        const user = {
            email: email || 'apple-hidden-email@nexride.pt',
            name: name,
            accessToken,
            idToken,
        };
        
        done(null, user);
    }
}
