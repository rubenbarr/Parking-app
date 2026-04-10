/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowBigRight, TrashIcon } from "lucide-react";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createLocation,
  deleteLocationById,
  getLocationById,
  getLocations,
  updateLocationById,
} from "@/api/locationApi";

import { getUsers, Response } from "@/api/usersApi";
import { useAuth } from "@/context/AuthContext";
import { getKioscos } from "@/api/kioscos";
import ManageIcon from "@/assets/icons/ManageIcon";

const DetailCard = lazy(() => import("@/components/DetailCard/Detailcard"));

interface ILabelItem {
  label: string;
  value: string;
  isChecked?: boolean;
}
interface item {
  id: string;
  name: string;
}

interface ItemWithVals {
  type: string;
  label: string;
  values: string[];
}

interface ILocation {
  title: string;
  address: string;
  contact: string;
  kioscos: string[] | [];
  operators: string[] | [];
  createdAt?: string;
  createdBy?: string;
  locationId?: string;
  totalKioscos?: number;
  serialNumber?: string;
}

interface Itemplate {
  title: {
    type: string;
    label: string;
  };
  address: {
    type: string;
    label: string;
  };
  contact: {
    type: string;
    label: string;
  };
  kioscos: {
    type: string;
    label: string;
    values: string[];
  };
  operators: {
    type: string;
    label: string;
    values: string[];
  };
}

