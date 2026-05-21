import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { Actor } from '../crm/crm.service';
import {
  ChangeVehicleStatusDto,
  CreateVehicleDto,
  QueryVehicleDto,
  UpdateVehicleDto,
} from './dto/vehicle.dto';
import { VehiclesService } from './vehicles.service';

interface JwtUser { sub: string; email: string; role: Role }

function toActor(user: JwtUser, req: Record<string, unknown>): Actor {
  const headers = req['headers'] as Record<string, string> | undefined;
  const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
  return { id: user.sub, email: user.email, role: user.role, ip: ip || undefined };
}

@Controller({ path: 'vehicles', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  // GET /api/v1/vehicles?status=available&make=BMW&search=X5&page=1&limit=25
  @Get()
  findAll(@Query() query: QueryVehicleDto) {
    return this.vehicles.findAll(query);
  }

  // GET /api/v1/vehicles/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicles.findOne(id);
  }

  // POST /api/v1/vehicles
  @Post()
  @Roles(Role.admin, Role.sales)
  create(
    @Body() dto: CreateVehicleDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.vehicles.create(dto, toActor(user, req));
  }

  // PATCH /api/v1/vehicles/:id
  @Patch(':id')
  @Roles(Role.admin, Role.sales)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.vehicles.update(id, dto, toActor(user, req));
  }

  // PATCH /api/v1/vehicles/:id/status  — quick status / archive action
  @Patch(':id/status')
  @Roles(Role.admin, Role.sales)
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeVehicleStatusDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.vehicles.changeStatus(id, dto, toActor(user, req));
  }
}
