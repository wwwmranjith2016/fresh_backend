import multer from "multer"; 
import path from "path";  
import fs from "fs";  
  
const storage = multer.diskStorage({  
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "products");  
    if (!fs.existsSync(uploadPath)) {  
      fs.mkdirSync(uploadPath, { recursive: true });  
    }  
    cb(null, uploadPath);  
  },  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);  
    const ext = path.extname(file.originalname);  
    const filename = `product-${uniqueSuffix}${ext}`;  
    cb(null, filename);  
  }  
}); 
  
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [  
    "image/jpeg",  
    "image/jpg",  
    "image/png",  
    "image/webp",  
    "image/gif"  
  ];  
  if (allowedMimeTypes.includes(file.mimetype)) {  
    cb(null, true);  
  } else {  
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));  
  }  
}; 
  
const upload = multer({  
  storage,  
  fileFilter,  
  limits: {  
    fileSize: 5 * 1024 * 1024, // 5MB  
    files: 1  
  }  
});  
  
export const uploadProductImage = upload.single("image");  
  
export const deleteFile = (filename: string): void => {
  const fullPath = path.join(process.cwd(), "uploads", "products", filename);  
  if (fs.existsSync(fullPath)) {  
    fs.unlinkSync(fullPath);  
  }  
};  
  
export const getFileUrl = (filename: string): string => {
  return `/uploads/products/${filename}`;  
}; 
