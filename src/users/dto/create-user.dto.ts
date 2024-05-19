import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
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
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    example: [1, 2],
  })
  @Expose({ name: 'role_ids' })
  @IsArray()
  roleIds: number[];

  constructor(user: Partial<CreateUserDto>) {
    Object.assign(this, user);
  }
}
