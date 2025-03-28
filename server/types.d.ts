declare module 'sharp' {
  interface SharpOptions {
    failOnError?: boolean;
  }

  interface SharpConstructor {
    (buffer: Buffer, options?: SharpOptions): Sharp;
    (input: string, options?: SharpOptions): Sharp;
  }

  interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
    position?: string | number;
    background?: {
      r: number;
      g: number;
      b: number;
      alpha?: number;
    };
    withoutEnlargement?: boolean;
    withoutReduction?: boolean;
    fastShrinkOnLoad?: boolean;
  }

  interface OutputOptions {
    quality?: number;
    progressive?: boolean;
    compressionLevel?: number;
    adaptiveFiltering?: boolean;
    force?: boolean;
  }

  interface Sharp {
    resize(options?: ResizeOptions): Sharp;
    jpeg(options?: OutputOptions): Sharp;
    png(options?: OutputOptions): Sharp;
    webp(options?: OutputOptions): Sharp;
    toFormat(format: string, options?: OutputOptions): Sharp;
    toBuffer(): Promise<Buffer>;
  }

  const sharp: SharpConstructor;
  export = sharp;
}

// Declarações para express-fileupload
declare module 'express-fileupload' {
  import { Request, Response, NextFunction } from 'express';

  interface FileUploadOptions {
    limits?: {
      fileSize?: number;
    };
    useTempFiles?: boolean;
    tempFileDir?: string;
    preserveExtension?: boolean | number;
    safeFileNames?: boolean | RegExp;
    abortOnLimit?: boolean;
    responseOnLimit?: string;
    limitHandler?: (req: Request, res: Response, next: NextFunction) => void;
    uploadTimeout?: number;
    parseNested?: boolean;
    debug?: boolean;
    createParentPath?: boolean;
  }

  interface FileArray {
    [fieldname: string]: UploadedFile[] | UploadedFile;
  }

  interface UploadedFile {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    mv(path: string, callback: (err: any) => void): void;
    mv(path: string): Promise<void>;
  }

  interface FileUploadRequestHandler {
    (options?: FileUploadOptions): (req: Request, res: Response, next: NextFunction) => any;
    (req: Request, res: Response, next: NextFunction): any;
  }

  const fileUpload: FileUploadRequestHandler;
  export = fileUpload;
}