import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Actor, CrmService } from './crm.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ChangeDealStatusDto, CreateDealDto, LinkVehicleDto, UpdateDealDto } from './dto/deal.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

interface JwtUser { sub: string; email: string; role: Role }

function toActor(user: JwtUser, req: Record<string, unknown>): Actor {
  const headers = req['headers'] as Record<string, string> | undefined;
  const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
  return { id: user.sub, email: user.email, role: user.role, ip: ip || undefined };
}

@Controller({ path: 'crm', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  // ─── Companies ───────────────────────────────────────────────────────────────

  @Get('companies')
  listCompanies() {
    return this.crm.findAllCompanies();
  }

  @Get('companies/:id')
  getCompany(@Param('id') id: string) {
    return this.crm.findOneCompany(id);
  }

  @Post('companies')
  @Roles(Role.admin, Role.sales)
  createCompany(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.createCompany(dto, toActor(user, req));
  }

  @Patch('companies/:id')
  @Roles(Role.admin, Role.sales)
  updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.updateCompany(id, dto, toActor(user, req));
  }

  @Delete('companies/:id')
  @Roles(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCompany(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.deleteCompany(id, toActor(user, req));
  }

  // ─── Contacts ────────────────────────────────────────────────────────────────

  @Get('contacts')
  listContacts(@Query('companyId') companyId?: string) {
    return this.crm.findAllContacts(companyId);
  }

  @Post('contacts')
  @Roles(Role.admin, Role.sales)
  createContact(
    @Body() dto: CreateContactDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.createContact(dto, toActor(user, req));
  }

  @Patch('contacts/:id')
  @Roles(Role.admin, Role.sales)
  updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.updateContact(id, dto, toActor(user, req));
  }

  @Delete('contacts/:id')
  @Roles(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContact(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.deleteContact(id, toActor(user, req));
  }

  // ─── Deals ───────────────────────────────────────────────────────────────────

  @Get('deals/:id')
  getDeal(@Param('id') id: string) {
    return this.crm.findOneDeal(id);
  }

  @Get('deals')
  listDeals(@Query('companyId') companyId?: string) {
    return this.crm.findAllDeals(companyId);
  }

  @Post('deals')
  @Roles(Role.admin, Role.sales, Role.support)
  createDeal(
    @Body() dto: CreateDealDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.createDeal(dto, toActor(user, req));
  }

  @Patch('deals/:id')
  @Roles(Role.admin, Role.sales, Role.support)
  updateDeal(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.updateDeal(id, dto, toActor(user, req));
  }

  @Patch('deals/:id/status')
  @Roles(Role.admin, Role.sales, Role.support)
  changeDealStatus(
    @Param('id') id: string,
    @Body() dto: ChangeDealStatusDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.changeDealStatus(id, dto, toActor(user, req));
  }

  @Delete('deals/:id')
  @Roles(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDeal(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.deleteDeal(id, toActor(user, req));
  }

  /**
   * PUT /crm/deals/:id/vehicle
   * Links a vehicle to a deal. Enforces availability rules server-side.
   * Body: { vehicleId: string }
   */
  @Put('deals/:id/vehicle')
  @Roles(Role.admin, Role.sales, Role.support)
  linkVehicle(
    @Param('id') id: string,
    @Body() dto: LinkVehicleDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.linkVehicle(id, dto, toActor(user, req));
  }

  /**
   * DELETE /crm/deals/:id/vehicle
   * Removes the vehicle link from a deal (staff-only operation).
   */
  @Delete('deals/:id/vehicle')
  @Roles(Role.admin, Role.sales, Role.support)
  @HttpCode(HttpStatus.NO_CONTENT)
  unlinkVehicle(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.unlinkVehicle(id, toActor(user, req));
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  @Get('tasks')
  listTasks(
    @Query('dealId') dealId?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    return this.crm.findAllTasks(dealId, assignedUserId);
  }

  @Post('tasks')
  createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.createTask(dto, toActor(user, req));
  }

  @Patch('tasks/:id')
  updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.updateTask(id, dto, toActor(user, req));
  }

  @Delete('tasks/:id')
  @Roles(Role.admin, Role.sales)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.crm.deleteTask(id, toActor(user, req));
  }
}
