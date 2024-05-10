import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'charis.aceh@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'charis',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 70)
  username: string;

  @ApiProperty({
    example: 'chariselyasa',
  })
  @IsNotEmpty()
  @IsString()
  @Exclude({ toPlainOnly: true })
  password: string;

  constructor(user: Partial<CreateUserDto>) {
    Object.assign(this, user);
  }
}
