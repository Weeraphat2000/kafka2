import {
  Controller,
  // Inject,
  //  OnModuleInit
} from '@nestjs/common';

import { AppService } from './app.service';
import {
  // ClientKafka,
  EventPattern,
  // MessagePattern,
  // Payload,
} from '@nestjs/microservices';
import { log } from 'console';
import { Cat, UpdateCatDto } from './schemas/cat.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Cat.name) private readonly catModel: Model<Cat>,
  ) {}

  @EventPattern('cat_created')
  async handleCatCreated(data: Cat) {
    log('Cat created');
    log('time to save', new Date());
    log('data received', data);
    const cat = new this.catModel(data);
    log('cat', cat);
    await cat.save();
    log('cat saved', new Date());
  }

  @EventPattern('cat_deleted')
  async handleCatDeleted(id: string) {
    log('Cat deleted');
    log('time to delete', new Date());
    log('received id', id);

    if (!isValidObjectId(id)) {
      log('Invalid id', id);
      return 'Invalid id';
    }

    const cat = await this.catModel.findById(id);
    if (!cat) {
      log('Cat not found', id);
      return 'Cat not found';
    }

    if (cat) {
      log('Cat found', cat);
      await cat.deleteOne();
      log('time to delete', new Date());
    }
  }

  @EventPattern('cat_updated')
  async handleCatUpdated(data: UpdateCatDto) {
    log('Cat updated');
    log('time to update', new Date());
    log('data received', data);
    if (!isValidObjectId(data.id)) {
      log('Invalid id', data.id);
      return 'Invalid id';
    }

    const cat = await this.catModel.findById(data.id);
    if (!cat) {
      log('Cat not found', data.id);
      return 'Cat not found';
    }

    const { id, ...body } = data;
    log(id);

    log('Cat found', cat);
    cat.set(body);
    await cat.save();
    log('time to update', new Date());
  }
}
