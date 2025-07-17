import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';
import { CaslGuard } from '@casl/guards/casl.guard';
import { NullableType } from '@utils/types/nullable.type';
import { User } from '@users/domain/user';

import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthValidateEmailDto } from './dto/auth-validate-email.dto';
import { RegisterToHumanBookDto } from './dto/register-to-humanbook';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
    excludePrefixes: ['__'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: AuthRegisterLoginDto,
  ): Promise<RegisterResponseDto> {
    return this.service.register(createUserDto);
  }

  @Post('email/validate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async validateEmail(
    @Body() validateEmailDto: AuthValidateEmailDto,
  ): Promise<void> {
    return this.service.checkEmailExisted(validateEmailDto.email);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.id);
  }

  @Post('otp/resend')
  @HttpCode(HttpStatus.OK)
  async resendOTP(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<Pick<RegisterResponseDto, 'code'>> {
    return this.service.resendOTP(confirmEmailDto.id);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @Post('change/password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async changePassword(
    @Request() request,
    @Body() changePasswordDto: AuthChangePasswordDto,
  ): Promise<void> {
    await this.service.changePassword(request.user.id, changePasswordDto);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
    excludePrefixes: ['__'],
  })
  @Get('me')
  @CheckAbilities((ability) => ability.can(Action.Read, 'User'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @CheckAbilities((ability) => ability.can(Action.Update, 'User'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.service.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Patch('upgrade/me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public async upgradeAccount(
    @Request() request,
  ): Promise<User | { message: string } | null> {
    return this.service.upgradeAccout(request.user.id);
  }

  @ApiBearerAuth()
  @Post('register/human-books')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public registerToHumanBooks(
    @Request() request,
    @Body() createHumanBooksDto: RegisterToHumanBookDto,
  ): Promise<User | null> {
    return this.service.registerToHumanBook(
      request.user.id,
      createHumanBooksDto,
    );
  }
}
