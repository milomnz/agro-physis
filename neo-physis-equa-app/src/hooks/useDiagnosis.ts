import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useActionFeedback } from "../feedback/context";
import { isUnauthorizedError } from "../services/api";
import { getCrops, type Crop } from "../services/crops";
import { analyzeCropDiagnosis } from "../services/diagnosis";
import { programarRecordatorioCultivo } from "../services/notifications";
import { createPest, getPests, updatePest, type Pest } from "../services/pests";
import {
  DIAGNOSIS_QUESTIONS,
  normalizeText,
  rankPests,
  type DiagnosisAnswers,
  type PestMatch,
} from "../utils/symptom-diagnosis";
import { useRequireSession } from "./useRequireSession";

export type DiagnosisStage =
  | "crop"
  | "photo"
  | "question"
  | "analyzing"
  | "result";

export interface SelectedLeafPhoto {
  uri: string;
  base64: string;
  mimeType: string;
}

export function useDiagnosis() {
  const params = useLocalSearchParams<{ cropId: string }>();
  const initialCropId =
    typeof params.cropId === "string" && params.cropId
      ? params.cropId
      : undefined;
  const sessionReady = useRequireSession();
  const { notifySuccess } = useActionFeedback();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string | undefined>(initialCropId);
  const [pests, setPests] = useState<Pest[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingPests, setLoadingPests] = useState(Boolean(initialCropId));
  const [error, setError] = useState("");

  const [photo, setPhoto] = useState<SelectedLeafPhoto | null>(null);
  const [photoStepConfirmed, setPhotoStepConfirmed] = useState(false);
  const [questionIndex, setQuestionsIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({});

  const [analyzing, setAnalyzing] = useState(false);
  const [showLocalFallbackButton, setShowLocalFallbackButton] = useState(false);
  const switchedToLocalRef = useRef(false);
  const [results, setResults] = useState<PestMatch[]>([]);
  const [diagnosisSource, setDiagnosisSource] = useState<"gemini" | "catalog">(
    "catalog",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [savingPestKey, setSavingPestKey] = useState<string | null>(null);
  const [savedPestIds, setSavedPestIds] = useState<Record<string, string>>({});

  const totalQuestions = DIAGNOSIS_QUESTIONS.length;

  useEffect(() => {
    if (!sessionReady) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getCrops();
        if (!cancelled) setCrops(data);
      } catch (err: unknown) {
        if (cancelled || isUnauthorizedError(err)) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar los cultivos",
        );
      } finally {
        if (!cancelled) setLoadingCrops(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionReady]);

  useEffect(() => {
    if (!sessionReady || !cropId) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getPests(cropId);
        if (!cancelled) setPests(data);
      } catch (err: unknown) {
        if (cancelled || isUnauthorizedError(err)) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar las plagas",
        );
      } finally {
        if (!cancelled) setLoadingPests(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cropId, sessionReady]);

  const loading = loadingCrops || loadingPests;
  const crop = crops.find((c) => c.id === cropId);
  const question = DIAGNOSIS_QUESTIONS[questionIndex];

  const stage: DiagnosisStage = !cropId
    ? "crop"
    : !photoStepConfirmed
      ? "photo"
      : analyzing
        ? "analyzing"
        : questionIndex >= totalQuestions
          ? "result"
          : "question";

  const pickImageFromSource = async (mode: "camera" | "gallery") => {
    setError("");
    try {
      const permission =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          mode === "camera"
            ? "Necesitamos permiso de cámara para tomar la foto de la hoja."
            : "Necesitamos permiso para acceder a tu galería de fotos.",
        );
        return;
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.4,
        base64: true,
      };

      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        setError(
          "No se pudo procesar la imagen seleccionada. Intenta con otra foto.",
        );
        return;
      }

      setPhoto({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al capturar la fotografía",
      );
    }
  };

  const takePhoto = () => pickImageFromSource("camera");
  const pickFromGallery = () => pickImageFromSource("gallery");
  const clearPhoto = () => setPhoto(null);

  const continueToQuestions = () => {
    setError("");
    setPhotoStepConfirmed(true);
  };

  useEffect(() => {
    if (!analyzing) {
      setShowLocalFallbackButton(false);
      return;
    }
    const timerId = setTimeout(() => {
      setShowLocalFallbackButton(true);
    }, 4000);
    return () => clearTimeout(timerId);
  }, [analyzing]);

  const useLocalDiagnosisNow = () => {
    switchedToLocalRef.current = true;
    const localMatches = rankPests(pests, answers);
    setResults(localMatches);
    setDiagnosisSource("catalog");
    setAnalyzing(false);
  };

  const runDiagnosis = async (finalAnswers: DiagnosisAnswers) => {
    if (!cropId) return;
    switchedToLocalRef.current = false;
    setAnalyzing(true);
    setError("");

    try {
      const response = await analyzeCropDiagnosis({
        cropId,
        answers: finalAnswers,
        imageBase64: photo?.base64,
        mimeType: photo?.mimeType,
      });

      // Siempre conservamos la URL subida a Cloudinary aunque haya saltado al diagnóstico local
      if (response.imageUrl) {
        setUploadedImageUrl(response.imageUrl);
      }

      if (!switchedToLocalRef.current) {
        setResults(response.matches);
        setDiagnosisSource(response.source);
      }
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) return;
      if (!switchedToLocalRef.current) {
        const localMatches = rankPests(pests, finalAnswers);
        setResults(localMatches);
        setDiagnosisSource("catalog");
        setUploadedImageUrl(null);
      }
    } finally {
      if (!switchedToLocalRef.current) {
        setAnalyzing(false);
      }
    }
  };

  const chooseCrop = (id: string) => {
    setError("");
    setPests([]);
    setPhoto(null);
    setPhotoStepConfirmed(false);
    setAnswers({});
    setQuestionsIndex(0);
    setResults([]);
    setUploadedImageUrl(null);
    setSavedPestIds({});
    setLoadingPests(true);
    setCropId(id);
  };

  const changeCrop = () => {
    setError("");
    setPests([]);
    setPhoto(null);
    setPhotoStepConfirmed(false);
    setAnswers({});
    setQuestionsIndex(0);
    setResults([]);
    setUploadedImageUrl(null);
    setSavedPestIds({});
    setCropId(undefined);
  };

  const answer = (questionId: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    const nextIndex = questionIndex + 1;
    setQuestionsIndex(nextIndex);

    if (nextIndex >= totalQuestions) {
      void runDiagnosis(nextAnswers);
    }
  };

  const goBack = () => {
    if (questionIndex > 0) {
      setQuestionsIndex((index) => index - 1);
    } else {
      setPhotoStepConfirmed(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setQuestionsIndex(0);
    setResults([]);
    setSavedPestIds({});
    setPhotoStepConfirmed(false);
  };

  const saveMatchToHistory = async (candidate: Pest) => {
    if (!cropId) return;
    const key = candidate.id || candidate.commonName;
    setSavingPestKey(key);
    setError("");

    try {
      const photoReference =
        uploadedImageUrl ??
        candidate.imageReferences?.[0] ??
        photo?.uri ??
        null;

      // Si ya existe esa plaga en este cultivo, actualizamos su registro y le agregamos la nueva foto
      const existing = pests.find(
        (item) =>
          normalizeText(item.commonName) ===
          normalizeText(candidate.commonName),
      );

      let savedPest: Pest;
      if (existing) {
        const currentImages = existing.imageReferences ?? [];
        const nextImages =
          photoReference && !currentImages.includes(photoReference)
            ? [photoReference, ...currentImages]
            : currentImages;

        savedPest = await updatePest(existing.id, {
          severity: candidate.severity,
          symptoms:
            candidate.symptoms.length > 0
              ? candidate.symptoms
              : existing.symptoms,
          imageReferences: nextImages,
        });
        setPests((prev) =>
          prev.map((p) => (p.id === savedPest.id ? savedPest : p)),
        );
      } else {
        savedPest = await createPest({
          cropId,
          commonName: candidate.commonName,
          scientificName: candidate.scientificName ?? undefined,
          severity: candidate.severity,
          symptoms: candidate.symptoms,
          affectedCrops: crop?.species ? [crop.species] : [],
          imageReferences: photoReference ? [photoReference] : [],
        });
        setPests((prev) => [savedPest, ...prev]);
      }

      void programarRecordatorioCultivo({
        cropId,
        cropName: crop?.species,
        pestName: savedPest.commonName,
        severity: savedPest.severity,
      });

      setSavedPestIds((prev) => ({ ...prev, [key]: savedPest.id }));
      notifySuccess(
        `Diagnóstico de ${savedPest.commonName} guardado en el historial`,
      );
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) return;
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el diagnóstico en el historial",
      );
    } finally {
      setSavingPestKey(null);
    }
  };

  return {
    stage,
    loading,
    error,
    crops,
    crop,
    photo,
    question,
    questionIndex,
    totalQuestions,
    answers,
    results,
    diagnosisSource,
    uploadedImageUrl,
    savingPestKey,
    savedPestIds,
    chooseCrop,
    changeCrop,
    takePhoto,
    pickFromGallery,
    clearPhoto,
    continueToQuestions,
    answer,
    goBack,
    restart,
    saveMatchToHistory,
    showLocalFallbackButton,
    useLocalDiagnosisNow,
    dismissError: () => setError(""),
  };
}
