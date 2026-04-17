import { useEffect } from "react";
import { useRouter } from "next/router";
import useFeature from "@/hooks/useFeature";

const FeatureGuard = ({ featureKey, children }) => {
  const router = useRouter();
  const enabled = useFeature(featureKey);

  useEffect(() => {
    if (enabled === false) {
      router.replace("/404");
    }
  }, [enabled]);

  if (enabled === false) return null;

  return children;
};

export default FeatureGuard;