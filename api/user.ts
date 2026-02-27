import apiClient from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

const USER_API_URL = "/user";

type UpdateProfilePayload = {
  name?: string;
  contact_number?: string;
  avatar?: {
    uri: string;
    name: string;
    type: string;
  };
};

const updateProfile = async (payload: UpdateProfilePayload) => {
  const { avatar, ...data } = payload;

  const formData = new FormData();

  // wrapped in a "data" key as a JSON string
  formData.append("data", JSON.stringify(data));

  if (avatar) {
    // React Native FormData accepts { uri, name, type } directly
    formData.append("avatar", avatar as unknown as Blob);
  }

  const response = await apiClient.patch(
    `${USER_API_URL}/update-profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response;
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
  });
};
