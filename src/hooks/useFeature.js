import { useSelector } from "react-redux";

const useFeature = (key) => {
  const flags = useSelector((state) => state.featureFlags?.flags);
  return flags?.[key]?.enabled ?? true;
};

export default useFeature;