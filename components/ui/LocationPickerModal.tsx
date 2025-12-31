import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Try to import react-native-maps if available (for development build)
let MapView: any = null;
let Marker: any = null;
try {
  const maps = require('react-native-maps');
  MapView = maps.default || maps.MapView;
  Marker = maps.Marker || maps.default?.Marker;
} catch (e) {
  // react-native-maps not installed, will use fallback
  console.log('react-native-maps not available, using fallback');
}

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
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const hasMapSupport = MapView !== null;

  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setSelectedLocation({
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        });
        setManualLat(initialLocation.latitude.toString());
        setManualLng(initialLocation.longitude.toString());
      }
      getCurrentLocation();
    }
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
        setManualLat(lat.toString());
        setManualLng(lng.toString());
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ lat: latitude, lng: longitude });
    setManualLat(latitude.toString());
    setManualLng(longitude.toString());
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ lat: latitude, lng: longitude });
    setManualLat(latitude.toString());
    setManualLng(longitude.toString());
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
      setManualLat(currentLocation.lat.toString());
      setManualLng(currentLocation.lng.toString());
    }
  };

  const handleOpenMaps = () => {
    const lat = parseFloat(manualLat) || selectedLocation?.lat || 10.762622;
    const lng = parseFloat(manualLng) || selectedLocation?.lng || 106.660172;
    
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url || webUrl).catch((err) => {
      console.error('Error opening maps:', err);
      Alert.alert('Lỗi', 'Không thể mở bản đồ');
    });
  };

  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setSelectedLocation({ lat, lng });
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập tọa độ hợp lệ (Lat: -90 đến 90, Lng: -180 đến 180)');
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.lat, selectedLocation.lng, undefined);
    } else if (manualLat && manualLng) {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        onSelectLocation(lat, lng, undefined);
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập tọa độ hợp lệ');
      }
    } else {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí hoặc nhập tọa độ');
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
            {/* Map View (if react-native-maps is available) */}
            {hasMapSupport ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: mapRegion.lat,
                    longitude: mapRegion.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  region={{
                    latitude: mapRegion.lat,
                    longitude: mapRegion.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={handleMapPress}
                  onMapReady={() => {
                    setMapReady(true);
                  }}
                  mapType="standard"
                >
                  {selectedLocation && mapReady && (
                    <Marker
                      coordinate={{
                        latitude: selectedLocation.lat,
                        longitude: selectedLocation.lng,
                      }}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                      title="Vị trí đã chọn"
                      pinColor="#68C2E8"
                    />
                  )}
                </MapView>
                <View style={styles.mapOverlay}>
                  <ThemedText style={styles.mapHint}>
                    Chạm vào bản đồ hoặc kéo marker để chọn vị trí
                  </ThemedText>
                </View>
              </View>
            ) : (
              <View style={styles.noMapContainer}>
                <Ionicons name="map-outline" size={64} color="#BDC3C7" />
                <ThemedText style={styles.noMapText}>
                  Để sử dụng bản đồ tương tác, vui lòng cài đặt react-native-maps
                </ThemedText>
                <ThemedText style={styles.noMapSubtext}>
                  npm install react-native-maps
                </ThemedText>
                <TouchableOpacity
                  style={styles.openMapsButton}
                  onPress={handleOpenMaps}
                >
                  <Ionicons name="open-outline" size={20} color="#68C2E8" />
                  <ThemedText style={styles.openMapsText}>Mở bản đồ bên ngoài</ThemedText>
                </TouchableOpacity>
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

              {currentLocation && (
                <TouchableOpacity
                  style={styles.useLocationButton}
                  onPress={handleUseCurrentLocation}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
                  <ThemedText style={styles.useLocationText}>
                    Dùng vị trí: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {/* Manual Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputTitle}>Hoặc nhập tọa độ thủ công</ThemedText>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Vĩ độ (Latitude)</ThemedText>
                    <TextInput
                      style={styles.textInput}
                      value={manualLat}
                      onChangeText={setManualLat}
                      placeholder="Ví dụ: 10.762622"
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Kinh độ (Longitude)</ThemedText>
                    <TextInput
                      style={styles.textInput}
                      value={manualLng}
                      onChangeText={setManualLng}
                      placeholder="Ví dụ: 106.660172"
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleManualInput}
                >
                  <ThemedText style={styles.applyButtonText}>Áp dụng tọa độ</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Selected Location Info */}
              {selectedLocation && (
                <View style={styles.selectedLocationContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <ThemedText style={styles.selectedLocationText}>
                    Đã chọn: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </ThemedText>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, !selectedLocation && !manualLat && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!selectedLocation && !manualLat}
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
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  useLocationText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8EBED',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#68C2E8',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EBED',
    gap: 8,
    marginTop: 12,
  },
  openMapsText: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8EBED',
    gap: 12,
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
