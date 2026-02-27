import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface ImageMetadata {
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

export interface ProcessedImage {
  base64: string;
  metadata: ImageMetadata;
}

// Image constraints
export const IMAGE_CONSTRAINTS = {
  MIN_WIDTH: 400,
  MIN_HEIGHT: 300,
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 3000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  COMPRESSION_QUALITY: 70, // 0-100, lower = smaller
  RESIZE_MAX: 1200, // Max dimension for resizing
};

/**
 * Validates image dimensions and size
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @param fileSizeBytes File size in bytes
 * @throws Error if validation fails
 */
export const validateImageDimensions = (
  width: number,
  height: number,
  fileSizeBytes: number
): void => {
  if (width < IMAGE_CONSTRAINTS.MIN_WIDTH || height < IMAGE_CONSTRAINTS.MIN_HEIGHT) {
    throw new Error(
      `Image dimensions too small (${width}x${height}px). ` +
      `Minimum required: ${IMAGE_CONSTRAINTS.MIN_WIDTH}x${IMAGE_CONSTRAINTS.MIN_HEIGHT}px`
    );
  }

  if (width > IMAGE_CONSTRAINTS.MAX_WIDTH || height > IMAGE_CONSTRAINTS.MAX_HEIGHT) {
    throw new Error(
      `Image dimensions too large (${width}x${height}px). ` +
      `Maximum allowed: ${IMAGE_CONSTRAINTS.MAX_WIDTH}x${IMAGE_CONSTRAINTS.MAX_HEIGHT}px`
    );
  }

  if (fileSizeBytes > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    const sizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Image file size too large (${sizeMB}MB). ` +
      `Maximum allowed: ${IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }
};

/**
 * Processes image: validates, compresses, and extracts metadata
 * Supports JPEG, PNG, WebP, GIF
 * @param file Express.Multer.File object
 * @returns ProcessedImage with compressed Base64 and metadata
 */
export const processProductImage = async (file: Express.Multer.File): Promise<ProcessedImage> => {
  try {
    // Read file buffer
    const fileBuffer = fs.readFileSync(file.path);

    // Get original image metadata
    const imageMetadata = await sharp(fileBuffer).metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    // Validate constraints
    validateImageDimensions(imageMetadata.width, imageMetadata.height, file.size);

    // Compress image
    const compressedBuffer = await compressImage(fileBuffer, file.mimetype);

    // Convert to Base64 with data URI
    const base64 = `data:${file.mimetype};base64,${compressedBuffer.toString('base64')}`;

    // Return processed image with metadata
    return {
      base64,
      metadata: {
        width: imageMetadata.width,
        height: imageMetadata.height,
        mimeType: file.mimetype,
        sizeBytes: compressedBuffer.length,
      },
    };
  } catch (error: any) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Compresses image using Sharp
 * Reduces file size by 60-80% while maintaining quality
 * @param buffer Image file buffer
 * @param mimeType MIME type (image/jpeg, etc.)
 * @returns Compressed image buffer
 */
export const compressImage = async (
  buffer: Buffer,
  mimeType: string
): Promise<Buffer> => {
  let pipeline = sharp(buffer);

  // Resize if too large
  const metadata = await sharp(buffer).metadata();
  if (metadata.width && metadata.width > IMAGE_CONSTRAINTS.RESIZE_MAX) {
    pipeline = pipeline.resize(IMAGE_CONSTRAINTS.RESIZE_MAX, IMAGE_CONSTRAINTS.RESIZE_MAX, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Compress based on format
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return pipeline
      .jpeg({ quality: IMAGE_CONSTRAINTS.COMPRESSION_QUALITY, progressive: true })
      .toBuffer();
  } else if (mimeType === 'image/png') {
    return pipeline
      .png({ quality: IMAGE_CONSTRAINTS.COMPRESSION_QUALITY, progressive: true })
      .toBuffer();
  } else if (mimeType === 'image/webp') {
    return pipeline
      .webp({ quality: IMAGE_CONSTRAINTS.COMPRESSION_QUALITY })
      .toBuffer();
  } else if (mimeType === 'image/gif') {
    // GIFs don't compress well with quality parameter
    return pipeline.toBuffer();
  }

  return pipeline.toBuffer();
};

/**
 * Gets image metadata without full processing
 * Useful for getting dimensions from existing Base64 or file
 * @param buffer Image buffer or Base64 data
 * @returns Image metadata (width, height, format)
 */
export const getImageMetadata = async (buffer: Buffer) => {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
  };
};

/**
 * Deletes image file from disk
 * @param filePath File path to delete
 */
export const deleteImageFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Formats file size to human readable format
 * @param bytes File size in bytes
 * @returns Formatted size string (e.g., "250 KB", "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculates compression ratio
 * @param originalSize Original file size in bytes
 * @param compressedSize Compressed file size in bytes
 * @returns Compression percentage (0-100)
 */
export const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};
