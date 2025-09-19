import path from 'path';
import fs from 'fs';
import { createHash, randomBytes } from 'crypto';

interface IUploadType {
  name: string;
  mv: (destination: string) => Promise<void>;
  data?: Buffer;
}

export const uploadFile = async (
  file: IUploadType,
  destinationPath: string,
  allowedExtensions: string[]
): Promise<string> => {
  if (!file) {
    throw new Error('File not found', {
      cause: { status: 400, message: 'File not found' }
    });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(
      `upload-file error: Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`,
      {
        cause: {
          status: 400,
          message: `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`
        }
      }
    );
  }

  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
    console.log(`Created directory: ${destinationPath}`);
  }

  // Generate content hash for unique filename
  let fileHash;
  if (file.data) {
    fileHash = createHash('sha256')
      .update(file.data)
      .digest('hex')
      .slice(0, 16);
  } else {
    fileHash = `${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  const fileName = `thumbnail_${fileHash}${ext}`;
  const fullPath = path.join(destinationPath, fileName);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log('upload-file: Existing file with same hash deleted.');
  }

  try {
    const relativePath = path.join('/avatars', fileName);
    await file.mv(fullPath);
    return relativePath;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error while uploading file: ${errorMessage}`, {
      cause: {
        status: 500,
        message: `Error while uploading file: ${errorMessage}`
      }
    });
  }
};
