import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { UserService } from '@/services/userService';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await UserService.login({
        username: username,
        password: password,
      });

      if (data.Success && data.AccessToken) {
        await Promise.all([
          AsyncStorage.setItem('AccessToken', data.AccessToken),
          AsyncStorage.setItem('Username', data.UserName || username),
          AsyncStorage.setItem('UserCode', data.Usercode || ''),
          AsyncStorage.setItem('ImageUrl', data.ImageUrl || ''),
        ]);

        // Navigate to tabs layout (main app)
        router.replace('/(tabs)');
      } else {
        setError(
          data.message || 'Login failed. Please check your credentials.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.length > 0 && password.length > 0;

  return (
    <ImageBackground
      source={require('@/assets/images/login-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255, 255, 255, 0.5)" />
                  ) : (
                    <Eye size={20} color="rgba(255, 255, 255, 0.5)" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label="Log In"
              onPress={handleLogin}
              disabled={!isFormValid}
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={() => router.push('/register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerLinkText}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Sizes.spacing.xl,
  },
  formContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.xs,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: Sizes.fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: Sizes.spacing.xl,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Sizes.radius.sm,
    height: 50,
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Sizes.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    padding: Sizes.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.inactive,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  button: {
    marginTop: Sizes.spacing.md,
  },
  registerLink: {
    marginTop: Sizes.spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    color: Colors.light.text,
    fontSize: Sizes.fontSize.md,
    opacity: 0.8,
    fontFamily: 'Inter-Regular',
  },
});
