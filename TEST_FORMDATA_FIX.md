# FormData Image Upload Bug Fix - Testing Guide

## Issue Summary
The PUT endpoint `/api/products/{productId}` failed when receiving FormData with images, returning error:
```
HTTP 400 - {"error":"Cannot read properties of undefined (reading 'price')"}
```

## Root Cause
The multer middleware (configured in `fileUpload.util.ts`) was not applied to the product routes, so FormData/multipart requests were not being parsed. When Express received FormData without multer, `req.body` was undefined.

## Solution Implemented

### 1. Added Multer Middleware to Routes
**File**: `src/routes/product.routes.ts`
- Imported `uploadProductImage` middleware from `fileUpload.util.ts`
- Applied middleware to POST and PUT endpoints:
  ```typescript
  router.post('/', authMiddleware, uploadProductImage, productController.createProduct.bind(...))
  router.put('/:id', authMiddleware, uploadProductImage, productController.updateProduct.bind(...))
  ```

### 2. Enhanced FileUpload Utility
**File**: `src/utils/fileUpload.util.ts`
- Added `fileToDataUri()` function: Converts uploaded file to Base64 data URI
- Added `fileToDataUriAndDelete()` function: Converts to Base64 and deletes uploaded file from disk

### 3. Updated Product Controller
**File**: `src/controllers/product.controller.ts`
- Added import for `fileToDataUriAndDelete`
- Updated `createProduct()` method:
  - Checks for `req.file` from multer
  - Converts uploaded image to Base64 data URI
  - Stores in `data.image` field
- Updated `updateProduct()` method:
  - Same file handling as createProduct

### 4. Updated API Documentation
**File**: `docs/PRODUCT_API.md`
- Added FormData upload section with curl examples
- Documented supported formats and file size limits
- Provided examples for both POST and PUT endpoints

---

## Testing the Fix

### Prerequisites
1. Get auth token from login endpoint
2. Have a test image file (PNG, JPEG, WebP, or GIF)
3. Have a valid test product ID and category/unit IDs

### Test 1: Create Product with FormData Image

**With Curl**:
```bash
curl -X POST "https://fresh-backend-avtq.onrender.com/api/products" \
  -H "Authorization: Bearer {accessToken}" \
  -F "name=Test Chicken Breast" \
  -F "description=Premium quality boneless chicken breast" \
  -F "price=280.50" \
  -F "categoryId=0e778c3a-6abc-46b3-b796-2be0f707678d" \
  -F "unitId=96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d" \
  -F "available=true" \
  -F "image=@C:/path/to/image.png"
```

**Expected Response** (HTTP 201):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "...",
    "name": "Test Chicken Breast",
    "image": "data:image/png;base64,iVBORw0KGgo...",
    ...
  }
}
```

### Test 2: Update Product with FormData Image

**With Curl**:
```bash
curl -X PUT "https://fresh-backend-avtq.onrender.com/api/products/537ea831-ace2-4a13-8b49-f20d12fb4908" \
  -H "Authorization: Bearer {accessToken}" \
  -F "name=Updated Chicken Piece" \
  -F "price=100" \
  -F "image=@C:/path/to/test.png"
```

**Expected Response** (HTTP 200):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "537ea831-ace2-4a13-8b49-f20d12fb4908",
    "name": "Updated Chicken Piece",
    "price": "100",
    "image": "data:image/png;base64,iVBORw0KGgo...",
    ...
  }
}
```

### Test 3: Update Product with FormData (No Image)

**With Curl**:
```bash
curl -X PUT "https://fresh-backend-avtq.onrender.com/api/products/537ea831-ace2-4a13-8b49-f20d12fb4908" \
  -H "Authorization: Bearer {accessToken}" \
  -F "name=Only Name Update" \
  -F "price=150"
```

**Expected Response** (HTTP 200):
- Product updated with new name and price
- Existing image preserved (no image field provided)

### Test 4: JSON Request Still Works

**With Curl**:
```bash
curl -X PUT "https://fresh-backend-avtq.onrender.com/api/products/537ea831-ace2-4a13-8b49-f20d12fb4908" \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JSON Update",
    "price": "200",
    "image": "data:image/png;base64,iVBORw0KGgo..."
  }'
```

**Expected Response** (HTTP 200):
- Both JSON and FormData requests now work correctly

---

## Implementation Details

### How It Works Now

1. **Request arrives with FormData** → Multer middleware parses it
2. **File fields** → Available in `req.file` (for single file upload)
3. **Form fields** → Available in `req.body` (name, price, categoryId, etc.)
4. **File conversion** → Controller converts file to Base64 data URI
5. **Database storage** → Image stored as Base64 string in database

### Key Changes Summary

| Component | Change |
|-----------|--------|
| Routes | Added `uploadProductImage` middleware |
| Controller | Added file detection and Base64 conversion |
| Utilities | Added `fileToDataUri()` helper function |
| Documentation | Added FormData examples and specifications |

---

## Backward Compatibility

✅ **Fully backward compatible** - All existing functionality preserved:
- JSON requests still work as before
- Base64 data URI images still supported
- All validation rules unchanged
- Response formats unchanged

---

## File Changes

- [src/routes/product.routes.ts](src/routes/product.routes.ts) - Added multer middleware
- [src/controllers/product.controller.ts](src/controllers/product.controller.ts) - Added file handling
- [src/utils/fileUpload.util.ts](src/utils/fileUpload.util.ts) - Added conversion functions
- [docs/PRODUCT_API.md](docs/PRODUCT_API.md) - Added FormData documentation
