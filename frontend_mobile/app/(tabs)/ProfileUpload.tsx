import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

type ProfileUploadProps = {
  onImageUpdate: (uri: string) => void;
  onError: (error: string) => void;
  currentImage?: string;
  maxSize?: number; // en bytes
  allowedTypes?: string[]; // mime types ex: ["image/jpeg", "image/png"]
};

const COLOR_BG = "#DFECC6";
const COLOR_PRIMARY = "#8E9C78";
const COLOR_MUTED = "#929292";
const COLOR_WHITE = "#FFFFFF";

const ProfileUpload: React.FC<ProfileUploadProps> = ({
  onImageUpdate,
  onError,
  currentImage,
  maxSize = 5 * 1024 * 1024, // 5 MB
  allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
}) => {
  const [imageUri, setImageUri] = useState<string | undefined>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateImage = (fileSize?: number, mimeType?: string): boolean => {
    // taille
    if (fileSize && fileSize > maxSize) {
      const msg = "L'image ne doit pas dépasser 5MB.";
      setErrorMessage(msg);
      onError(msg);
      return false;
    }

    // type
    if (mimeType && !allowedTypes.includes(mimeType)) {
      const msg = "Seuls les formats JPG et PNG sont acceptés.";
      setErrorMessage(msg);
      onError(msg);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handlePickImage = async () => {
    try {
      // Demande permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const msg = "Permission refusée : accès à la galerie nécessaire.";
        setErrorMessage(msg);
        onError(msg);
        
        // Proposer d'ouvrir les paramètres
        Alert.alert(
          "Permission requise",
          "L'accès à la galerie est nécessaire pour ajouter une photo. Voulez-vous ouvrir les paramètres de l'application ?",
          [
            { text: "Annuler", style: "cancel" },
            { 
              text: "Ouvrir paramètres", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }

      setIsUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: false, // tu peux mettre true si tu veux envoyer du base64
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const asset = result.assets[0];

      // Validation
      const isValid = validateImage(asset.fileSize, asset.mimeType);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      setImageUri(asset.uri);
      onImageUpdate(asset.uri); // on remonte l'URI au parent
    } catch (e) {
      console.error(e);
      const msg = "Erreur lors du traitement de l'image.";
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {/* Image ou placeholder */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person" size={40} color={COLOR_MUTED} />
            </View>
          )}
        </View>

        {/* Bouton caméra */}
        <TouchableOpacity
          style={styles.avatarEditBadge}
          onPress={handlePickImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={COLOR_WHITE} />
          ) : (
            <Ionicons name="camera" size={16} color={COLOR_WHITE} />
          )}
        </TouchableOpacity>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  container: {
    width: 100,
    height: 100,
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLOR_PRIMARY,
    backgroundColor: COLOR_WHITE,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_WHITE,
  },
  avatarEditBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLOR_BG,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "red",
  },
});

export default ProfileUpload;
