import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Shield,
  Info,
  Pencil,
  CreditCard,
  X,
  Eye,
  EyeOff,
  LogOut,
  Trash,
  Play,
  QrCode,
  Users,
} from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { UserService } from '@/services/userService';
import { ProfileService } from '@/services/profileService';
import { FileService } from '@/services/fileService';
import IconButton from '@/components/ui/IconButton';
import QRCodeModal from '@/components/modals/QRCodeModal';
import * as ImagePicker from 'expo-image-picker';
import AuthGuard from '@/authentification/authGuard';

export default function ProfileScreen() {
  const router = useRouter();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [userCode, setUserCode] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [storedUsername, storedUserCode, storedImageUrl] =
          await Promise.all([
            AsyncStorage.getItem('Username'),
            AsyncStorage.getItem('UserCode'),
            AsyncStorage.getItem('ImageUrl'),
          ]);

        if (storedUsername) setUsername(storedUsername);
        if (storedUserCode) setUserCode(storedUserCode);
        if (storedImageUrl) {
          setProfileImage(storedImageUrl);
        }
      } catch (err) {
        //TODO messagebox
        console.error('Error loading user data:', err);
      }
    };

    loadUserData();
  }, []);

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePaymentMethod = async () => {
    try {
      const response = await ProfileService.connectPayment();

      if (response?.success && response.message) {
        window.open(response.message.url, '_blank');
      } else {
        console.error('Unexpected response:', response);
        alert('Something went wrong while connecting to Stripe.');
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      alert('Failed to initiate Stripe connection.');
    }
  };

  const handleInfo = () => {
    setShowInfoModal(true);
  };

  const extractBase64AndType = (dataUri: string) => {
    const match = dataUri.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      throw new Error('Invalid base64 image format');
    }
    const [, contentType, base64] = match;
    return { contentType, base64 };
  };

  const handleUploadImage = async () => {
    // Ask for permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);

      try {
        const { base64, contentType } = extractBase64AndType(imageUri);
        const response = await FileService.uploadProfileImage(
          base64,
          contentType
        );
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Image upload failed');
      }
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await AsyncStorage.multiRemove([
        'AccessToken',
        'Username',
        'UserCode',
        'UserImage',
      ]);
      router.replace('/login');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    setError('');
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);

    try {
      const requestBody = {
        oldpassword: currentPassword,
        newpassword: newPassword,
        newpasswordrepeat: confirmPassword,
      };

      console.log('Sending password change request:', requestBody);

      const response = await UserService.changePassword(requestBody);

      if (response.Success) {
        console.log('Password updated successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
      } else {
        console.error('Failed to update password:', response.Message);
        try {
          const parsed =
            typeof response.Message === 'string'
              ? JSON.parse(response.Message)
              : response.Message;
          setError(parsed);
        } catch (parseError) {
          setError(response.Message || 'Failed to update password');
        }
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.profileSection}>
            <View style={styles.profileImageGroup}>
              <Image
                source={{
                  uri:
                    profileImage ||
                    'https://images.pexels.com/photos/2531553/pexels-photo-2531553.jpeg',
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileActionsRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleUploadImage}
                >
                  <Pencil color="#fff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => console.log('Friends')}
                >
                  <Users color="#fff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowQRModal(true)}
                >
                  <QrCode color="#fff" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.username}>{username}</Text>
            <Text style={styles.usercode}>{userCode}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Shield size={24} color="#fff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Change Password</Text>
                <Text style={styles.actionSubtitle}>
                  Update your security settings
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePaymentMethod}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <CreditCard size={24} color="#fff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Payment method</Text>
                <Text style={styles.actionSubtitle}>
                  Manage your payment details
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleInfo}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Info size={24} color="#fff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Info</Text>
                <Text style={styles.actionSubtitle}>About the application</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, styles.logoutIcon]}>
                <LogOut size={24} color="#fff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Log Out</Text>
                <Text style={styles.actionSubtitle}>
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Info</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowInfoModal(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                This application is developed by Efford AG based in Switzerland.
                In case of bugs or mal functionality please contact us as soon
                as possible.
              </Text>

              <View style={styles.versionInfo}>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>Current version:</Text>
                  <Text style={styles.versionValue}>1.0.1</Text>
                </View>

                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>
                    Latest available version:
                  </Text>
                  <Text style={styles.versionValue}>1.0.1</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.light.placeholder}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color="#fff" />
                    ) : (
                      <Eye size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors.light.placeholder}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color="#fff" />
                    ) : (
                      <Eye size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.light.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#fff" />
                    ) : (
                      <Eye size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                label="Update Password"
                onPress={handleUpdatePassword}
                loading={loading}
                style={styles.updateButton}
              />
            </View>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Logout</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Are you sure you want to log out?
              </Text>

              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  onPress={() => setShowLogoutModal(false)}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  label="Log Out"
                  onPress={handleLogout}
                  style={StyleSheet.flatten([
                    styles.modalButton,
                    styles.logoutModalButton,
                  ])}
                />
              </View>
            </View>
          </View>
        </Modal>

        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrcodedata={userCode}
          title="User Code"
          displaymessage="Scan this code in the collaborator window to add user as a collaborator"
        />
      </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Sizes.spacing.md,
    paddingBottom: Sizes.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.spacing.xl,
  },
  title: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.tint,
    marginHorizontal: Sizes.spacing.lg,
    opacity: 0.6,
    marginTop: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Sizes.spacing.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Sizes.spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.cardAlt,
    marginBottom: Sizes.spacing.sm,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.xs,
    fontFamily: 'Inter-Bold',
  },
  usercode: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    gap: Sizes.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    marginLeft: Sizes.spacing.lg,
    flex: 1,
  },
  actionTitle: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  actionSubtitle: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    marginTop: Sizes.spacing.xl,
  },
  logoutIcon: {
    backgroundColor: Colors.light.inactive,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.xl,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.xl,
    position: 'relative',
  },
  modalTitle: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: Sizes.spacing.xs,
  },
  modalDescription: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: Sizes.spacing.xl,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  versionInfo: {
    backgroundColor: Colors.light.cardAlt,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    gap: Sizes.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  versionValue: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    color: Colors.light.inactive,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  inputLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    marginBottom: Sizes.spacing.xs,
    fontFamily: 'Inter-Medium',
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Sizes.radius.sm,
    height: 50,
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    paddingRight: 50,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: Sizes.spacing.md,
    top: 15,
  },
  updateButton: {
    marginTop: Sizes.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  logoutModalButton: {
    backgroundColor: Colors.light.inactive,
  },
  profileActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center', // 👈 centers items horizontally
    alignItems: 'center', // 👈 aligns vertically in the row
    gap: Sizes.spacing.sm,
    marginTop: Sizes.spacing.sm,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileImageGroup: {
    alignItems: 'center', // ⬅️ centers everything horizontally
    marginBottom: Sizes.spacing.md,
  },
});
