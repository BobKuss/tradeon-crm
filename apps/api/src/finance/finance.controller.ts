import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateDealProfitabilityDto } from './dto/deal-profitability.dto';
import { Actor, FinanceService } from './finance.service';

interface JwtUser { sub: string; email: string; role: Role }

function toActor(user: JwtUser, req: Record<string, unknown>): Actor {
  const headers = req['headers'] as Record<string, string> | undefined;
  const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
  return { id: user.sub, email: user.email, ip: ip || undefined };
}

@Controller({ path: 'finance', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.finance, Role.sales)
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  // ─── Staff users for buyer/seller dropdowns ───────────────────────────────

  @Get('users')
  getUsers() {
    return this.finance.getStaffUsers();
  }

  // ─── Deal profitability overview ──────────────────────────────────────────

  @Get('deal-profitability')
  @Roles(Role.admin, Role.finance)
  listDealProfitabilities() {
    return this.finance.listDealProfitabilities();
  }

  // ─── Single deal ──────────────────────────────────────────────────────────

  @Get('deal-profitability/:dealId')
  getDealProfitability(@Param('dealId') dealId: string) {
    return this.finance.getDealProfitability(dealId);
  }

  @Patch('deal-profitability/:dealId')
  updateDealProfitability(
    @Param('dealId') dealId: string,
    @Body() dto: UpdateDealProfitabilityDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.finance.updateDealProfitability(dealId, dto, toActor(user, req));
  }

  @Post('deal-profitability/:dealId/recalculate')
  @HttpCode(HttpStatus.OK)
  recalculateDealProfitability(
    @Param('dealId') dealId: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Record<string, unknown>,
  ) {
    return this.finance.recalculateDealProfitability(dealId, toActor(user, req));
  }
}
