# React Native Integration Guide: Product API (Create & Update)

## Overview
Complete guide to integrate Fresh Chicken Backend product creation and update APIs into React Native application with image upload support.

---

## 1. Installation

### Required Packages

```bash
npm install axios react-native-image-picker react-native-fs react-native-image-crop-picker
# or
yarn add axios react-native-image-picker react-native-fs react-native-image-crop-picker
```

### Package Versions (Recommended)
```json
{
  "axios": "^1.6.0",
  "react-native-image-picker": "^5.7.0",
  "react-native-fs": "^2.20.0",
  "react-native-image-crop-picker": "^0.40.0"
}
```

### iOS Setup (CocoaPods)
```bash
cd ios
pod install
cd ..
```

### Android Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

---

## 2. API Configuration

### Create `config/api.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://fresh-backend-avtq.onrender.com/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  getClient() {
    return this.axiosInstance;
  }
}

export default new ApiClient();
```

---

## 3. Product Service

### Create `services/productService.ts`

```typescript
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import apiClient from '../config/api';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  unitId: string;
  available: boolean;
  isFeatured: boolean;
  displayOrder: number;
  tags?: string;
  image?: string; // file path
  offerId?: string;
}

export interface ProductResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number; // Hardcoded: 10000
    minOrderQuantity: number; // Hardcoded: 1
    maxOrderQuantity: number; // Hardcoded: 100
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    imageMimeType?: string;
    imageSize?: number;
    categoryId: string;
    unitId: string;
    available: boolean;
    isFeatured: boolean;
    tags: string[];
    displayOrder: number;
    offerId?: string;
    createdAt: string;
  };
}

