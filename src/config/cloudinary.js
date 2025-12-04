import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
// Parse CLOUDINARY_URL if individual variables are not set
let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

// If CLOUDINARY_URL is provided, parse it
if (!cloudName && process.env.CLOUDINARY_URL) {
  // Format: cloudinary://api_key:api_secret@cloud_name
  const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    apiKey = match[1];
    apiSecret = match[2];
    cloudName = match[3];
  }
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  // or: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match) {
    // Remove version prefix if present and return public_id
    return match[1];
  }
  
  // If it's just a public_id (no full URL), return as is
  if (!url.includes('http') && !url.includes('/')) {
    return url;
  }
  
  return null;
};

// Helper function to normalize Cloudinary URL for comparison
// Removes version numbers and transformations to get a consistent format for deduplication
export const normalizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;
    
    // If it's not a Cloudinary URL, return trimmed URL as is
    if (!trimmedUrl.includes('cloudinary.com')) {
      return trimmedUrl;
    }
    
    let normalized = trimmedUrl;
    
    // Remove version number from URL
    // Patterns: /upload/v1234567890/ -> /upload/
    //          /upload/v1234567890  -> /upload/
    normalized = normalized.replace(/\/upload\/v\d+(\/|$)/g, '/upload/');
    
    // Remove query parameters (transformations) by splitting on '?'
    normalized = normalized.split('?')[0];
    
    // Remove hash fragments
    normalized = normalized.split('#')[0];
    
    return normalized;
  } catch (error) {
    // If normalization fails, return trimmed original
    console.warn('Failed to normalize Cloudinary URL:', url, error.message);
    return url.trim();
  }
};

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return { success: false, error: 'No public ID provided' };
    
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok', result };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to delete multiple images
export const deleteImagesFromCloudinary = async (publicIds) => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return { success: true, deleted: [] };
  }
  
  try {
    const results = await cloudinary.api.delete_resources(publicIds, {
      type: 'upload',
      resource_type: 'image'
    });
    
    return {
      success: true,
      deleted: results.deleted || {},
      notFound: results.not_found || []
    };
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

export default cloudinary;
