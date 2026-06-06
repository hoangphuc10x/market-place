import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Local-disk image uploader. Dev only — production swaps in R2/S3 by
 * replacing diskStorage with multer-s3 and the URL derivation below.
 *
 * Uploaded files land in <repo>/apps/api/uploads/. main.ts serves that
 * directory at /uploads/* statically so the URL we return is directly
 * usable by <img src>.
 */

// Resolve once at module load so the path is stable across requests.
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const PUBLIC_HOST =
  process.env.PUBLIC_API_URL ??
  `http://localhost:${process.env.API_PORT ?? process.env.PORT ?? 4000}`;

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase().slice(0, 8) || '.jpg';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png|webp|gif|avif)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File | undefined): { url: string } {
    if (!file) throw new BadRequestException('No file');
    return { url: `${PUBLIC_HOST}/uploads/${file.filename}` };
  }
}
