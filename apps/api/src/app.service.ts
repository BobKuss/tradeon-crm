import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'TradEon CRM API',
      version: '0.0.1',
      status: 'ok',
    };
  }
}
