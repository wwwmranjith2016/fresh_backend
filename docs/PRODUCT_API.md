# Product API Documentation

**Base URL**: `https://fresh-backend-avtq.onrender.com/api/products`

**Authentication**: All write operations require Bearer token in Authorization header.

```
Authorization: Bearer <accessToken>
```

**Access Control**: Admin role required for create, update, delete, and reorder operations.

---

## Table of Contents

1. [Create Product](#1-create-product)
2. [Update Product](#2-update-product)
3. [Reorder Products](#3-reorder-products)
4. [Get All Products](#4-get-all-products)
5. [Get Product by ID](#5-get-product-by-id)
6. [Delete Product](#6-delete-product)

---

## 1. Create Product

Creates a new product in the system.

### Request

**Endpoint**: `POST /api/products`

**Headers**:
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `Content-Type` | string | Yes | `application/json` |

**Request Body**:

```json
{
  "name": "Fresh Chicken Breast",
  "description": "Premium quality boneless chicken breast, perfect for grilling and cooking",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "price": 280.50,
  "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
  "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
  "offerId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "available": true,
  "discountPercentage": 10.00,
  "discountPrice": 252.45,
  "isFeatured": true,
  "stockQuantity": 100,
  "minOrderQuantity": 1,
  "maxOrderQuantity": 10,
  "displayOrder": 1,
  "tags": ["fresh", "premium", "boneless"]
}
```

**Sample Request with All Fields:**

```json
{
  "name": "Fresh Chicken Breast",
  "description": "Premium quality boneless chicken breast, perfect for grilling and cooking",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "price": 280.50,
  "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
  "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
  "offerId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "available": true,
  "discountPercentage": 10.00,
  "discountPrice": 252.45,
  "isFeatured": true,
  "stockQuantity": 100,
  "minOrderQuantity": 1,
  "maxOrderQuantity": 10,
  "displayOrder": 1,
  "tags": ["fresh", "premium", "boneless", "chicken"]
}
```

**Minimum Required Fields:**

```json
{
  "name": "Fresh Chicken Breast",
  "description": "Premium quality boneless chicken breast",
  "price": 280.50,
  "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
  "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d"
}
```

### Field Specifications

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `name` | string | **Yes** | - | Non-empty | Product name |
| `description` | string | **Yes** | - | Non-empty | Product description |
| `image` | string | No | `null` | Base64 data URI | Product image as Base64 encoded string with data URI prefix |
| `imageWidth` | number | No | `null` | > 0 | Width of the uploaded image in pixels |
| `imageHeight` | number | No | `null` | > 0 | Height of the uploaded image in pixels |
| `imageMimeType` | string | No | `null` | Valid MIME type | MIME type of the uploaded image (e.g., image/png, image/jpeg) |
| `imageSize` | number | No | `null` | > 0 | Size of the image in bytes |
| `price` | number | **Yes** | - | > 0 | Product price in decimal (max 10 digits, 2 decimal places) |
| `categoryId` | string (UUID) | **Yes** | - | Valid UUID | Reference to existing category |
| `unitId` | string (UUID) | **Yes** | - | Valid UUID | Reference to existing unit |
| `offerId` | string (UUID) | No | `null` | Valid UUID | Reference to existing offer (optional promotional offer) |
| `available` | boolean | No | `true` | true/false | Product availability status |
| `discountPercentage` | number | No | `null` | 0 - 100 | Discount percentage (max 5 digits, 2 decimal places) |
| `discountPrice` | number | No | `null` | >= 0 | Discounted price (max 10 digits, 2 decimal places) |
| `isFeatured` | boolean | No | `false` | true/false | Whether product is featured |
| `stockQuantity` | integer | No | `10000` | >= 0 | Available stock quantity |
| `minOrderQuantity` | integer | No | `1` | >= 1 | Minimum order quantity |
| `maxOrderQuantity` | integer | No | `100` | >= 1 | Maximum order quantity |
| `displayOrder` | integer | No | `0` | >= 0 | Display position/order |
| `tags` | string[] | No | `[]` | Array of strings | Product tags for filtering |

### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "b4de536e-5e8b-4aed-b412-8b0f3e5afe10",
    "name": "Fresh Chicken Breast",
    "description": "Premium quality boneless chicken breast, perfect for grilling and cooking",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
    "imageWidth": 800,
    "imageHeight": 600,
    "imageMimeType": "image/png",
    "imageSize": 45000,
    "price": "280.50",
    "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
    "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
    "offerId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
    "available": true,
    "discountPercentage": "10.00",
    "discountPrice": "252.45",
    "isFeatured": true,
    "stockQuantity": 100,
    "minOrderQuantity": 1,
    "maxOrderQuantity": 10,
    "displayOrder": 1,
    "tags": ["fresh", "premium", "boneless"],
    "createdAt": "2026-02-25T15:00:00.000Z",
    "updatedAt": "2026-02-25T15:00:00.000Z"
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Missing required fields
{
  "success": false,
  "error": "Required fields: name, description, price, categoryId, unitId"
}

// 400 Bad Request - Invalid price
{
  "success": false,
  "error": "Price must be greater than 0"
}

// 400 Bad Request - Invalid discount percentage
{
  "success": false,
  "error": "Discount percentage must be between 0 and 100"
}

// 400 Bad Request - Invalid offer dates
{
  "success": false,
  "error": "Offer valid from date must be before valid until date"
}

// 403 Forbidden - Unauthorized
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

---

## 2. Update Product

Updates an existing product. Only provided fields will be updated.

### Request

**Endpoint**: `PUT /api/products/:id`

**Headers**:
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `Content-Type` | string | Yes | `application/json` |

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Product ID to update |

**Request Body** (all fields optional):

```json
{
  "name": "Updated Chicken Breast",
  "description": "Updated description for the product",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "price": 299.99,
  "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
  "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
  "available": false,
  "discountPercentage": 15.00,
  "discountPrice": 254.99,
  "offerTitle": "Updated Offer",
  "offerDescription": "New promotional offer description",
  "offerValidFrom": "2026-04-01T00:00:00.000Z",
  "offerValidUntil": "2026-04-30T23:59:59.000Z",
  "isFeatured": true,
  "stockQuantity": 50,
  "minOrderQuantity": 2,
  "maxOrderQuantity": 5,
  "displayOrder": 3,
  "tags": ["fresh", "premium", "sale"]
}
```

### Field Specifications

All fields are optional. Only provided fields will be updated. Same constraints as Create Product apply.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | string | Non-empty | Product name |
| `description` | string | Non-empty | Product description |
| `image` | string | Base64 data URI | Product image |
| `price` | number | > 0 | Product price |
| `categoryId` | string (UUID) | Valid UUID | Category reference |
| `unitId` | string (UUID) | Valid UUID | Unit reference |
| `available` | boolean | true/false | Availability status |
| `discountPercentage` | number | 0 - 100 | Discount percentage |
| `discountPrice` | number | >= 0 | Discounted price |
| `offerTitle` | string | - | Offer title |
| `offerDescription` | string | - | Offer description |
| `offerValidFrom` | string (ISO 8601) | Valid ISO date | Offer start date |
| `offerValidUntil` | string (ISO 8601) | Valid ISO date | Offer end date |
| `isFeatured` | boolean | true/false | Featured status |
| `stockQuantity` | integer | >= 0 | Stock quantity |
| `minOrderQuantity` | integer | >= 1 | Minimum order qty |
| `maxOrderQuantity` | integer | >= 1 | Maximum order qty |
| `displayOrder` | integer | >= 0 | Display position |
| `tags` | string[] | Array of strings | Product tags |

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "b4de536e-5e8b-4aed-b412-8b0f3e5afe10",
    "name": "Updated Chicken Breast",
    "description": "Updated description for the product",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "price": "299.99",
    "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
    "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
    "available": false,
    "discountPercentage": "15.00",
    "discountPrice": "254.99",
    "offerTitle": "Updated Offer",
    "offerDescription": "New promotional offer description",
    "offerValidFrom": "2026-04-01T00:00:00.000Z",
    "offerValidUntil": "2026-04-30T23:59:59.000Z",
    "isFeatured": true,
    "stockQuantity": 50,
    "minOrderQuantity": 2,
    "maxOrderQuantity": 5,
    "displayOrder": 3,
    "tags": ["fresh", "premium", "sale"],
    "createdAt": "2026-02-25T15:00:00.000Z",
    "updatedAt": "2026-02-25T16:30:00.000Z"
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Product not found
{
  "success": false,
  "error": "Product not found"
}

// 403 Forbidden - Unauthorized
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

---

## 3. Reorder Products

Updates the display order of multiple products in a single request.

### Request

**Endpoint**: `PUT /api/products/reorder`

**Headers**:
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `Content-Type` | string | Yes | `application/json` |

**Request Body**:

```json
{
  "products": [
    {
      "id": "30293062-bce9-4196-85d3-0bdb164ba0ae",
      "displayOrder": 1
    },
    {
      "id": "6898de12-9ed4-42e3-a89f-a18c98fac7f8",
      "displayOrder": 2
    },
    {
      "id": "f11f932f-157d-46fe-8172-9b78d608b20e",
      "displayOrder": 3
    },
    {
      "id": "38bf8c3e-932f-48db-b3df-8ce338a11a3f",
      "displayOrder": 4
    },
    {
      "id": "61cd7157-eab0-4494-9964-36892b10935d",
      "displayOrder": 5
    }
  ]
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `products` | array | **Yes** | Array of product order updates |

**Products Array Item**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | string (UUID) | **Yes** | Valid product UUID | Product ID to update |
| `displayOrder` | integer | **Yes** | >= 0 | New display position |

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "Products reordered successfully",
  "data": {
    "success": true,
    "updated": 5
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Empty or invalid array
{
  "success": false,
  "error": "Products array is required"
}

// 403 Forbidden - Unauthorized
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

---

## 4. Get All Products

Retrieves all products with optional filtering.

### Request

**Endpoint**: `GET /api/products`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `available` | string | No | Filter by availability (`true`/`false`) |
| `isFeatured` | string | No | Filter by featured status (`true`/`false`) |
| `categoryId` | string (UUID) | No | Filter by category ID |
| `unitId` | string (UUID) | No | Filter by unit ID |
| `tags` | string or string[] | No | Filter by tags (comma-separated or multiple params) |
| `minPrice` | number | No | Minimum price filter |
| `maxPrice` | number | No | Maximum price filter |
| `hasDiscount` | string | No | Filter products with discount (`true`/`false`) |

**Example Request**:
```
GET /api/products?available=true&categoryId=0e778c3a-6abc-46b3-b796-2be0f707678d&minPrice=100&maxPrice=500
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "30293062-bce9-4196-85d3-0bdb164ba0ae",
      "name": "Chicken Breast",
      "description": "Fresh boneless chicken breast",
      "image": "data:image/png;base64,iVBORw0KGgo...",
      "price": "280.50",
      "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
      "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
      "available": true,
      "discountPercentage": "10.00",
      "discountPrice": "252.45",
      "offerTitle": "Weekend Special",
      "offerDescription": "10% off this weekend",
      "offerValidFrom": "2026-03-01T00:00:00.000Z",
      "offerValidUntil": "2026-03-31T23:59:59.000Z",
      "isFeatured": true,
      "stockQuantity": 100,
      "minOrderQuantity": 1,
      "maxOrderQuantity": 10,
      "displayOrder": 1,
      "tags": ["fresh", "premium"],
      "createdAt": "2026-02-06T08:57:07.200Z",
      "updatedAt": "2026-02-25T15:00:00.000Z",
      "category": {
        "id": "0e778c3a-6abc-46b3-b796-2be0f707678d",
        "name": "Chicken",
        "description": "Fresh chicken products",
        "isActive": true,
        "createdAt": "2026-02-06T08:57:06.930Z",
        "updatedAt": "2026-02-06T08:57:06.930Z"
      },
      "unit": {
        "id": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
        "name": "Kilo Gram",
        "symbol": "kg",
        "description": "Weight in kilograms",
        "isActive": true,
        "createdAt": "2026-02-06T08:57:07.114Z",
        "updatedAt": "2026-02-06T08:57:07.114Z"
      }
    }
  ]
}
```

---

## 5. Get Product by ID

Retrieves a single product by its ID.

### Request

**Endpoint**: `GET /api/products/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Product ID |

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "30293062-bce9-4196-85d3-0bdb164ba0ae",
    "name": "Chicken Breast",
    "description": "Fresh boneless chicken breast",
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "price": "280.50",
    "categoryId": "0e778c3a-6abc-46b3-b796-2be0f707678d",
    "unitId": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
    "available": true,
    "discountPercentage": "10.00",
    "discountPrice": "252.45",
    "offerTitle": "Weekend Special",
    "offerDescription": "10% off this weekend",
    "offerValidFrom": "2026-03-01T00:00:00.000Z",
    "offerValidUntil": "2026-03-31T23:59:59.000Z",
    "isFeatured": true,
    "stockQuantity": 100,
    "minOrderQuantity": 1,
    "maxOrderQuantity": 10,
    "displayOrder": 1,
    "tags": ["fresh", "premium"],
    "createdAt": "2026-02-06T08:57:07.200Z",
    "updatedAt": "2026-02-25T15:00:00.000Z",
    "category": {
      "id": "0e778c3a-6abc-46b3-b796-2be0f707678d",
      "name": "Chicken",
      "description": "Fresh chicken products",
      "isActive": true,
      "createdAt": "2026-02-06T08:57:06.930Z",
      "updatedAt": "2026-02-06T08:57:06.930Z"
    },
    "unit": {
      "id": "96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d",
      "name": "Kilo Gram",
      "symbol": "kg",
      "description": "Weight in kilograms",
      "isActive": true,
      "createdAt": "2026-02-06T08:57:07.114Z",
      "updatedAt": "2026-02-06T08:57:07.114Z"
    }
  }
}
```

**Error Response**:

```json
// 404 Not Found
{
  "success": false,
  "error": "Product not found"
}
```

---

## 6. Delete Product

Deletes a product by its ID.

### Request

**Endpoint**: `DELETE /api/products/:id`

**Headers**:
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Product ID to delete |

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

**Error Responses**:

```json
// 400 Bad Request - Product not found
{
  "success": false,
  "error": "Product not found"
}

// 403 Forbidden - Unauthorized
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

---

## Data Types Reference

### Product Object

| Field | Type | Database Type | Description |
|-------|------|---------------|-------------|
| `id` | string (UUID) | `uuid` | Unique identifier |
| `name` | string | `String` | Product name |
| `description` | string | `String` | Product description |
| `image` | string \| null | `String?` | Base64 encoded image with data URI |
| `price` | string (decimal) | `Decimal(10,2)` | Product price |
| `categoryId` | string (UUID) | `uuid` | Foreign key to Category |
| `unitId` | string (UUID) | `uuid` | Foreign key to Unit |
| `available` | boolean | `Boolean` | Availability status |
| `discountPercentage` | string \| null (decimal) | `Decimal(5,2)?` | Discount percentage |
| `discountPrice` | string \| null (decimal) | `Decimal(10,2)?` | Discounted price |
| `offerTitle` | string \| null | `String?` | Offer title |
| `offerDescription` | string \| null | `String?` | Offer description |
| `offerValidFrom` | string \| null (ISO 8601) | `DateTime?` | Offer start date |
| `offerValidUntil` | string \| null (ISO 8601) | `DateTime?` | Offer end date |
| `isFeatured` | boolean | `Boolean` | Featured status |
| `stockQuantity` | integer \| null | `Int?` | Stock quantity |
| `minOrderQuantity` | integer \| null | `Int?` | Minimum order quantity |
| `maxOrderQuantity` | integer \| null | `Int?` | Maximum order quantity |
| `displayOrder` | integer | `Int` | Display position |
| `tags` | string[] | `String[]` | Array of tags |
| `createdAt` | string (ISO 8601) | `DateTime` | Creation timestamp |
| `updatedAt` | string (ISO 8601) | `DateTime` | Last update timestamp |

### Category Object (Nested in Product)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier |
| `name` | string | Category name |
| `description` | string \| null | Category description |
| `isActive` | boolean | Active status |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |

### Unit Object (Nested in Product)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier |
| `name` | string | Unit name |
| `symbol` | string \| null | Unit symbol (e.g., "kg", "pcs") |
| `description` | string \| null | Unit description |
| `isActive` | boolean | Active status |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |

---

## Common Error Codes

| HTTP Status | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Admin access required |
| `404` | Not Found - Product not found |
| `500` | Internal Server Error |

---

## Notes

1. **Image Handling**: Images are stored as Base64 encoded strings with data URI prefix (e.g., `data:image/png;base64,...`). Supported formats: JPEG, PNG, WebP, GIF.

2. **Image Upload Methods**: 
   - **JSON Request**: Send image as Base64 data URI string in the `image` field
   - **FormData Request**: Send image file directly using form-data with field name `image` (see examples below)

3. **FormData Image Upload Examples**:

   **Create Product with Image (FormData)**:
   ```bash
   curl -X POST "https://fresh-backend-avtq.onrender.com/api/products" \
     -H "Authorization: Bearer <accessToken>" \
     -F "name=Fresh Chicken Breast" \
     -F "description=Premium quality boneless chicken breast" \
     -F "price=280.50" \
     -F "categoryId=0e778c3a-6abc-46b3-b796-2be0f707678d" \
     -F "unitId=96bef4f9-ac67-4e4e-8b44-a7bc0796ae3d" \
     -F "available=true" \
     -F "image=@/path/to/image.png"
   ```

   **Update Product with Image (FormData)**:
   ```bash
   curl -X PUT "https://fresh-backend-avtq.onrender.com/api/products/537ea831-ace2-4a13-8b49-f20d12fb4908" \
     -H "Authorization: Bearer <accessToken>" \
     -F "name=Chicken piece" \
     -F "price=100" \
     -F "image=@/path/to/test.png"
   ```

   **FormData Requirements**:
   - Image field name must be `image`
   - Supported formats: JPEG, PNG, WebP, GIF
   - Maximum file size: 5MB
   - Images are automatically converted to Base64 data URI format on the server
   - Use `-F` flag in curl for file uploads instead of `-d`

4. **Decimal Values**: Price and discount values are returned as strings to maintain precision. When sending, use numbers.

5. **Date Format**: All dates are in ISO 8601 format (e.g., `2026-03-01T00:00:00.000Z`).

6. **Route Order**: The `/reorder` endpoint must be called before any `/:id` routes due to Express route matching order.

7. **Authentication**: Obtain access token via `/api/auth/login` endpoint.
