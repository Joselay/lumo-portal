import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
