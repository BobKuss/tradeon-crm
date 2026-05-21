import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateInvoiceDto, QueryInvoicesDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { InvoicesService } from './invoices.service';

@Controller({ path: 'invoices', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  /** GET /api/v1/invoices?companyId=C01&status=issued&estadoVeriFactu=pendiente */
  @Get()
  @Roles('admin', 'finance', 'sales')
  findAll(@Query() query: QueryInvoicesDto) {
    return this.invoices.findAll(query);
  }

  /** GET /api/v1/invoices/:id */
  @Get(':id')
  @Roles('admin', 'finance', 'sales')
  findOne(@Param('id') id: string) {
    return this.invoices.findOne(id);
  }

  /** POST /api/v1/invoices */
  @Post()
  @Roles('admin', 'finance')
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoices.create(dto);
  }

  /** PATCH /api/v1/invoices/:id */
  @Patch(':id')
  @Roles('admin', 'finance')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoices.update(id, dto);
  }

  /**
   * POST /api/v1/invoices/:id/submit-verifactu
   * Envía la factura al sistema VeriFactu de AEAT (simulado en dev).
   */
  @Post(':id/submit-verifactu')
  @Roles('admin', 'finance')
  submitToAeat(@Param('id') id: string) {
    return this.invoices.submitToAeat(id);
  }
}
