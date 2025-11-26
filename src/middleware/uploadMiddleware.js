import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine uploads directory based on environment
// In serverless environments (like AWS Lambda), use /tmp
// Otherwise, use the project's uploads directory
const getUploadsDir = () => {
  // Check if we're in a serverless environment (common indicators)
  const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || 
                       process.env.VERCEL || 
                       process.env.LAMBDA_TASK_ROOT ||
                       !fs.existsSync(path.join(__dirname, '../../uploads'));
  
  if (isServerless) {
    // Use /tmp for serverless environments
    return path.join('/tmp', 'uploads', 'products');
  } else {
    // Use project directory for local/regular server environments
    return path.join(__dirname, '../../uploads/products');
  }
};

// Function to ensure directory exists (called lazily)
const ensureUploadsDir = () => {
  const uploadsDir = getUploadsDir();
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    // If directory creation fails, try /tmp as fallback
    if (!uploadsDir.startsWith('/tmp')) {
      const tmpDir = path.join('/tmp', 'uploads', 'products');
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        return tmpDir;
      } catch (tmpError) {
        console.error('Error creating /tmp uploads directory:', tmpError);
        throw new Error('Unable to create uploads directory');
      }
    }
    throw error;
  }
  return uploadsDir;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadsDir = ensureUploadsDir();
      cb(null, uploadsDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to handle multiple images (up to 5)
export const uploadProductImages = upload.array('images', 5);

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB per image.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 5 images allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field.'
      });
    }
  }
  if (err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next(err);
};

