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
    log(data);
    const cat = new this.catModel(data);
    await cat.save();
  }

  @EventPattern('cat_deleted')
  async handleCatDeleted(id: string) {
    log('Cat deleted');
    log(id);
    if (!isValidObjectId(id)) {
      return 'Invalid id';
    }

    const cat = await this.catModel.findById(id);
    if (!cat) {
      return 'Cat not found';
    }

    if (cat) {
      await cat.deleteOne();
    }
  }

  @EventPattern('cat_updated')
  async handleCatUpdated(data: UpdateCatDto) {
    log('Cat updated');
    log(data);
    if (!isValidObjectId(data.id)) {
      return 'Invalid id';
    }

    const cat = await this.catModel.findById(data.id);
    if (!cat) {
      return 'Cat not found';
    }

    const { id, ...body } = data;
    log(id);

    cat.set(body);
    await cat.save();
  }
}
