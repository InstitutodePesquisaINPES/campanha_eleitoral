import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadPath = './uploads/documentos';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  getDocumentos(
    @Req() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.documentosService.getDocumentos(req.user.sub, tenantId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('titulo') titulo: string,
    @Body('tipo') tipo: string,
    @Body('descricao') descricao: string,
    @Req() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    const arquivoUrl = `/uploads/documentos/${file.filename}`;
    const fullDescricao = `${titulo}${descricao ? ' · ' + descricao : ''}`;

    return this.documentosService.createDocumento(
      {
        pessoaId: req.user.sub,
        arquivoUrl,
        tipoDocumento: tipo,
        descricao: fullDescricao,
        tamanho: file.size,
      },
      tenantId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.documentosService.removeDocumento(id, tenantId);
  }
}
