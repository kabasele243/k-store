import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

type TabType = 'details' | 'variants' | 'inventory';

interface Category {
  id: string;
  name: string;
  business_type_id: string;
  parent_category_id?: string;
}

interface Variant {
  sku: string;
  price: string;
  tempId: string;
}

interface InventoryItem {
  variantIndex: number;
  location: string;
  quantity: string;
  tempId: string;
}

export default function AddProductScreen() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Product Details
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Variants - initialize with auto-generated SKU
  const [variants, setVariants] = useState<Variant[]>([]);

  // Initialize first variant after component mounts
  useEffect(() => {
    if (variants.length === 0) {
      setVariants([{ sku: generateSKU(), price: '', tempId: '1' }]);
    }
  }, []);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { variantIndex: 0, location: '', quantity: '', tempId: '1' }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCategories();
  }, [session]);

  const fetchCategories = async () => {
    if (!session) return;

    setCategoriesLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.log({ API_URL })
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const generateSKU = () => {
    const prefix = brand ? brand.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVariants = () => {
    const newErrors: { [key: string]: string } = {};
    variants.forEach((variant, index) => {
      if (!variant.price.trim()) {
        newErrors[`variant_price_${index}`] = 'Price is required';
      } else if (isNaN(parseFloat(variant.price)) || parseFloat(variant.price) < 0) {
        newErrors[`variant_price_${index}`] = 'Invalid price';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInventory = () => {
    const newErrors: { [key: string]: string } = {};
    inventory.forEach((inv, index) => {
      if (!inv.quantity.trim()) {
        newErrors[`inventory_qty_${index}`] = 'Quantity is required';
      } else if (isNaN(parseInt(inv.quantity)) || parseInt(inv.quantity) < 0) {
        newErrors[`inventory_qty_${index}`] = 'Invalid quantity';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addVariant = () => {
    const newSKU = generateSKU();
    setVariants([...variants, { sku: newSKU, price: '', tempId: Date.now().toString() }]);
  };

  const removeVariant = (tempId: string) => {
    if (variants.length === 1) {
      Alert.alert('Error', 'At least one variant is required');
      return;
    }
    setVariants(variants.filter(v => v.tempId !== tempId));
  };

  const updateVariant = (tempId: string, field: keyof Variant, value: string) => {
    setVariants(variants.map(v =>
      v.tempId === tempId ? { ...v, [field]: value } : v
    ));
    // Clear error when user starts typing
    const index = variants.findIndex(v => v.tempId === tempId);
    if (errors[`variant_${field}_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`variant_${field}_${index}`];
      setErrors(newErrors);
    }
  };

  const addInventory = () => {
    setInventory([
      ...inventory,
      { variantIndex: 0, location: '', quantity: '', tempId: Date.now().toString() }
    ]);
  };

  const removeInventory = (tempId: string) => {
    setInventory(inventory.filter(i => i.tempId !== tempId));
  };

  const updateInventory = (tempId: string, field: keyof InventoryItem, value: string | number) => {
    setInventory(inventory.map(i =>
      i.tempId === tempId ? { ...i, [field]: value } : i
    ));
    // Clear error when user starts typing
    const index = inventory.findIndex(i => i.tempId === tempId);
    if (errors[`inventory_${field}_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`inventory_${field}_${index}`];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    // Validate all tabs
    const detailsValid = validateDetails();
    if (!detailsValid) {
      setActiveTab('details');
      Alert.alert('Validation Error', 'Please fill in all required product details');
      return;
    }

    const variantsValid = validateVariants();
    if (!variantsValid) {
      setActiveTab('variants');
      Alert.alert('Validation Error', 'Please fix errors in variants');
      return;
    }

    const inventoryValid = validateInventory();
    if (!inventoryValid) {
      setActiveTab('inventory');
      Alert.alert('Validation Error', 'Please fix errors in inventory');
      return;
    }

    if (!session) return;

    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

      // Auto-generate SKUs for variants that don't have one
      const variantsWithSKU = variants.map(variant => ({
        ...variant,
        sku: variant.sku.trim() || generateSKU(),
      }));

      // Format the data for API
      const productData = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        category_id: categoryId || undefined,
        variants: variantsWithSKU.map((variant, index) => ({
          sku: variant.sku,
          price: parseFloat(variant.price),
          inventory: inventory
            .filter(inv => inv.variantIndex === index)
            .map(inv => ({
              location: inv.location.trim() || 'Default Location',
              quantity: parseInt(inv.quantity),
            })),
        })),
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      Alert.alert('Success', 'Product created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        <Input
          label="Product Name *"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) {
              const newErrors = { ...errors };
              delete newErrors.name;
              setErrors(newErrors);
            }
          }}
          placeholder="Enter product name"
          error={errors.name}
        />
        <Input
          label="Brand"
          value={brand}
          onChangeText={setBrand}
          placeholder="Enter brand name (optional)"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Category</Text>
          {categoriesLoading ? (
            <ActivityIndicator size="small" color={Colors.accent.primary} />
          ) : (
            <View style={styles.pickerWrapper}>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No categories available</Text>
              ) : (
                categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pickerOption,
                      categoryId === cat.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      categoryId === cat.id && styles.pickerOptionTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </Card>
    </View>
  );

  const renderVariantsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product Variants</Text>
          <TouchableOpacity onPress={addVariant} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Variant</Text>
          </TouchableOpacity>
        </View>
        {variants.map((variant, index) => (
          <View key={variant.tempId} style={styles.variantItem}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantLabel}>Variant {index + 1}</Text>
              {variants.length > 1 && (
                <TouchableOpacity onPress={() => removeVariant(variant.tempId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.skuContainer}>
              <View style={styles.skuField}>
                <Input
                  label="SKU (Auto-generated)"
                  value={variant.sku}
                  editable={false}
                  style={styles.skuInput}
                />
              </View>
              <TouchableOpacity
                onPress={() => updateVariant(variant.tempId, 'sku', generateSKU())}
                style={styles.regenerateButton}
              >
                <Text style={styles.regenerateText}>🔄</Text>
              </TouchableOpacity>
            </View>
            <Input
              label="Price *"
              value={variant.price}
              onChangeText={(text) => updateVariant(variant.tempId, 'price', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={errors[`variant_price_${index}`]}
            />
          </View>
        ))}
      </Card>
    </View>
  );

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory Locations</Text>
          <TouchableOpacity onPress={addInventory} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Location</Text>
          </TouchableOpacity>
        </View>
        {inventory.map((inv, index) => (
          <View key={inv.tempId} style={styles.variantItem}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantLabel}>Location {index + 1}</Text>
              {inventory.length > 1 && (
                <TouchableOpacity onPress={() => removeInventory(inv.tempId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Variant *</Text>
              <View style={styles.pickerWrapper}>
                {variants.map((variant, vIndex) => (
                  <TouchableOpacity
                    key={variant.tempId}
                    style={[
                      styles.pickerOption,
                      inv.variantIndex === vIndex && styles.pickerOptionSelected
                    ]}
                    onPress={() => updateInventory(inv.tempId, 'variantIndex', vIndex)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      inv.variantIndex === vIndex && styles.pickerOptionTextSelected
                    ]}>
                      {variant.sku || `Variant ${vIndex + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Input
              label="Location Name"
              value={inv.location}
              onChangeText={(text) => updateInventory(inv.tempId, 'location', text)}
              placeholder="Default Location"
            />
            <Input
              label="Quantity *"
              value={inv.quantity}
              onChangeText={(text) => updateInventory(inv.tempId, 'quantity', text)}
              placeholder="0"
              keyboardType="number-pad"
              error={errors[`inventory_qty_${index}`]}
            />
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Add Product',
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'variants' && styles.activeTab]}
          onPress={() => setActiveTab('variants')}
        >
          <Text style={[styles.tabText, activeTab === 'variants' && styles.activeTabText]}>
            Variants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>
            Inventory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'variants' && renderVariantsTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? 'Creating...' : 'Create Product'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.accent.primary,
  },
  tabText: {
    ...Typography.bodyPrimary,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.screenPadding,
  },
  card: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  addButtonText: {
    color: Colors.accent.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  variantItem: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  variantLabel: {
    ...Typography.bodyPrimary,
    fontWeight: '600',
  },
  removeText: {
    color: Colors.status.danger,
    fontWeight: '500',
    fontSize: 14,
  },
  pickerContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.surface.primary,
  },
  pickerOptionSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary + '20',
  },
  pickerOptionText: {
    ...Typography.bodySecondary,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  skuField: {
    flex: 1,
  },
  skuInput: {
    backgroundColor: Colors.background.primary,
    opacity: 0.6,
  },
  regenerateButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  regenerateText: {
    fontSize: 20,
  },
  emptyText: {
    ...Typography.bodySecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
