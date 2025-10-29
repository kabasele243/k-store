import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Input from './Input';
import Button from './Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/utils/api';

interface Variant {
  id: string;
  sku: string;
  price: number;
  attributes?: Record<string, any>;
  sales?: Array<{
    id: string;
    sold_at: string;
  }>;
}

interface UpdateProductModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  variants: Variant[];
  onSuccess: () => void;
}

const getVariantDisplayName = (variant: Variant): string => {
  if (variant.attributes && Object.keys(variant.attributes).length > 0) {
    const attrs = Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return attrs;
  }
  return variant.sku;
};

export default function UpdateProductModal({
  visible,
  onClose,
  productId,
  variants,
  onSuccess,
}: UpdateProductModalProps) {
  const { session } = useAuth();
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [salesCount, setSalesCount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  useEffect(() => {
    if (visible && variants.length > 0) {
      // Auto-select first variant
      setSelectedVariantId(variants[0].id);
      setSalesCount('1');
    }
  }, [visible, variants]);

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setSalesCount('1');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedVariantId) {
      newErrors.variant = 'Please select a variant';
    }

    if (!salesCount || isNaN(parseInt(salesCount)) || parseInt(salesCount) <= 0) {
      newErrors.salesCount = 'Please enter a valid quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!session) return;

    setLoading(true);
    try {
      // Record sale
      await apiFetch(`/inventory/add-stock`, {
        method: 'POST',
        token: session.access_token,
        body: {
          variant_id: selectedVariantId,
          quantity: parseInt(salesCount),
        },
      });

      Alert.alert('Success', `Recorded ${salesCount} sale(s) successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Sale</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={styles.label}>Select Variant *</Text>
              <View style={styles.pickerWrapper}>
                {variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.pickerOption,
                      selectedVariantId === variant.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleVariantChange(variant.id)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedVariantId === variant.id && styles.pickerOptionTextSelected
                    ]}>
                      {getVariantDisplayName(variant)} - ${variant.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.variant && <Text style={styles.errorText}>{errors.variant}</Text>}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Quantity Sold *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quantityScroller}
                contentContainerStyle={styles.quantityScrollerContent}
              >
                {Array.from({ length: 50 }, (_, i) => i + 1).map((qty) => (
                  <TouchableOpacity
                    key={qty}
                    style={[
                      styles.quantityChip,
                      salesCount === qty.toString() && styles.quantityChipSelected
                    ]}
                    onPress={() => {
                      setSalesCount(qty.toString());
                      if (errors.salesCount) {
                        const newErrors = { ...errors };
                        delete newErrors.salesCount;
                        setErrors(newErrors);
                      }
                    }}
                  >
                    <Text style={[
                      styles.quantityChipText,
                      salesCount === qty.toString() && styles.quantityChipTextSelected
                    ]}>
                      {qty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.salesCount && <Text style={styles.errorText}>{errors.salesCount}</Text>}
            </View>

            {selectedVariant && selectedVariant.sales && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  Total Sales for this variant: {selectedVariant.sales.length}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title={loading ? 'Recording...' : 'Record Sale'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  modalTitle: {
    ...Typography.sectionTitle,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  footerButton: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
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
  errorText: {
    ...Typography.label,
    color: Colors.status.danger,
    marginTop: Spacing.xs,
  },
  quantityScroller: {
    marginBottom: Spacing.xs,
  },
  quantityScrollerContent: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  quantityChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.surface.primary,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityChipSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary,
  },
  quantityChipText: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 18,
    color: Colors.text.primary,
  },
  quantityChipTextSelected: {
    color: Colors.background.primary,
  },
});
