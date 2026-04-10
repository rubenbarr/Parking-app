"use client";
import { AuthProvider } from "@/context/AuthContext";
import StoreProvider from "@/store/StoreProvider";
import React from "react";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Layout from "./Layout";

export default function WrapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const noLayOutRoutes = ["/", "/login", '/changePassword', '/recoverPassword', '/home'];
  const shouldSkipLayputContent = noLayOutRoutes.includes(path);

  return (
    <>
      <AuthProvider>
        <StoreProvider>
          <>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={true}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            {shouldSkipLayputContent ? children : <Layout>{children}</Layout>}
          </>
        </StoreProvider>
      </AuthProvider>
    </>
  );
}
