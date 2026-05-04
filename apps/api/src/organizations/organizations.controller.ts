import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { Actor } from '../crm/crm.service';
import { CreateOrganizationDto } from './dto/organization.dto';
import { OrganizationsService } from './organizations.service';

interface JwtUser { sub: string; email: string; role: Role }

function toActor(user: JwtUser, req: Record<string, unknown>): Actor {
  const headers = req['headers'] as Record<string, string> | undefined;
  const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
  return { id: user.sub, email: user.email, role: user.role, ip: ip || undefined };
}

@Controller({ path: 'organizations', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  // GET /api/v1/organizations
  @Get()
  findAll() {
    return this.organizations.findAll();
  }

  // GET /api/v1/organizations/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizations.findOne(id);
  }

  // POST /api/v1/organizations
  @Post()
  @Roles(Role.admin, Role.sales)
  create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.organizations.create(dto, toActor(user, req));
  }
}
