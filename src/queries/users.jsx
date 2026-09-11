"use client";

import { useMutation, useQuery, useQueryClient, useQueryContext } from "@tanstack/react-query";
import { api, fileSend } from "../api/api";
import { useUserContext } from '../context/UserContext';
import { requireMutationSuccess } from "./mutationResponse";
import { storeAuthTokens,extractAuthTokens } from "../auth/storage";
import { Password } from "@mui/icons-material";

const scopedQueryIds = (value) => {
  if (value === null || value === undefined) return [];
  const canonical = String(value).trim();
  if (!canonical) return [];
  return Object.is(value, canonical) ? [value] : [value, canonical];
};

const invalidateScopedUser = (queryClient, userId) => {
  scopedQueryIds(userId).forEach((id) => {
    queryClient.invalidateQueries({ queryKey: ["user", id] });
  });
};

const invalidateUserIdentity = (queryClient, userId) => {
  queryClient.invalidateQueries({ queryKey: ["allUsers"] });
  invalidateScopedUser(queryClient, userId);
  queryClient.invalidateQueries({ queryKey: ["statisticsByUserId"] });
  queryClient.invalidateQueries({ queryKey: ["currentUser"] });
};

// Fetch all users
export const fetchAllUsers = async (page = 0, size = 20) => {
  const response = await api.get(`/user/getAllUsers`, {
    params: { page, size }
  });
  return response.data.meta.list;
};

export const useAllUsers = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ["allUsers", page, size],
    queryFn: () => fetchAllUsers(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const fetchAllRoles = async (page = 0, size = 50) => {
  const response = await api.get(`/role/getAll`, {
    params: { page, size }
  });
  const body = response.data;
  return body?.meta?.list || body?.data?.list || body?.data || [];
};

export const useAllRoles = (page = 0, size = 50) => {
  return useQuery({
    queryKey: ["allRoles", page, size],
    queryFn: () => fetchAllRoles(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch user by id
export const fetchUserById = async (id) => {
  const response = await api.get(`/user/getUserById`, { params: { id } });
  return response.data;
};

export const useUserById = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};


// Update user profile





/**
 * @typedef {{ docType: "PASSPORT" | "ID_CARD" | "ORG_CERTIFICATE" | "AUTHORIZATION", file: File }} UserDocumentUploadVariables
 */

export const useUserDocumentUpload = () => {
  // Upload KYC document

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      /** @type {UserDocumentUploadVariables} */ { docType, file }
    ) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fileSend.post(
        "/user-documents/upload-file",
        formData,
        {
          params: { docType },
        }
      );

      return requireMutationSuccess(response.data, ["OK", "CREATED"]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });
};



export const useUpdateUser = () => {
  const { refetch } = useUserContext()
  return useMutation({
    mutationFn: async (updatedData) => {
      const {id, ...payloadWithoutId} = updatedData;
      const response = await api.put('/user/updateUser', payloadWithoutId)
      return requireMutationSuccess(response.data);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

// Update user balance
export const useCreateNotif = () =>
  useMutation({
    mutationFn: async ({ userId, title }) => {
      const response = await api.post(`/notification/create`, { userId, title });
      requireMutationSuccess(response);
      return response;
    },
  });

// Update user balance
export const useAddBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, balance }) => {
      const response = await api.post(`/user/addBalance?userId=${userId}&balance=${balance}`);
      requireMutationSuccess(response);
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      invalidateScopedUser(queryClient, variables?.userId);
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["statisticsByUserId"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["tranStatistics"] });
    },
  });
};


// Update user email
export const useUpdateEmail = () =>
  useMutation({
    mutationFn: async ({ email, newEmail }) => {
      const response = await api.put(`/user/updateEmail`, null, { params: { email, newEmail } });
      requireMutationSuccess(response);
      return response;
    },
  });

// Verify updated email
// export const useUpdateEmailVerify = () => {
//   const { refetch } = useUserContext();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ oldEmail, newEmail, code }) => {
//       const response = await api.post(`/user/checkUpdatedEmail`, null, { params: { oldEmail, newEmail, code } });
//       requireMutationSuccess(response);
//       return response;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["currentUser"] });
//       refetch();
//     },
//   });
// };

// Verify updated email
export const useUpdateEmailVerify = () => {
  const { refetch } = useUserContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, oldEmail, newEmail, code }) => {
      const params = {
        email: email || oldEmail,
        newEmail,
        code,
      };
      if (oldEmail !== undefined) {
        params.oldEmail = oldEmail;
      }
      const response = await api.put('/user/checkUpdatedEmail', null, { params });
      requireMutationSuccess(response);
      return response;
    },
    onSuccess: (response) => {
      const tokens = extractAuthTokens(response.data ?? response);
      console.log(tokens)
      if (tokens) {
        storeAuthTokens(tokens);
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      refetch();
    },
  });
}