class ProductService {
  /**
   * Create a new product with optional image
   */
  async createProduct(product: CreateProductRequest): Promise<ProductResponse> {
    try {
      const formData = new FormData();

      // Add text fields
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('categoryId', product.categoryId);
      formData.append('unitId', product.unitId);
      formData.append('available', product.available.toString());
      formData.append('isFeatured', product.isFeatured.toString());
      formData.append('displayOrder', product.displayOrder.toString());

      if (product.tags) {
        formData.append('tags', product.tags);
      }

      if (product.offerId) {
        formData.append('offerId', product.offerId);
      }

      // Add image if provided
      if (product.image) {
        const fileName = product.image.split('/').pop() || 'image.jpg';
        const fileType = this.getMimeType(fileName);

        formData.append('image', {
          uri: Platform.OS === 'android' ? product.image : product.image.replace('file://', ''),
          type: fileType,
          name: fileName,
        } as any);
      }

      const response = await apiClient.getClient().post(
        '/products',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to create product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    product: Partial<CreateProductRequest>
  ): Promise<ProductResponse> {
    try {
      const formData = new FormData();

      // Add text fields (only if provided)
      if (product.name) formData.append('name', product.name);
      if (product.description) formData.append('description', product.description);
      if (product.price) formData.append('price', product.price.toString());
      if (product.categoryId) formData.append('categoryId', product.categoryId);
      if (product.unitId) formData.append('unitId', product.unitId);
      if (product.available !== undefined) formData.append('available', product.available.toString());
      if (product.isFeatured !== undefined) formData.append('isFeatured', product.isFeatured.toString());
      if (product.displayOrder !== undefined) formData.append('displayOrder', product.displayOrder.toString());
      if (product.tags) formData.append('tags', product.tags);
      if (product.offerId) formData.append('offerId', product.offerId);

      // Add image if provided
      if (product.image) {
        const fileName = product.image.split('/').pop() || 'image.jpg';
        const fileType = this.getMimeType(fileName);

        formData.append('image', {
          uri: Platform.OS === 'android' ? product.image : product.image.replace('file://', ''),
          type: fileType,
          name: fileName,
        } as any);
      }

      const response = await apiClient.getClient().put(
        `/products/${productId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update product');
    }
  }

  /**
   * Get all products
   */
  async getAllProducts() {
    try {
      const response = await apiClient.getClient().get('/products');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch products');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string) {
    try {
      const response = await apiClient.getClient().get(`/products/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch product');
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string) {
    try {
      const response = await apiClient.getClient().delete(`/products/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete product');
    }
  }

  /**
   * Helper: Get MIME type from file extension
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext || ''] || 'image/jpeg';
  }
}

export default new ProductService();
```

---

## 4. Image Picker Utility

### Create `utils/imagePicker.ts`

```typescript
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Platform } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
}

class ImagePickerUtil {
  /**
   * Pick image from gallery
   */
  async pickImageFromGallery(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200,
        },
        (response) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            console.error('ImagePicker Error:', response.errorMessage);
            resolve(null);
          } else {
            const asset = response.assets?.[0];
            if (asset) {
              resolve({
                uri: asset.uri || '',
                name: asset.fileName || 'image.jpg',
                size: asset.fileSize || 0,
                type: asset.type || 'image/jpeg',
                width: asset.width || 0,
                height: asset.height || 0,
              });
            }
          }
        }
      );
    });
  }

  /**
   * Take photo with camera
   */
  async takePhoto(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200,
        },
        (response) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            console.error('Camera Error:', response.errorMessage);
            resolve(null);
          } else {
            const asset = response.assets?.[0];
            if (asset) {
              resolve({
                uri: asset.uri || '',
                name: asset.fileName || `photo_${Date.now()}.jpg`,
                size: asset.fileSize || 0,
                type: asset.type || 'image/jpeg',
                width: asset.width || 0,
                height: asset.height || 0,
              });
            }
          }
        }
      );
    });
  }

  /**
   * Crop and compress image
   */
  async cropImage(imageUri: string): Promise<ImagePickerResult | null> {
    try {
      const cropped = await ImageCropPicker.openCropper({
        path: imageUri,
        width: 800,
        height: 600,
        cropping: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      return {
        uri: cropped.path,
        name: cropped.filename || 'cropped_image.jpg',
        size: cropped.size || 0,
        type: cropped.mime || 'image/jpeg',
        width: cropped.width || 800,
        height: cropped.height || 600,
      };
    } catch (error) {
      console.error('Crop Error:', error);
      return null;
    }
  }

  /**
   * Validate image
   */
  validateImage(image: ImagePickerResult): { valid: boolean; message?: string } {
    // Min size: 400x300
    if (image.width < 400 || image.height < 300) {
      return { valid: false, message: 'Image must be at least 400x300 pixels' };
    }

    // Max size: 4000x3000
    if (image.width > 4000 || image.height > 4000) {
      return { valid: false, message: 'Image must not exceed 4000x3000 pixels' };
    }

    // File size: max 5MB
    if (image.size > 5 * 1024 * 1024) {
      return { valid: false, message: 'Image must not exceed 5MB' };
    }

    return { valid: true };
  }
}

export default new ImagePickerUtil();
```

---

## 5. UI Component Example

### Create `screens/ProductFormScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import productService, { CreateProductRequest } from '../services/productService';
import imagePicker from '../utils/imagePicker';
import { ImagePickerResult } from '../utils/imagePicker';

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

export default function ProductFormScreen({
  categories,
  units,
  editingProduct,
  onSuccess,
}: {
  categories: Category[];
  units: Unit[];
  editingProduct?: any;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price || 0,
    categoryId: editingProduct?.categoryId || '',
    unitId: editingProduct?.unitId || '',
    available: editingProduct?.available !== false,
    isFeatured: editingProduct?.isFeatured || false,
    displayOrder: editingProduct?.displayOrder || 1,
    tags: editingProduct?.tags?.join(',') || '',
    offerId: editingProduct?.offerId || '',
    image: undefined,
  });

  const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(
    editingProduct?.image ? { uri: editingProduct.image } as any : null
  );
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const handlePickImage = async () => {
    const image = await imagePicker.pickImageFromGallery();
    if (image) {
      const validation = imagePicker.validateImage(image);
      if (!validation.valid) {
        Alert.alert('Invalid Image', validation.message);
        return;
      }
      setSelectedImage(image);
      setFormData({ ...formData, image: image.uri });
    }
  };

  const handleTakePhoto = async () => {
    const image = await imagePicker.takePhoto();
    if (image) {
      const validation = imagePicker.validateImage(image);
      if (!validation.valid) {
        Alert.alert('Invalid Image', validation.message);
        return;
      }
      setSelectedImage(image);
      setFormData({ ...formData, image: image.uri });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!formData.categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.unitId) {
      Alert.alert('Error', 'Please select a unit');
      return;
    }
    if (formData.price <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      if (editingProduct?.id) {
        // Update product
        await productService.updateProduct(editingProduct.id, formData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // Create product
        await productService.createProduct(formData);
        Alert.alert('Success', 'Product created successfully');
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>No image selected</Text>
            </View>
          )}
          <View style={styles.imageButtonRow}>
            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Name */}
        <TextInput
          style={styles.input}
          placeholder="Product Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!loading}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        {/* Price */}
        <TextInput
          style={styles.input}
          placeholder="Price *"
          value={formData.price.toString()}
          onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        {/* Category Picker */}
        <View style={styles.picker}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.selectRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.selectOption,
                  formData.categoryId === cat.id && styles.selectOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, categoryId: cat.id })}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    formData.categoryId === cat.id && styles.selectOptionTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Unit Picker */}
        <View style={styles.picker}>
          <Text style={styles.label}>Unit *</Text>
          <View style={styles.selectRow}>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={[
                  styles.selectOption,
                  formData.unitId === unit.id && styles.selectOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, unitId: unit.id })}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    formData.unitId === unit.id && styles.selectOptionTextActive,
                  ]}
                >
                  {unit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <TextInput
          style={styles.input}
          placeholder="Tags (comma-separated: fresh,premium)"
          value={formData.tags}
          onChangeText={(text) => setFormData({ ...formData, tags: text })}
          editable={!loading}
        />

        {/* Display Order */}
        <TextInput
          style={styles.input}
          placeholder="Display Order"
          value={formData.displayOrder.toString()}
          onChangeText={(text) => setFormData({ ...formData, displayOrder: parseInt(text) || 1 })}
          keyboardType="number-pad"
          editable={!loading}
        />

        {/* Toggles */}
        <View style={styles.toggleRow}>
          <Text>Available</Text>
          <Switch
            value={formData.available}
            onValueChange={(value) => setFormData({ ...formData, available: value })}
            disabled={loading}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text>Featured</Text>
          <Switch
            value={formData.isFeatured}
            onValueChange={(value) => setFormData({ ...formData, isFeatured: value })}
            disabled={loading}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {editingProduct?.id ? 'Update Product' : 'Create Product'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Note: Stock Quantity, Min Order Quantity, and Max Order Quantity are hardcoded by the backend (10000, 1, 100).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  imageSection: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  picker: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  selectOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#006399',
  },
});
```

---

## 6. Authentication Setup

### Create `screens/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://fresh-backend-avtq.onrender.com/api/auth/login', {
        phone,
        password,
      });

      if (response.data.success && response.data.data.token) {
        // Save token
        await AsyncStorage.setItem('adminToken', response.data.data.token);
        await AsyncStorage.setItem('userRole', response.data.data.role);

        Alert.alert('Success', 'Login successful');
        onLoginSuccess();
      } else {
        Alert.alert('Error', response.data.error || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fresh Chicken Admin</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Test Credentials Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Test Credentials (Admin):</Text>
        <Text style={styles.infoText}>Phone: 8248904924</Text>
        <Text style={styles.infoText}>Password: admin123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
```

---

## 7. Complete App Navigation Example

### Create `App.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ProductFormScreen from './screens/ProductFormScreen';
import ProductListScreen from './screens/ProductListScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    checkLoginStatus();
    fetchDropdownData();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch categories
      const catResponse = await fetch('https://fresh-backend-avtq.onrender.com/api/categories');
      const catData = await catResponse.json();
      setCategories(catData.data || []);

      // Fetch units
      const unitResponse = await fetch('https://fresh-backend-avtq.onrender.com/api/units');
      const unitData = await unitResponse.json();
      setUnits(unitData.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('adminToken');
    await AsyncStorage.removeItem('userRole');
    setIsLoggedIn(false);
  };

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {() => <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="ProductList"
              options={{
                title: 'Products',
                headerRight: () => (
                  <TouchableOpacity onPress={handleLogout}>
                    <Text style={{ marginRight: 15, color: '#007AFF' }}>Logout</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {() => <ProductListScreen categories={categories} units={units} />}
            </Stack.Screen>
            <Stack.Screen
              name="CreateProduct"
              options={{ title: 'Create Product' }}
            >
              {({ navigation }) => (
                <ProductFormScreen
                  categories={categories}
                  units={units}
                  onSuccess={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EditProduct"
              options={{ title: 'Edit Product' }}
            >
              {({ route, navigation }) => (
                <ProductFormScreen
                  categories={categories}
                  units={units}
                  editingProduct={route.params.product}
                  onSuccess={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 8. API Constants Reference

### `constants/api.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://fresh-backend-avtq.onrender.com/api',
  TIMEOUT: 30000, // 30 seconds
  IMAGE_CONSTRAINTS: {
    MIN_WIDTH: 400,
    MIN_HEIGHT: 300,
    MAX_WIDTH: 4000,
    MAX_HEIGHT: 3000,
    MAX_SIZE_MB: 5,
  },
  HARDCODED_VALUES: {
    stockQuantity: 10000,
    minOrderQuantity: 1,
    maxOrderQuantity: 100,
  },
};

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // Products
  CREATE_PRODUCT: '/products',
  GET_ALL_PRODUCTS: '/products',
  GET_PRODUCT: '/products/:id',
  UPDATE_PRODUCT: '/products/:id',
  DELETE_PRODUCT: '/products/:id',

  // Categories
  GET_CATEGORIES: '/categories',

  // Units
  GET_UNITS: '/units',

  // Offers
  GET_OFFERS: '/offers',
};
```

---

## 9. Error Handling Best Practices

### Create `utils/errorHandler.ts`

```typescript
import axios from 'axios';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'An error occurred';
    const details = error.response?.data;

    return new ApiError(status, message, details);
  }

  return new ApiError(500, error.message || 'An unknown error occurred', error);
}

export function isNetworkError(error: ApiError): boolean {
  return error.status === 0 || error.status >= 500;
}

export function isValidationError(error: ApiError): boolean {
  return error.status === 400;
}

export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.status === 403;
}
```

---

## 10. Testing Checklist

### Pre-Integration Testing

- [ ] Admin login successful with token retrieval
- [ ] Token persists in AsyncStorage
- [ ] Token included in all subsequent API requests
- [ ] Categories fetched correctly on app launch
- [ ] Units fetched correctly on app launch

### Create Product Testing

- [ ] Product created with all required fields
- [ ] Image uploaded and compressed by backend
- [ ] Image metadata returned in response
- [ ] Tags parsed correctly (comma-separated to array)
- [ ] Hardcoded values returned: stockQuantity=10000, minOrderQuantity=1, maxOrderQuantity=100
- [ ] Product visible in list after creation
- [ ] Empty image handling (image field omitted when no image)

### Update Product Testing

- [ ] Product updated with partial fields
- [ ] Image replaced when new image provided
- [ ] Image metadata updated when image changed
- [ ] Hardcoded values always 10000, 1, 100
- [ ] Validation errors handled properly
- [ ] Network errors handled with retry option

### Error Scenarios

- [ ] Invalid categoryId error handled
- [ ] Invalid unitId error handled
- [ ] Image too small validation (< 400x300)
- [ ] Image too large validation (> 4000x3000)
- [ ] File size too large (> 5MB) validation
- [ ] Network timeout handled
- [ ] Duplicate product name allowed but validated server-side

---

## 11. Performance Optimization Tips

1. **Image Compression**: Compress before upload to reduce payload
```typescript
// Already handled by react-native-image-picker
// maxWidth: 1200, maxHeight: 1200
```

2. **Request Throttling**: Prevent duplicate submissions
```typescript
let lastSubmitTime = 0;
const SUBMIT_THROTTLE = 2000; // 2 seconds

if (Date.now() - lastSubmitTime < SUBMIT_THROTTLE) {
  Alert.alert('Please wait before submitting again');
  return;
}
lastSubmitTime = Date.now();
```

3. **Lazy Loading**: Load categories/units on demand
```typescript
const [categoriesLoading, setCategoriesLoading] = useState(false);

const loadCategories = async () => {
  if (categories.length === 0) {
    setCategoriesLoading(true);
    // Fetch categories
  }
};
```

4. **Caching**: Cache dropdown data locally
```typescript
const cacheDropdownData = async (data: any) => {
  await AsyncStorage.setItem('CachedCategories', JSON.stringify(data));
};
```

---

## 12. Common Issues & Solutions

### Issue: Image Upload Fails
**Solution**: Ensure Content-Type is multipart/form-data and file URI is valid
```typescript
// Validate image URI before upload
if (!image.uri || !image.uri.startsWith('file://')) {
  console.error('Invalid image URI');
}
```

### Issue: Token Not Included in Request
**Solution**: Verify token is in AsyncStorage and interceptor is working
```typescript
// Check in AsyncStorage
const token = await AsyncStorage.getItem('adminToken');
console.log('Token:', token);
```

### Issue: Form Data Not Serialized
**Solution**: Use FormData API correctly
```typescript
const formData = new FormData();
formData.append('name', product.name); // ✅ Correct
const data = { name: product.name }; // ❌ Wrong for multipart
```

### Issue: Network Timeout on Slow Connection
**Solution**: Increase timeout or show progress
```typescript
const axios = require('axios').default;
const instance = axios.create({
  timeout: 60000, // 60 seconds for slow networks
});
```

---

## 13. Database States

### Product Response Structure

```typescript
{
  success: true,
  data: {
    id: "uuid",
    name: "Product Name",
    description: "Description",
    price: 350,
    stockQuantity: 10000,        // Hardcoded - not user input
    minOrderQuantity: 1,          // Hardcoded - not user input
    maxOrderQuantity: 100,        // Hardcoded - not user input
    image: "base64-string",       // Compressed image
    imageWidth: 1200,
    imageHeight: 900,
    imageMimeType: "image/jpeg",
    imageSize: 65432,             // Bytes after compression
    categoryId: "category-uuid",
    categoryName: "Chicken",
    unitId: "unit-uuid",
    unitName: "Kilo Gram",
    available: true,
    isFeatured: true,
    tags: ["fresh", "premium"],
    displayOrder: 1,
    offerId: "offer-uuid",        // Optional
    offerTitle: "Discount 20%",   // Optional
    createdAt: "2026-02-27T...",
    updatedAt: "2026-02-27T..."
  }
}
```

---

## 14. Deployment Checklist

- [ ] API_BASE_URL updated to production URL
- [ ] Authentication tokens properly secured
- [ ] Image uploads tested end-to-end
- [ ] Error messages user-friendly
- [ ] Network timeouts handled
- [ ] Offline mode considered
- [ ] Loading states visible
- [ ] Success/failure feedback provided
- [ ] FormData handled correctly for Android/iOS

---

## Support & Resources

- **API Docs**: See [PRODUCT_API.md](PRODUCT_API.md)
- **Backend**: https://fresh-backend-avtq.onrender.com
- **Test Credentials**: 
  - Admin: 8248904924 / admin123
  - Test User: 9876543210 / test123

---

**Last Updated**: February 2026
