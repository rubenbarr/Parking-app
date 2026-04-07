"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Minimize2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { validateToken } from "@/api/authApi";

import LoadingComponent from "./Loading";
import Image from "next/image";
import logo from "./../assets/images/logoOriginalsmartparking.png";

import style from "./Layout.module.scss";

import cn from "classnames";

interface tokenResponse {
  name: string;
  userType: string;
  permissions: string[]
}
interface Response {
  state: boolean;
  message: string;
  data: tokenResponse;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const {
    user,
    logout,
    token,
    loadingContext,
    handleToast,
    isLogged,
    isLoadingGlobal,
    userType,
    setUserType,
    setPermissions,
    permissions
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [minimize, setMinimize] = useState(false);
  const [Logged, setIsLogged] = useState(isLogged || false);
  const [validating, isValidating] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);

  const operatorsUrls = [
    "dashboard",
    "ticketPayment",
    "settingsPage",
    "ticketValidation",
    "manualValidation",
    'ticketLost'
  ];
  const businessUrls = ["dashboard", "settingsPage", "ticketValidation"];
  const renderSideMenu = (userType: string) => {
    switch (userType) {
      case "operador":  
        return operatorMenu();
      case "global-admin":
          return adminMenu();
      case "negocio":
  return         negocioMenu();
      default:
        return null;
    }
  };

  useEffect(() => {
    const validateTokenReq = async () => {
      try {
        if (!loadingContext) {
          if (!token) router.replace("login");
          isValidating(true);
          const req = (await validateToken(token as string)) as Response;
          if (req.state) {
            setIsLogged(true);
            setUserType(req.data.userType);
            setPermissions(req.data.permissions)
          } else {
            router.replace("/login");
          }
        }
      } catch (error) {
        handleToast("error", error as string);
        router.replace("/login");
      } finally {
        isValidating(false);
      }
    };
    validateTokenReq();
  }, [loadingContext, router]);

  const handleUrls = (userType: string) => {
    switch (userType) {
      case "operador":
        if (!operatorsUrls.includes(path.split("/")[1])) {
          return router.replace("/dashboard");
        }
        break;
      case "negocio":
        if (!businessUrls.includes(path.split("/")[1])) {
          return router.replace("/dashboard");
        }
        break;
      case "global-admin":
        break;
      default:
        break
    }
  };

  useEffect(() => {
    userType && handleUrls(userType as string);
  }, [path, router, loadingContext, userType]);

  const handleSideMenu = (url: string) => {
    router.push(url);
    setMinimize(true);
  };

  const adminMenu = () => (
    <>
      <div className={style["side-top-menu"]}>
        <div onClick={() => handleSideMenu("/dashboard")} className="">
          Dashboard
        </div>
        <div onClick={() => handleSideMenu("/users")} className="">
          Usuarios
        </div>
        <div onClick={() => handleSideMenu("/locations")} className="">
          Ubicaciones
        </div>
        <div onClick={() => handleSideMenu("/kioscos")} className="">
          Kioscos
        </div>
        <div onClick={() => handleSideMenu("/payTicket")} className="">
          Pagar Ticket
        </div>
        <div onClick={() => handleSideMenu("/credits")} className="">
          Creditos
        </div>
        <div onClick={() => handleSideMenu("/ticketValidation")} className="">
          Validar ticket
        </div>
      </div>
      {buttonMenu()}
    </>
  );

  const buttonMenu = () => (
    <div className={style["side-bottom-menu"]}>
      <div onClick={() => handleSideMenu("/settingsPage")}>Ajustes</div>
      <div onClick={handleLogout}>Salir</div>
    </div>
  );
  const operatorMenu = () => (
    <>
      <div className={style["side-top-menu"]}>
        <div onClick={() => handleSideMenu("/dashboard")} className="">
          Dashboard
        </div>
        <div onClick={() => handleSideMenu("/ticketPayment")} className="">
          Pagar Ticket
        </div>
        {
          permissions.includes("validations") &&
        <div onClick={() => handleSideMenu("/ticketValidation")} className="">
          Validar ticket
        </div>
        }
      </div>
      {buttonMenu()}
    </>
  );

  const negocioMenu = () => (
    <>
      <div className={style["side-top-menu"]}>
        <div onClick={() => handleSideMenu("/dashboard")} className="">
          Dashboard
        </div>
        <div onClick={() => handleSideMenu("/ticketValidation")} className="">
          Validar ticket
        </div>
      </div>
      {buttonMenu()}
    </>
  );
  const handleLogout = () => {
    logout();
    router.replace("/login");
  };
  if (loadingContext || validating || !userType) return <LoadingComponent />;
  if (!Logged) return null;

  return (
    <div className={style["content"]}>
      {isLoadingGlobal && <LoadingComponent light={true} />}

      <header className={style["header"]}>
        <div className={style["header-left"]}>
          <div className={style["header-button"]}>
            <button
              onClick={() => {
                setDisplayMenu(!displayMenu);
                setMinimize(true);
              }}
              className=""
            >
              <Menu size={24} color="#14626d" />
            </button>
          </div>
          <Image src={logo} alt="Smart Parking" width={200} />
        </div>
        <div className="">{user && <span className="">{user}</span>}</div>
      </header>
      <div className={style["content-container"]}>
        <aside
          className={cn(
            style["sidebar"],
            { [style["minimize"]]: minimize },
            { [style["expand"]]: displayMenu },
          )}
        >
          <div className={style["side-bar-button"]}>
            {minimize ? (
              <button
                className={style["menu-icon"]}
                onClick={() => setMinimize(!minimize)}
              >
                <Minimize2 size={20} color="white" />
              </button>
            ) : (
              <button
                className={style["menu-icon"]}
                onClick={() => setMinimize(!minimize)}
              >
                <X size={24} color="white" />
              </button>
            )}
          </div>
          {!minimize && (
            <div className={style["sidebar-header"]}>
              <div className={style["header-title"]}>Menu</div>
            </div>
          )}

          {!minimize && (
            <nav className={style["side-menu"]}>
              {userType && renderSideMenu(userType)}
            </nav>
          )}
        </aside>
        <main
          className={style["main-content"]}
          onClick={() => setMinimize(true)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