// Update user password
export const useUpdatePassword = () =>
  useMutation({
    mutationFn: async ({ email, newPassword }) => {
      const response = await api.put(`/user/updatePassword`, null, { params: { email, newPassword } });
      requireMutationSuccess(response);
      return response;
    },
  });

// Update user password
export const useUpdatePasswordWithOld = () =>
  useMutation({
    mutationFn: async ({ email, newPassword, oldPassword }) => {
      const response = await api.put(`/user/updatePasswordWithOldPassword`, null, { params: { email, newPassword, oldPassword } });
      requireMutationSuccess(response);
      return response;
    },
  });

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleIds }) => {
      const response = await api.delete(`/user/deleteRoleFromUsers`, {
        params: { userId, roleIds: Array.isArray(roleIds) ? roleIds : [roleIds] },
        paramsSerializer: { indexes: null },
      });
      requireMutationSuccess(response);
      return response;
    },
    onSuccess: (_data, variables) => {
      invalidateUserIdentity(queryClient, variables?.userId);
    },
  });
};

// Add role
export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleIds }) => {
      const response = await api.post(`/user/addRoleToUser`, null, {
        params: { userId, roleIds: Array.isArray(roleIds) ? roleIds : [roleIds] },
        paramsSerializer: { indexes: null },
      });
      requireMutationSuccess(response);
      return response;
    },
    onSuccess: (_data, variables) => {
      invalidateUserIdentity(queryClient, variables?.userId);
    },
  });
};

// Verify updated password
// export const useUpdatePasswordVerify = () =>
//   useMutation({
//     mutationFn: async ({ email, password, code }) => {
//       const response = await api.post(`/user/checkUpdatedPassword`, null, { params: { email, password, code } });
//       requireMutationSuccess(response);
//       return response;
//     },
//   });

export const useUpdatePasswordVerify = () => {
  const { refetch } = useUserContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, code }) => {
      const response = await api.post('/user/checkUpdatedPassword', null, { params: { email, password, code } });
      requireMutationSuccess(response);
      return response;
    },
    onSuccess: (response) => {
      const tokens = extractAuthTokens(response.data ?? response);
      if (tokens) {
        storeAuthTokens(tokens);
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      refetch();
    },
  });
};

// block user 
export const useBlockUserMutation = (onSuccess, onError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await api.put(`/user/block/${userId}`);
      return requireMutationSuccess(response.data);
    },
    onSuccess: (data, variables) => {
      invalidateUserIdentity(queryClient, variables);
      if (onSuccess) onSuccess(data, variables);
    },
    onError,
  });
};


// Fetch users depositted lots
export const fetshUserDeposits = async (userId, page = 0, size = 50) => {
  try {
    const response = await api.get(`/deposit/getUserDeposits/${userId}`, {
      params: { page, size },
    });
    // Backend javobi: { code: 200, message: "...", status: "OK", data: { totalPages, elements: [...] } }
    const body = response.data;
    if (Array.isArray(body)) return body;
    const dataField = body?.data;
    if (Array.isArray(dataField)) return dataField;
    // Paginated format: { data: { elements: [...] } }
    if (dataField && typeof dataField === 'object') {
      if (Array.isArray(dataField.elements)) return dataField.elements;
      if (Array.isArray(dataField.content)) return dataField.content;
      if (Array.isArray(dataField.contents)) return dataField.contents;
    }
    if (Array.isArray(body.content)) return body.content;
    if (Array.isArray(body.contents)) return body.contents;
    if (Array.isArray(body?.meta?.list)) return body.meta.list;
    return [];
  } catch (error) {
    console.error("Error fetching user's deposits:", error);
    throw error;
  }
};


export const useUserDeposits = (userId) => {
  const enabled =
    userId !== null &&
    userId !== undefined &&
    String(userId).trim() !== "" &&
    String(userId) !== "0";
  return useQuery({
    queryKey: ["userDeposits", userId],
    queryFn: () => fetshUserDeposits(userId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error("Query Error:", error);
    },
  });
};

export const useGetIdentities = () => {
  return useQuery({
    queryKey: ["accountIdentities"],
    queryFn: async () => {
      const response = await api.get(`/account/identities`);
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });
};

export const useLinkGoogleIdentity = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(`/account/identities/google`, payload);
      return response.data;
    },
  });
};

export const useLinkTelegramIdentity = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(`/account/identities/telegram`, payload);
      return response.data;
    },
  });
};
