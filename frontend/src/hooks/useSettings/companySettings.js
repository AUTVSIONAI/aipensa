/** 
 * @TercioSantos-1 |
 * api/get/todas as configurações de 1 empresa |
 * api/get/1 configuração específica |
 * api/put/atualização de 1 configuração |
 */
import { useCallback, useMemo } from "react";
import api from "../../services/api";

const useCompanySettings = () => {

    const getAll = useCallback(async (companyId) => {
        const { data } = await api.request({
            url: `/companySettings/${companyId}`,
            method: "GET"
        });

        return data;
    }, []);

   const get = useCallback(async (params) => {
        const { data } = await api.request({
            url: "/companySettingOne",
            method: "GET",
            params
        });
        return data;
    }, []);

    const getTypePayment = useCallback(async (params) => {
        const { data } = await api.request({
            url: "/companySettingOnePayment",
            method: "GET",
            params
        });
        return data;
    }, []);


    const update = useCallback(async (data) => {
        const { data: responseData } = await api.request({
            url: "/companySettings",
            method: "PUT",
            data
        });
        return responseData;
    }, []);

    return useMemo(() => ({
        getAll,
        get,
        update,
        getTypePayment
    }), [getAll, get, update, getTypePayment]);
}

export default useCompanySettings;
