// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useFetchUserByToken } from "./Hooks";
// import { toast } from "react-toastify";
// import { useQueryClient } from "react-query";

// const useCheckUserStatus = () => {
//     const navigate = useNavigate();
//     const queryClient = useQueryClient();
//     const token = localStorage.getItem("token");

//     const [isChecking, setIsChecking] = useState(true); // Prevents early redirects

//     const { data, refetch, isFetching } = useFetchUserByToken(token, { 
//         enabled: !!token, 
//         refetchOnWindowFocus: true,
//         staleTime: 0, 
//         cacheTime: 0, // Forces fresh API call
//     });

//     const user = data?.data ?? null;

//     useEffect(() => {
//         if (user && typeof user === "object") {
//             if (!user.isActive && !isFetching) {
//                 setIsChecking(true); // Prevent multiple redirects
//                 localStorage.removeItem("token");
                
//                 // Clear cache and refetch to ensure fresh data
//                 queryClient.invalidateQueries("currentUser");
                
//                 setTimeout(() => {
//                     navigate("/login");
//                     toast.error("YOUR ACCOUNT IS BLOCKED");
//                 }, 500); // Small delay to prevent UI flickering
//             } else {
//                 setIsChecking(false);
//             }
//         }
//     }, [user, isFetching, navigate, queryClient]);

//     return { user, refetch, isChecking };
// };

// export default useCheckUserStatus;

import React from 'react'

export default function checkUserStatus() {
  return (
    <div>
      
    </div>
  )
}
