import { Ionicons } from '@expo/vector-icons';
import { Camera, MapView, PointAnnotation, setAccessToken, StyleURL } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

// Mapbox access token - get from environment variable or use default
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaGFocyIsImEiOiJjbWU2aTNmNXYxNm10MmlzY29zYTlldm93In0.h6GD-qsgCvBU0m36Z5-fWw';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (latitude: number, longitude: number, address?: string) => void;
  initialLocation?: { latitude: number; longitude: number; address?: string } | null;
}

export function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: LocationPickerModalProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [hasMapSupport, setHasMapSupport] = useState(true); // Start with true, will be set to false if error
  const [zoomLevel, setZoomLevel] = useState(15);
  const insets = useSafeAreaInsets();

  // Set Mapbox access token when component mounts
  useEffect(() => {
    const setupMapbox = async () => {
      try {
        // Try to set access token
        if (MAPBOX_ACCESS_TOKEN) {
          await setAccessToken(MAPBOX_ACCESS_TOKEN);
          setHasMapSupport(true);
        } else {
          setHasMapSupport(false);
        }
      } catch (error) {
        // Don't disable - native module might not be ready yet but will work after rebuild
        // setHasMapSupport(false);
      }
    };
    
    setupMapbox();
  }, []);

  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setSelectedLocation({
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        });
      } else {
        getCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialLocation]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần quyền truy cập vị trí để sử dụng tính năng này');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      setCurrentLocation({ lat, lng });
      if (!initialLocation) {
        setSelectedLocation({ lat, lng });
      }
    } catch (error) {
      // Silent fail
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { geometry } = event;
    if (geometry && geometry.coordinates) {
      const [longitude, latitude] = geometry.coordinates;
      setSelectedLocation({ lat: latitude, lng: longitude });
    }
  };



  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.lat, selectedLocation.lng, undefined);
    } else {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí trên bản đồ');
    }
  };

  const mapRegion = selectedLocation || currentLocation || { lat: 10.762622, lng: 106.660172 };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Chọn vị trí</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {loading && !currentLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#68C2E8" />
            <ThemedText style={styles.loadingText}>Đang lấy vị trí...</ThemedText>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Map View (using Mapbox) */}
            {MAPBOX_ACCESS_TOKEN ? (
              <View style={styles.mapContainer}>
                {hasMapSupport ? (
                  <MapView
                    style={styles.map}
                    styleURL={StyleURL.Street}
                    onPress={handleMapPress}
                    onDidFinishLoadingMap={() => {
                      setMapReady(true);
                    }}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Camera
                      defaultSettings={{
                        centerCoordinate: [mapRegion.lng, mapRegion.lat],
                        zoomLevel: zoomLevel,
                      }}
                      centerCoordinate={selectedLocation ? [selectedLocation.lng, selectedLocation.lat] : [mapRegion.lng, mapRegion.lat]}
                      zoomLevel={zoomLevel}
                      animationMode="flyTo"
                      animationDuration={300}
                    />
                    {selectedLocation && mapReady && (
                      <PointAnnotation
                        id="selectedLocation"
                        coordinate={[selectedLocation.lng, selectedLocation.lat]}
                        draggable
                      onDragEnd={(feature) => {
                        const [longitude, latitude] = feature.geometry.coordinates;
                        setSelectedLocation({ lat: latitude, lng: longitude });
                      }}
                      >
                        <View style={styles.markerContainer}>
                          <View style={styles.markerPin} />
                        </View>
                      </PointAnnotation>
                    )}
                  </MapView>
                ) : (
                  <View style={styles.map}>
                    <ActivityIndicator size="large" color="#68C2E8" style={{ marginTop: 180 }} />
                    <ThemedText style={{ textAlign: 'center', marginTop: 16, color: '#7F8C8D' }}>
                      Đang tải bản đồ...
                    </ThemedText>
                  </View>
                )}
                <View style={styles.mapOverlay}>
                  <ThemedText style={styles.mapHint}>
                    Chạm vào bản đồ hoặc kéo marker để chọn vị trí
                  </ThemedText>
                </View>
                {/* Zoom Controls */}
                <View style={styles.zoomControls}>
                  <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => {
                      setZoomLevel(Math.min(zoomLevel + 1, 20));
                    }}
                  >
                    <Ionicons name="add" size={20} color="#2C3E50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => {
                      setZoomLevel(Math.max(zoomLevel - 1, 5));
                    }}
                  >
                    <Ionicons name="remove" size={20} color="#2C3E50" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noMapContainer}>
                <Ionicons name="map-outline" size={64} color="#BDC3C7" />
                <ThemedText style={styles.noMapText}>
                  Để sử dụng bản đồ tương tác, vui lòng cấu hình Mapbox Access Token
                </ThemedText>
                <ThemedText style={styles.noMapSubtext}>
                  setAccessToken(&apos;YOUR_TOKEN&apos;)
                </ThemedText>
              </View>
            )}

            {/* Current Location Button */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.currentLocationButton, loading && styles.buttonDisabled]}
                onPress={getCurrentLocation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#68C2E8" />
                ) : (
                  <Ionicons name="locate" size={20} color="#68C2E8" />
                )}
                <ThemedText style={styles.currentLocationText}>
                  {loading ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
                </ThemedText>
              </TouchableOpacity>

              {/* Selected Location Info */}
              {selectedLocation && (
                <View style={styles.selectedLocationContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.selectedLocationText}>
                      Vị trí đã chọn:
                    </ThemedText>
                    <ThemedText style={styles.selectedLocationCoordinates}>
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <ThemedText style={styles.confirmButtonText}>Xác nhận</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBED',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    height: 400,
    width: '100%',
    position: 'relative',
    marginBottom: 0,
    backgroundColor: '#E8EBED',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapHint: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  noMapContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  noMapText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  noMapSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#68C2E8',
    gap: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  selectedLocationText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedLocationCoordinates: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8EBED',
    gap: 12,
    backgroundColor: '#fff',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#68C2E8',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
