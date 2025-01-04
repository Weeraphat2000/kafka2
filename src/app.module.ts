import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './schemas/cat.schemas';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),

    ConfigModule.forRoot({
      isGlobal: true, // ทำให้ ConfigModule ใช้ได้ทั่วทั้งแอป
      envFilePath: '.env', // ระบุไฟล์ .env (ค่าเริ่มต้นคือ .env)
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),

    ClientsModule.register([
      {
        name: 'OTHER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'other_service', // เพื่อเอาไว้ดู log ใน Kafka ง่ายขึ้น ว่าเป็น client ไหน
            brokers: ['localhost:9092'],
          },
          // consumer คือ บ่งบอกว่าเราจะใช้ Kafka ในการรับข้อมูล (ฝั่ง consumer)
          // consumer: {
          //   groupId: 'cat-consumer',
          // },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
// export class AppModule {}
export class AppModule implements OnModuleInit {
  constructor(
    @Inject('OTHER_SERVICE') private readonly otherService: ClientKafka,
  ) {}

  async onModuleInit() {
    // บอก NestJS ว่าเราจะ subscribe response ของ topic 'ping4'
    this.otherService.subscribeToResponseOf('ping4');

    // ควรทำการ connect ให้เสร็จ
    await this.otherService.connect();
  }
}