export default function Page() {
  const template = {
    title: {
      type: "input",
      label: "Nombre de ubicación",
    },
    address: {
      type: "input",
      label: "Dirección",
    },
    contact: {
      type: "input",
      label: "Contacto",
    },
    kioscos: {
      type: "datalist",
      label: "Kioscos",
      values: [],
    },
    operators: {
      type: "datalist",
      label: "Operadores",
      values: [],
    },
  };
  const initialData = {
    title: "",
    address: "",
    contact: "",
    kioscos: [],
    operators: [],
  };

  const detailOptions = [
    {
      label: "Borrar",
      icon: TrashIcon,
      action: deleteLocationReq,
      requiresAuth: true,
      warningTitle: "¿Desea borrar Ubicación?",
    },
    {
      label: "Ver Ubicación",
      icon: ManageIcon,
      action: goToLocationInfo,
      requiresAuth: false,
      warningTitle: "¿Desea borrar Ubicación?",
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = "Nueva Ubicación";

  const { token, setLoadingGlobal, isLoadingGlobal, handleToast } = useAuth();

  const [DetailCardCardState, setDetailCardState] = useState(false);
  const [detailCardTitle, setDetailCardTitle] = useState(initialTitle);
  const [initTemplate, setInitTemplate] = useState<Itemplate>(template);
  const [init, setInit] = useState<ILocation>(initialData);
  const [edit, setEdit] = useState<ILocation>(initialData);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [loading, SetLoading] = useState(false);
  const [canLoadMore, setCanLoadmore] = useState(true);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<ILocation[]>([]);
  const [page, setPage] = useState(1);
  const [saveTitle, setSaveTitle] = useState<string>("Guardar");
  const [detailCardLoading, setDetailCardLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [kioscosPage, setKioscosPage] = useState(1);
  const [locationId, setLocationId] = useState<string | null>(null);

  const handleInputs = (key: string, value: string) => {
    return setEdit((prev) => ({ ...prev, [key]: value }));
  };
  async function getLocationsReq(page: number, isDeleted: boolean = false) {
    setLoadingGlobal(true);
    const req = (await getLocations(token as string, page, 5)) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (req.state) {
        const data = req.data as ILocation[];
        if (data.length === 0) {
          if (isDeleted) {
            setFilteredLocations([]);
            setLocations([]);
          }
          return setCanLoadmore(false);
        }
        if (locations.length === 0) {
          setFilteredLocations(data);
          return setLocations(data);
        }
        if (page === 1 && locations.length !== 0) {
          setFilteredLocations(data);
          return setLocations(data);
        } else {
          setFilteredLocations((prev) => [...prev, ...data]);
          return setLocations((prev) => [...prev, ...data]);
        }
      } else {
        handleToast(
          "error",
          `Hubo un error buscando Ubicacions, error ${req.message}`,
        );
      }
    }
  }

  const getOperatorsReq = async () => {
    const req = (await getUsers(
      token as string,
      usersPage,
      5,
      true,
    )) as Response;

    if (req?.state) {
      const data = req.data as string[];
      if (data.length > 0) {
        const options = data.map((i: any) => ({
          label: i?.fullname,
          value: i?.userId,
        }));
        setInitTemplate((prev: any) => ({
          ...prev,
          operators: {
            ...prev.operators,
            values: [...options],
          },
        }));
      }
    }
  };

  const getKioscosReq = async (isNew = false) => {
    const req = (await getKioscos(
      token as string,
      kioscosPage,
      5,
      true,
    )) as Response;
    if (req.state) {
      if (Array.isArray(req.data) && req.data.length > 0) {
        const kioscosData = req.data.map((i: any) => ({
          label: i.title,
          value: i.kioscoId,
        }));
        setInitTemplate((prev: any) => ({
          ...prev,
          kioscos: {
            ...prev.kioscos,
            values: [...(kioscosData as any)],
          },
        }));
      } else if (Array.isArray(req.data) && req.data.length === 0 && isNew) {
        setInitTemplate((prev) => ({
          ...prev,
          kioscos: { ...prev.kioscos, values: [] },
        }));
      }
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    return getLocationsReq(nextPage);
  };

  const getLocationData = async (locationId: string) => {
    setLoadingGlobal(true);
    const req = (await getLocationById(
      token as string,
      locationId,
    )) as Response;
    if (req) {
      setLocationId(locationId);
      if (!req.state)
        return handleToast(
          "error",
          "Hubo un error obteniendo información de ubicación, intente más tarde",
        );
      setLoadingGlobal(false);
      if (req.data) {
        setIsNewLocation(false);
        const data = req.data as ILocation;
        setDetailCardTitle(data.title);
        setOptionsMarked(data);
        setInit(data);
        setEdit(data);
        router.push(`/locations?locationId=${data.locationId}`, {
          scroll: false,
        });
        setDetailCardState(true);
      }
    }
    await getKioscosReq();
  };

  const setOptionsMarked = (data: ILocation) => {
    const kioscoData = data.kioscos.map((i: any) => ({
      label: i.name,
      value: i.id,
      isChecked: true,
    }));
    const InitoperatorsTemplate = data.operators.map((i: any) => ({
      label: i.name,
      value: i.id,
      isChecked: true,
    }));

    const kioscoIds = [] as string[];
    const operatorsIds = [] as string[];

    data.kioscos.map((i: any) => kioscoIds.push(i.id));
    data.operators.map((i: any) => operatorsIds.push(i.id));

    const InitTemplatekiosco = initTemplate.kioscos.values.map((i: any) => ({
      ...i,
      isChecked: kioscoIds.includes(i.value),
    }));
    const InitTemplateOperators = initTemplate.operators.values.map(
      (i: any) => ({ ...i, isChecked: operatorsIds.includes(i.value) }),
    );

    const initMergeKioscos = [...kioscoData, ...InitTemplatekiosco];
    const initMergeOperators = [
      ...InitoperatorsTemplate,
      ...InitTemplateOperators,
    ];

    const uniqueKioscos = Array.from(
      new Map(initMergeKioscos.map((item) => [item.value, item])).values(),
    );
    const uniqueOperators = Array.from(
      new Map(initMergeOperators.map((item) => [item.value, item])).values(),
    );
    setInitTemplate((prev: any) => ({
      ...prev,
      kioscos: { ...prev.kioscos, values: uniqueKioscos },
    }));
    setInitTemplate((prev: any) => ({
      ...prev,
      operators: { ...prev.operators, values: uniqueOperators },
    }));
  };

  const hideDetailCard = () => {
    setDetailCardState(false);
    router.push("/locations", { scroll: false });
  };

  const handleNewLocation = async () => {
    setDetailCardState(true);
    setIsNewLocation(true);
    setInit(initialData);
    setEdit(initialData);
    router.push("/locations?isNew=true", { scroll: false });
    setDetailCardTitle(initialTitle);
    await getKioscosReq(true);
    await getOperatorsReq();
  };
  const handlecanSubmit = () => {
    return Object.keys(edit).every((item) => {
      const val = edit[item as keyof ILocation];
      if (Array.isArray(val)) {
        if (item === "kioscos") return true;
        return val.length > 0;
      }
      return val !== "";
    });
  };

  const updateLocation = async () => {
    const modifiedValues = {} as any;
    Object.keys(edit).forEach((key) => {
      const k = key && (key as keyof ILocation);
      if (Array.isArray(edit[k as keyof ILocation])) {
        const initArrayValues = init[k as keyof ILocation] as string[];
        const editArrayValues = edit[k as keyof ILocation] as string[];
        if (initArrayValues.length !== editArrayValues.length) {
          modifiedValues[k] = editArrayValues;
        } else {
          editArrayValues.forEach((i) => {
            if (!initArrayValues.includes(i)) {
            }
          });
        }
      }
      if (init[k as keyof ILocation] !== edit[k as keyof ILocation]) {
        modifiedValues[k] = edit[k as keyof ILocation];
      }
    });
    setDetailCardLoading(true);
    const transformedData = transformDataToUpdate(
      modifiedValues,
    ) as Partial<ILocation>;
    const req = (await updateLocationById(
      token as string,
      locationId as string,
      transformedData,
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        handleToast("success", "Ubicación actualizada correctamente");
        setInit(edit);
        setIsEdit(false);
        getLocationsReq(page);
      } else
        handleToast(
          "error",
          "Hubo un error actualizando, intente nuevamente o más tarde",
        );
    }
  };

  const transformData = () => {
    const kioscos = [] as any;
    const operators = [] as any;
    if (edit.kioscos.length > 0)
      edit.kioscos.forEach((i: any) => kioscos.push(i?.id));
    if (edit.operators.length > 0)
      edit.operators.forEach((i: any) => operators.push(i?.id));

    const copy = {
      ...edit,
      kioscos,
      operators,
    };
    return copy;
  };
  const transformDataToUpdate = (data: ILocation) => {
    const copy = { ...data };

    if (data?.operators) {
      if (data.operators.length > 0) {
        const ids = [] as any;
        data.operators.forEach((i: any) => {
          ids.push(i.id);
        });
        copy.operators = ids;
      }
    }
    if (data?.kioscos) {
      if (data.kioscos.length > 0) {
        const ids = [] as any;
        data.kioscos.forEach((i: any) => {
          ids.push(i.id);
        });
        copy.kioscos = ids;
      }
    }
    return copy;
  };
  const handleSubmit = async () => {
    if (!isNewLocation) {
      return await updateLocation();
    }
    setDetailCardLoading(true);
    const transformedData = transformData();
    const req = (await createLocation(
      token as string,
      transformedData,
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        router.replace(`/locations?locationId=${req.data}`, { scroll: false });
        handleToast("success", "Ubicaciónc creda correctamente");
        await getLocationsReq(page);
        setInit(edit);
        setIsNewLocation(false);
        setDetailCardTitle(edit.title);
        setIsEdit(false);
      } else {
        handleToast("error", req.message);
      }
    }
  };

  async function deleteLocationReq() {
    setDetailCardLoading(true);
    const req = (await deleteLocationById(
      token as string,
      locationId as string,
    )) as Response;
    if (req) {
      setDetailCardLoading(false);
      if (req.state) {
        setDetailCardState(false);
        router.push("/locations");
        handleToast("success", "Ubicación eliminada correctamente");
        getLocationsReq(page, true);
      } else {
        handleToast(
          "error",
          "No fue posible borrar ubicación, intente más tarde",
        );
      }
    }
  }

  function goToLocationInfo() {
    router.push(`/locations/locationsInfo?locationId=${locationId}`);
  }

  const handleListValues = (
    key: string | any,
    value: string | number,
    wasChecked: boolean = false,
    label: string,
  ) => {
    const currentValuesChecked: any = [];
    const editIds = edit[key as keyof ILocation] as string[];

    if (Array.isArray(editIds))
      editIds.map((i: any) => currentValuesChecked.push(i.id));
    const currentTemplateValues = initTemplate[
      key as keyof Pick<Itemplate, "kioscos" | "operators">
    ].values?.filter((i: any) => i.value === value)[0] as any;

    if (wasChecked) {
      if (!currentValuesChecked.includes(value)) {
        const newData = { id: value, name: label };
        setEdit((prev) => ({
          ...prev,
          [key]: [
            ...prev[key as keyof Pick<Itemplate, "kioscos" | "operators">],
            newData,
          ],
        }));
        currentTemplateValues.isChecked = true;
        const currentValues = [
          ...initTemplate[key as keyof Pick<Itemplate, "kioscos" | "operators">]
            .values,
        ].filter((i: any) => i.value !== value);
        const merge = [...currentValues, currentTemplateValues];
        setInitTemplate((prev) => ({
          ...prev,
          [key]: {
            ...prev[key as keyof Pick<Itemplate, "kioscos" | "operators">],
            values: merge,
          },
        }));
      }
    } else {
      if (currentValuesChecked.includes(value)) {
        const unckechValue = [
          ...initTemplate[key as keyof Pick<Itemplate, "kioscos" | "operators">]
            .values,
        ].filter((i: any) => i.value === value)[0] as any;
        const remainingValues = [
          ...initTemplate[key as keyof Pick<Itemplate, "kioscos" | "operators">]
            .values,
        ].filter((i: any) => i.value !== value);
        unckechValue.isChecked = false;
        const merge = [...remainingValues, unckechValue];
        const filterData = editIds.filter((i: any) => i.id !== value);
        setEdit((prev) => ({ ...prev, [key]: filterData }));

        setInitTemplate((prev) => ({
          ...prev,
          [key]: { ...prev[key as keyof Itemplate], values: merge },
        }));
      }
    }
  };
  const wasEdited = () => {
    const initKeys = Object.keys(init);
    return initKeys.some((key) => {
      const val1 = init[key as keyof ILocation];
      const val2 = edit[key as keyof ILocation];
      if (Array.isArray(val2) && Array.isArray(val1)) {
        if (val2.length === 0 && val1.length == 0) return false;
        if (val2.length > 0 && val1?.length == 0) {
          return true;
        }
        if (val2.length > 0 && val1.length > 0) {
          const val1Ids = Array.from(val1.map((i: any) => i.id));
          const val2Ids = Array.from(val2.map((i: any) => i.id));
          const different =
            val1Ids.some((id) => !val2Ids.includes(id)) ||
            val2Ids.some((id) => !val1Ids.includes(id));
          return different;
        }
      }
      return val1 !== val2;
    });
  };

  const handlefilter = (value: string) => {
    setFilterValue(value);
    const fileredLocations = locations.filter(
      (l) =>
        l.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()) ||
        l.contact.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
    );
    setFilteredLocations(fileredLocations);
  };

  useEffect(() => {
    getLocationsReq(page);
    getOperatorsReq();
    getKioscosReq();
    const newUser = searchParams.get("newUser");
    const locationId = searchParams.get("locationId");
    if (newUser) return setIsNewLocation(true);
    if (locationId) {
      setIsNewLocation(false);
      getLocationData(locationId);
    }
  }, []);

  useEffect(() => {
    setCanSubmit(handlecanSubmit());
    setIsEdit(wasEdited());
  }, [edit]);

  return (
    <>
      <Suspense fallback={null}>
        <DetailCard
          detailCardState={DetailCardCardState}
          handleDetailState={hideDetailCard}
          headerTitle={detailCardTitle}
          buttonSaveTitle={saveTitle}
          template={initTemplate}
          values={edit}
          handleValues={handleInputs}
          canSubmit={canSubmit}
          isEdit={isEdit}
          handleSubmit={handleSubmit}
          handleListValues={handleListValues}
          isLoading={detailCardLoading}
          isNewItem={isNewLocation}
          detailCardOptions={detailOptions}
        />
      </Suspense>
      <div className="main-content">
        <h1 className="main-header">Ubicaciones</h1>
        <div className="primary-column">
          <button className="primary-button" onClick={handleNewLocation}>
            Agregar Nuevo
          </button>

          <input
            type="text"
            placeholder="Buscar Ubicacion..."
            className="filter-input"
            value={filterValue}
            onChange={(e) => handlefilter(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Ubicación</th>
                <th className="">Dirección</th>
                <th className="">contacto</th>
                <th className="">Creado el</th>
                <th className="">Creado Por</th>
                <th className="">Kioscos</th>
                <th className="">Operadores</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location: ILocation) => (
                  <tr
                    key={location.locationId}
                    className=""
                    onClick={() =>
                      getLocationData(location.locationId as string)
                    }
                  >
                    <td className="">{location.title}</td>
                    <td className="">{location.address} </td>
                    <td className="">{location.contact}</td>
                    <td className="">{location.createdAt}</td>
                    <td className="">{location.createdBy}</td>
                    <td className="">{location.kioscos}</td>
                    <td className="">{location.operators}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="">
                    No se encontraron ubicaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className={"load-more-container"}>
            {canLoadMore ? (
              <button className={"load-more-button"} onClick={loadMore}>
                Cargar mas
              </button>
            ) : (
              <label>No hay más datos</label>
            )}
          </div>
        )}
      </div>
    </>
  );
}
