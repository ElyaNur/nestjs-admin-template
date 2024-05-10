import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: format.cli(),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
        new transports.File({
          filename: `logs/info/${new Date().toISOString().split('T')[0]}combined.log`,
          level: 'info',
        }),
        new transports.File({
          filename: `logs/errors/${new Date().toISOString().split('T')[0]}error.log`,
          level: 'error',
        }),
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class CommonModule {}
