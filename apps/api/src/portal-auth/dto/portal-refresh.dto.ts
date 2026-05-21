import { IsString } from 'class-validator';

export class PortalRefreshDto {
  @IsString()
  refreshToken: string;
}
