import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Cloudinary image uploader.
 *
 * Files are held in memory by multer (never touch local disk), then streamed
 * straight to Cloudinary. We return the secure CDN URL, which is directly
 * usable by <img src> and survives container rebuilds.
 *
 * Config comes from CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
 * CLOUDINARY_API_SECRET (see .env). Configured once at module load.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? 'threadly';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png|webp|gif|avif)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File | undefined): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file');

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
        (err, res) => {
          if (err || !res) {
            return reject(err ?? new Error('Cloudinary upload returned no result'));
          }
          resolve(res);
        },
      );
      stream.end(file.buffer);
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Upload failed';
      throw new InternalServerErrorException(`Image upload failed: ${message}`);
    });

    return { url: result.secure_url };
  }
}
