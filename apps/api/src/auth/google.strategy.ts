import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@api/users/schema/user.schema';
import { RoleService } from '@api/roles/role.service';
import { EmailService } from '@api/email/email.service';
import { EmailTemplateType } from '@api/email/schema/email-template.schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private roleService: RoleService,
    private emailService: EmailService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      // callbackURL: 'http://localhost:3001/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    let user = await this.userModel.findOne({ googleId: profile.id }).exec();

    if (!user) {
      const userRole = await this.roleService.findOneByName('user');

      let firstName = profile.displayName;
      let lastName = '';

      if (profile.name) {
        firstName = profile.name.givenName || '';
        lastName = profile.name.familyName || '';
      } else if (profile.displayName && profile.displayName.includes(' ')) {
        const nameParts = profile.displayName.split(' ');
        lastName = nameParts.pop() || '';
        firstName = nameParts.join(' ');
      }

      user = new this.userModel({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: firstName,
        lastName: lastName,
        password: '',
        roles: userRole ? [userRole] : [],
        isEmailVerified: true,
        // avatar: profile.photos[0].value,
        // accessToken,
      });

      await user.save();

      await this.emailService.sendEmail({
        to: profile.emails[0].value,
        templateType: EmailTemplateType.WELCOME,
        templateData: {
          firstName: firstName,
          lastName: lastName,
          email: profile.emails[0].value,
          appName: this.configService.get('APP_NAME') || 'BroGlow',
          loginUrl: this.configService.get('PUBLIC_URL')
            ? `${this.configService.get('PUBLIC_URL')}/login`
            : '/login',
        },
      });
    }

    user = await this.userModel
      .findOne({ googleId: profile.id })
      .select('id firstName lastName email createdAt updatedAt')
      .populate({
        path: 'roles',
        populate: { path: 'permissions' },
      })
      .exec();

    done(null, { ...user?.toObject(), accessToken });
  }
}
