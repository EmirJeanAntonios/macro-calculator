import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, UpdateConfigDto } from './dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /api/admin/login
   * Admin login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.adminService.login(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /api/admin/records
   * Get all records with pagination
   */
  @UseGuards(JwtAuthGuard)
  @Get('records')
  async getAllRecords(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.adminService.getAllRecords(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /api/admin/records/:id
   * Get a single record by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get('records/:id')
  async getRecordById(@Param('id', ParseUUIDPipe) id: string) {
    const record = await this.adminService.getRecordById(id);
    if (!record) {
      throw new NotFoundException(`Record with ID "${id}" not found`);
    }
    return {
      success: true,
      data: record,
    };
  }

  /**
   * DELETE /api/admin/records/:id
   * Delete a record
   */
  @UseGuards(JwtAuthGuard)
  @Delete('records/:id')
  async deleteRecord(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.adminService.deleteRecord(id);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /api/admin/config
   * Get all configurations
   */
  @UseGuards(JwtAuthGuard)
  @Get('config')
  async getConfigurations() {
    const configs = await this.adminService.getAllConfigurations();
    return {
      success: true,
      data: configs,
    };
  }

  /**
   * PUT /api/admin/config
   * Update configurations
   */
  @UseGuards(JwtAuthGuard)
  @Put('config')
  async updateConfigurations(@Body() dto: UpdateConfigDto) {
    const configs = await this.adminService.updateConfigurations(dto);
    return {
      success: true,
      data: configs,
    };
  }
}

